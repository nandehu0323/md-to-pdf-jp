#!/usr/bin/env node
/**
 * Markdown → 日本語向け PDF（CLI）
 * 使用: md-to-pdf-jp <input.md> [-o out.pdf] [--title タイトル]
 *       [--font-size 9] [--margin 14] [--margin-bottom 24]
 */

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { markdownToPdfBuffer } from "./render-pdf.mjs";

function parseArgs(argv) {
  const args = {
    input: null,
    output: null,
    title: null,
    fontSizePt: null,
    marginMm: null,
    marginBottomMm: null,
    latex: false,
    latexNoAutoNumbers: false,
    renderer: "pandoc",
    pdfEngine: "auto",
  };
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
    if (a === "--font-size") {
      args.fontSizePt = Number(rest.shift());
      continue;
    }
    if (a === "--margin") {
      args.marginMm = Number(rest.shift());
      continue;
    }
    if (a === "--margin-bottom") {
      args.marginBottomMm = Number(rest.shift());
      continue;
    }
    if (a === "--latex") {
      args.latex = true;
      continue;
    }
    if (a === "--latex-no-auto-numbers") {
      args.latexNoAutoNumbers = true;
      continue;
    }
    if (a === "--renderer") {
      args.renderer = rest.shift() ?? "pandoc";
      continue;
    }
    if (a === "--pdf-engine") {
      args.pdfEngine = rest.shift() ?? "tectonic";
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
    [--renderer pandoc|playwright] [--pdf-engine auto|xelatex|lualatex|tectonic]
    [--font-size <pt>] [--margin <mm>] [--margin-bottom <mm>] [--latex]

例:
  md-to-pdf-jp report.md -o report.pdf
  md-to-pdf-jp notes.md --title "会議メモ" --font-size 8.5 --margin 12

レイアウト既定（省略時）:
  フォント約 9pt、上・左右余白 14mm、下余白 24mm（ページ番号分を含む）

フォント（Google Fonts）:
  本文・見出し: Noto Serif JP（論文調の明朝）
  コード: JetBrains Mono

--latex:
  LaTeX article 風（先頭の ## より前を1段、以降を2段。節番号は CSS で付与）。
--latex-no-auto-numbers:
  --latex と併用。見出しに「1」「1.1」を自動付与しない（本文が「## 1.」形式のとき向け）。
--renderer:
  PDF生成エンジン。既定は pandoc（高品質）。互換用に playwright も指定可能。
--pdf-engine:
  Pandoc で使う PDF エンジン。既定 auto（xelatex > lualatex > tectonic）。

Web UI:
  npm run web のあと http://127.0.0.1:3847/ でブラウザから調整・PDF 保存
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

  const layout = {};
  if (Number.isFinite(args.fontSizePt)) layout.fontSizePt = args.fontSizePt;
  if (Number.isFinite(args.marginMm)) layout.marginMm = args.marginMm;
  if (Number.isFinite(args.marginBottomMm))
    layout.marginBottomMm = args.marginBottomMm;
  if (args.latex) layout.latexArticleStyle = true;
  if (args.latexNoAutoNumbers) layout.latexAutoSectionNumbers = false;

  const renderer =
    args.renderer === "playwright" || args.renderer === "pandoc"
      ? args.renderer
      : "pandoc";
  const pdfBuffer = await markdownToPdfBuffer(md, {
    title,
    layout,
    renderer,
    pdfEngine: args.pdfEngine ?? "auto",
  });
  await writeFile(outputPath, pdfBuffer);

  console.log(`PDF を出力しました: ${outputPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
