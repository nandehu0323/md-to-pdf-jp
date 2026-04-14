#!/usr/bin/env node
/**
 * Markdown → 日本語向け PDF（CLI）
 * 使用: md-to-pdf-jp <input.md> [-o out.pdf] [--title タイトル]
 */

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { marked } from "marked";
import { chromium } from "playwright";
import { buildPrintHtml } from "./build-html.mjs";

function parseArgs(argv) {
  const args = { input: null, output: null, title: null };
  const rest = [...argv];
  while (rest.length) {
    const a = rest.shift();
    if (a === "-o" || a === "--output") {
      args.output = rest.shift() ?? null;
      continue;
    }
    if (a === "--title") {
      args.title = rest.shift() ?? null;
      continue;
    }
    if (a === "-h" || a === "--help") {
      args.help = true;
      continue;
    }
    if (!a.startsWith("-") && !args.input) {
      args.input = a;
      continue;
    }
    console.error("不明な引数:", a);
    process.exit(1);
  }
  return args;
}

function printHelp() {
  console.log(`md-to-pdf-jp — Markdown を日本語向け PDF に変換

使用法:
  md-to-pdf-jp <入力.md> [-o <出力.pdf>] [--title <文書タイトル>]

例:
  md-to-pdf-jp report.md -o report.pdf
  md-to-pdf-jp notes.md --title "会議メモ"

フォント（Google Fonts）:
  本文・見出し: Noto Serif JP（論文調の明朝）
  コード: JetBrains Mono
`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    process.exit(0);
  }
  if (!args.input) {
    printHelp();
    process.exit(1);
  }

  const inputPath = path.resolve(args.input);
  const baseName = path.basename(inputPath, path.extname(inputPath));
  const outputPath = args.output
    ? path.resolve(args.output)
    : path.join(path.dirname(inputPath), `${baseName}.pdf`);

  const md = await readFile(inputPath, "utf8");
  const title = args.title ?? baseName;

  marked.setOptions({
    gfm: true,
    breaks: false,
  });
  const bodyHtml = await marked.parse(md);
  const html = buildPrintHtml(bodyHtml, { title });

  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.setContent(html, {
      waitUntil: "networkidle",
      timeout: 120_000,
    });
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: "<div></div>",
      footerTemplate: `<div style="width:100%;font-size:9pt;text-align:center;color:#333;padding:0 8mm 2mm;font-family:'Hiragino Mincho ProN','Yu Mincho','Noto Serif JP',serif;"><span class="pageNumber"></span></div>`,
      margin: {
        top: "24mm",
        right: "24mm",
        bottom: "32mm",
        left: "24mm",
      },
      preferCSSPageSize: true,
    });
    await writeFile(outputPath, pdfBuffer);
  } finally {
    await browser.close();
  }

  console.log(`PDF を出力しました: ${outputPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
