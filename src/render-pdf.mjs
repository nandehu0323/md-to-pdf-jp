/**
 * Markdown → PDF バッファ
 * - high quality: Pandoc + LaTeX engine (default: tectonic)
 * - fallback: Playwright HTML print
 */

import { chromium } from "playwright";
import { marked } from "marked";
import { buildPrintHtml } from "./build-html.mjs";
import { resolveLayout } from "./layout-options.mjs";
import { access, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { constants as fsConstants } from "node:fs";

const MAX_MARKDOWN_CHARS = 600_000;
const DEFAULT_PDF_ENGINE = "auto";
const TINYTEX_BIN_DIR = path.join(
  process.env.HOME ?? "",
  "Library",
  "TinyTeX",
  "bin",
  "universal-darwin"
);

/**
 * @typedef {"pandoc"|"playwright"} PdfRenderer
 */

/**
 * @param {string} markdown
 * @param {{
 *   title?: string,
 *   layout?: import("./layout-options.mjs").LayoutOptions | Record<string, unknown>,
 *   renderer?: PdfRenderer,
 *   pdfEngine?: string,
 * }} [options]
 * @returns {Promise<Buffer>}
 */
export async function markdownToPdfBuffer(markdown, options = {}) {
  const renderer = options.renderer ?? "pandoc";
  if (renderer === "playwright") {
    return markdownToPdfBufferPlaywright(markdown, options);
  }
  return markdownToPdfBufferPandoc(markdown, options);
}

/**
 * @param {string} markdown
 * @param {{
 *   title?: string,
 *   layout?: import("./layout-options.mjs").LayoutOptions | Record<string, unknown>,
 *   pdfEngine?: string,
 * }} [options]
 */
async function markdownToPdfBufferPandoc(markdown, options = {}) {
  if (markdown.length > MAX_MARKDOWN_CHARS) {
    throw new Error(
      `Markdown が長すぎます（最大 ${MAX_MARKDOWN_CHARS} 文字）`
    );
  }

  const title = options.title ?? "document";
  const requestedPdfEngine = options.pdfEngine ?? DEFAULT_PDF_ENGINE;
  const pdfEngine = await resolvePandocPdfEngine(requestedPdfEngine);
  const workDir = await mkdtemp(path.join(tmpdir(), "md-to-pdf-jp-"));
  try {
    const inputPath = path.join(workDir, "input.md");
    const outputPath = path.join(workDir, "output.pdf");
    await writeFile(inputPath, markdown, "utf8");

    const args = [
      inputPath,
      "-o",
      outputPath,
      "--from=markdown+footnotes+table_captions+pipe_tables+autolink_bare_uris+tex_math_dollars",
      "--pdf-engine",
      pdfEngine,
      "-V",
      `title=${title}`,
      "-V",
      "geometry=top=18mm,right=16mm,bottom=20mm,left=16mm",
      "-V",
      "fontsize=10pt",
      "-V",
      "documentclass=article",
      "-V",
      "CJKmainfont=Hiragino Mincho ProN",
      "-V",
      "CJKsansfont=Hiragino Sans",
      "-V",
      "monofont=Menlo",
      "-V",
      "colorlinks=true",
    ];

    await runCommand("pandoc", args, workDir);
    const pdf = await readFile(outputPath);
    return pdf;
  } catch (err) {
    if (err?.code === "ENOENT") {
      throw new Error(
        "Pandoc 実行に失敗しました。`pandoc` がインストールされているか確認してください。"
      );
    }
    throw new Error(
      `Pandoc で PDF 生成に失敗しました（engine=${pdfEngine}）。\n${String(
        err?.message ?? err
      )}`
    );
  } finally {
    await rm(workDir, { recursive: true, force: true });
  }
}

/**
 * @param {string} markdown
 * @param {{
 *   title?: string,
 *   layout?: import("./layout-options.mjs").LayoutOptions | Record<string, unknown>,
 * }} [options]
 */
async function markdownToPdfBufferPlaywright(markdown, options = {}) {
  if (markdown.length > MAX_MARKDOWN_CHARS) {
    throw new Error(
      `Markdown が長すぎます（最大 ${MAX_MARKDOWN_CHARS} 文字）`
    );
  }

  const layout = resolveLayout(
    options.layout && typeof options.layout === "object" ? options.layout : {}
  );
  const title = options.title ?? "document";

  marked.setOptions({
    gfm: true,
    breaks: false,
  });
  const bodyHtml = await marked.parse(markdown);
  const html = buildPrintHtml(bodyHtml, { title, layout });

  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.setContent(html, {
      waitUntil: "networkidle",
      timeout: 120_000,
    });
    const { marginsMm, footerFontPt } = layout;
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: "<div></div>",
      footerTemplate: `<div style="width:100%;font-size:${footerFontPt}pt;text-align:center;color:#333;padding:0 6mm 1mm;font-family:'Hiragino Mincho ProN','Yu Mincho','Noto Serif JP',serif;"><span class="pageNumber"></span></div>`,
      margin: {
        top: `${marginsMm.top}mm`,
        right: `${marginsMm.right}mm`,
        bottom: `${marginsMm.bottom}mm`,
        left: `${marginsMm.left}mm`,
      },
      preferCSSPageSize: true,
    });
    return pdfBuffer;
  } finally {
    await browser.close();
  }
}

