/**
 * Markdown → PDF バッファ（Playwright）
 */

import { chromium } from "playwright";
import { marked } from "marked";
import { buildPrintHtml } from "./build-html.mjs";
import { resolveLayout } from "./layout-options.mjs";

const MAX_MARKDOWN_CHARS = 600_000;

/**
 * @param {string} markdown
 * @param {{ title?: string, layout?: import("./layout-options.mjs").LayoutOptions | Record<string, unknown> }} [options]
 * @returns {Promise<Buffer>}
 */
export async function markdownToPdfBuffer(markdown, options = {}) {
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
 * プレビュー用 HTML（同じスタイル）
 * @param {string} markdown
 * @param {{ title?: string, layout?: import("./layout-options.mjs").LayoutOptions | Record<string, unknown> }} [options]
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