/**
 * プレビュー用 HTML（CSS近似）
 * @param {string} markdown
 * @param {{
 *   title?: string,
 *   layout?: import("./layout-options.mjs").LayoutOptions | Record<string, unknown>,
 * }} [options]
 */
export async function markdownToPreviewHtml(markdown, options = {}) {
  if (markdown.length > MAX_MARKDOWN_CHARS) {
    throw new Error(
      `Markdown が長すぎます（最大 ${MAX_MARKDOWN_CHARS} 文字）`
    );
  }
  const layout = resolveLayout(
    options.layout && typeof options.layout === "object" ? options.layout : {}
  );
  const title = options.title ?? "preview";
  marked.setOptions({ gfm: true, breaks: false });
  const bodyHtml = await marked.parse(markdown);
  return buildPrintHtml(bodyHtml, { title, layout });
}

function runCommand(cmd, args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { cwd, stdio: ["ignore", "pipe", "pipe"] });
    let stderr = "";
    child.stderr.on("data", (d) => {
      stderr += d.toString();
    });
    child.on("error", (err) => reject(err));
    child.on("close", (code) => {
      if (code === 0) return resolve();
      reject(
        new Error(
          `${cmd} が失敗しました (exit=${code}). ${stderr.trim().slice(0, 2000)}`
        )
      );
    });
  });
}

async function resolvePandocPdfEngine(requested) {
  if (requested && requested !== "auto") {
    const found = await findExecutable(requested);
    if (found) return found;
    throw new Error(
      `指定された PDF エンジンが見つかりません: ${requested}`
    );
  }

  const xelatex = await findExecutable("xelatex");
  if (xelatex) return xelatex;

  const lualatex = await findExecutable("lualatex");
  if (lualatex) return lualatex;

  const tectonic = await findExecutable("tectonic");
  if (tectonic) return tectonic;

  throw new Error(
    "利用可能な PDF エンジンが見つかりません（xelatex/lualatex/tectonic）。\n" +
      "推奨: `brew install --cask basictex` で xelatex を導入してください。"
  );
}

async function findExecutable(cmd) {
  if (cmd.includes(path.sep)) {
    return (await canExecute(cmd)) ? cmd : null;
  }

  const foundInPath = await whichPath(cmd);
  if (foundInPath) return foundInPath;

  const tinytexPath = path.join(TINYTEX_BIN_DIR, cmd);
  if (await canExecute(tinytexPath)) return tinytexPath;

  return null;
}

function whichPath(cmd) {
  return new Promise((resolve) => {
    const p = spawn("which", [cmd], { stdio: ["ignore", "pipe", "ignore"] });
    let stdout = "";
    p.stdout.on("data", (d) => {
      stdout += d.toString();
    });
    p.on("error", () => resolve(null));
    p.on("close", (code) => {
      if (code !== 0) return resolve(null);
      const out = stdout.trim();
      resolve(out || null);
    });
  });
}

async function canExecute(filePath) {
  try {
    await access(filePath, fsConstants.X_OK);
    return true;
  } catch {
    return false;
  }
}
