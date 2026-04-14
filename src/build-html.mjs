/**
 * Markdown 本文を、印刷向けスタイル付き HTML に包む。
 * 論文調: Noto Serif JP（本文・見出し）、JetBrains Mono（コード）
 */

import { resolveLayout } from "./layout-options.mjs";
import { wrapLatexArticleBody } from "./latex-article.mjs";

const GOOGLE_FONTS_HREF =
  "https://fonts.googleapis.com/css2?" +
  [
    "family=JetBrains+Mono:wght@400;500",
    "family=Noto+Serif+JP:wght@400;600;700",
    "display=swap",
  ].join("&");

/**
 * @param {import("./layout-options.mjs").LayoutOptions} layout
 */
export function buildPaperCss(layout) {
  const { marginsMm, fontSizePt, maxWidthRem, lineHeight, latexArticleStyle } =
    layout;
  const latexBlock = latexArticleStyle ? latexArticleCss(layout) : "";
  return `
:root {
  --ink: #111;
  --muted: #444;
  --rule: #bbb;
  --code-bg: #f6f5f3;
  --accent: #1a365d;
}

@page {
  size: A4;
  margin: ${marginsMm.top}mm ${marginsMm.right}mm ${marginsMm.bottom}mm ${marginsMm.left}mm;
}

* {
  box-sizing: border-box;
}

html {
  font-size: ${fontSizePt}pt;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

body {
  margin: 0;
  color: var(--ink);
  font-family: "Noto Serif JP", "Hiragino Mincho ProN", "Yu Mincho",
    "MS PMincho", serif;
  font-weight: 400;
  line-height: ${lineHeight};
  letter-spacing: 0.03em;
  font-feature-settings: "palt" 1;
  text-rendering: optimizeLegibility;
}

main.paper {
  max-width: ${maxWidthRem}rem;
  margin: 0 auto;
  text-align: justify;
  text-justify: inter-character;
}

h1, h2, h3, h4 {
  font-family: "Noto Serif JP", "Hiragino Mincho ProN", "Yu Mincho", serif;
  font-weight: 700;
  line-height: 1.4;
  letter-spacing: 0.06em;
  color: var(--ink);
  text-align: left;
  page-break-after: avoid;
  break-after: avoid-page;
}

main.paper > h1:first-child {
  text-align: center;
  font-size: 1.55rem;
  font-weight: 700;
  margin: 0 0 2.25rem;
  padding: 0 0 1rem;
  border-bottom: 3px double var(--ink);
}

main.paper > h1:not(:first-child) {
  font-size: 1.25rem;
  margin: 2rem 0 1rem;
  padding-bottom: 0.35rem;
  border-bottom: 1px solid var(--ink);
}

h2 {
  font-size: 1.12rem;
  font-weight: 700;
  margin: 2.25rem 0 0.9rem;
  padding-bottom: 0.2rem;
  border-bottom: 1px solid var(--rule);
}

h3 {
  font-size: 1.05rem;
  font-weight: 700;
  margin: 1.6rem 0 0.65rem;
}

h4 {
  font-size: 1rem;
  font-weight: 600;
  margin: 1.35rem 0 0.5rem;
}

p {
  margin: 0 0 0.55em;
  orphans: 3;
  widows: 3;
}

main.paper p + p {
  text-indent: 1em;
}

h1 + p, h2 + p, h3 + p, h4 + p,
blockquote + p,
ul + p, ol + p,
pre + p,
figure + p,
table + p,
hr + p {
  text-indent: 0;
}

a {
  color: var(--accent);
  text-decoration: none;
  border-bottom: 1px solid rgba(26, 54, 93, 0.35);
}

ul, ol {
  margin: 0.5em 0 1em;
  padding-left: 1.5em;
  text-align: left;
}

li {
  margin: 0.2em 0;
}

li p {
  text-indent: 0;
}

blockquote {
  margin: 1.15em 2em;
  padding: 0.5em 0;
  border: none;
  border-top: 1px solid var(--rule);
  border-bottom: 1px solid var(--rule);
  background: transparent;
  color: var(--muted);
  font-size: 0.98em;
  line-height: 1.85;
  font-style: normal;
  text-align: justify;
}

blockquote p {
  text-indent: 0 !important;
  margin-bottom: 0.4em;
}

blockquote p:last-child {
  margin-bottom: 0;
}

hr {
  border: none;
  border-top: 1px solid var(--rule);
  margin: 2rem 0;
}

code, kbd {
  font-family: "JetBrains Mono", "Noto Sans Mono", "Osaka-Mono", monospace;
  font-size: 0.86em;
  background: var(--code-bg);
  padding: 0.08em 0.3em;
  border: 1px solid #e2e0dc;
  border-radius: 2px;
}

pre {
  font-family: "JetBrains Mono", "Noto Sans Mono", monospace;
  font-size: 0.8rem;
  line-height: 1.5;
  background: var(--code-bg);
  border: 1px solid var(--rule);
  border-radius: 2px;
  padding: 0.75em 0.9em;
  overflow: auto;
  page-break-inside: avoid;
  break-inside: avoid;
  text-align: left;
}

pre code {
  background: none;
  border: none;
  padding: 0;
  font-size: inherit;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.94em;
  margin: 1em 0;
  page-break-inside: avoid;
  break-inside: avoid;
}

th, td {
  border: 1px solid var(--rule);
  padding: 0.4em 0.55em;
  vertical-align: top;
}

th {
  background: rgba(0, 0, 0, 0.035);
  font-weight: 700;
}

img {
  max-width: 100%;
  height: auto;
  page-break-inside: avoid;
}

figure {
  margin: 1.15em 0;
  text-align: center;
}

figcaption {
  font-size: 0.88em;
  color: var(--muted);
  margin-top: 0.4em;
  text-align: center;
  line-height: 1.6;
}
${latexBlock}
`;
}

/**
 * LaTeX article 風（表題ブロック 1 段・以降 2 段）。
 * `latexAutoSectionNumbers` が false のときは 2 段のみ（見出し本文に「1.」があるドキュメント向け）。
 * @param {import("./layout-options.mjs").LayoutOptions} layout
 */
function latexArticleCss(layout) {
  const autoNum = layout.latexAutoSectionNumbers !== false;
  const sectionCounters = autoNum
    ? `
main.paper.latex-article .latex-columns {
  counter-reset: latex-section;
}
main.paper.latex-article .latex-columns h2 {
  counter-increment: latex-section;
  counter-reset: latex-subsection;
}
main.paper.latex-article .latex-columns h2::before {
  content: counter(latex-section) " ";
  font-weight: 700;
}
main.paper.latex-article .latex-columns h3 {
  counter-increment: latex-subsection;
}
main.paper.latex-article .latex-columns h3::before {
  content: counter(latex-section) "." counter(latex-subsection) " ";
  font-weight: 700;
}
`
    : "";

  return `
/* --- LaTeX article 風（HTML/CSS での近似） --- */
main.paper.latex-article {
  max-width: 100%;
}

main.paper.latex-article .latex-masthead {
  margin-bottom: 0.75rem;
}

main.paper.latex-article .latex-masthead > h1:first-child {
  text-align: center;
  font-size: 1.55rem;
  font-weight: 700;
  margin: 0 0 1.25rem;
  padding: 0 0 1rem;
  border-bottom: 3px double var(--ink);
}

main.paper.latex-article .latex-masthead > h1:not(:first-child) {
  font-size: 1.2rem;
  margin: 1.25rem 0 0.65rem;
  padding-bottom: 0.25rem;
  border-bottom: 1px solid var(--ink);
  text-align: left;
}

main.paper.latex-article .latex-masthead blockquote {
  margin: 0.6em 0.5em 1rem;
  padding: 0.65em 0.9em;
  border: 1px solid var(--rule);
  border-radius: 2px;
  background: rgba(0, 0, 0, 0.02);
  font-size: 0.96em;
  line-height: 1.75;
}

main.paper.latex-article .latex-masthead blockquote p {
  text-indent: 0 !important;
}

main.paper.latex-article .latex-columns {
  -webkit-column-count: 2;
  column-count: 2;
  -webkit-column-gap: 5.5mm;
  column-gap: 5.5mm;
  -webkit-column-fill: balance;
  column-fill: balance;
  text-align: justify;
  text-justify: inter-character;
}
${sectionCounters}
main.paper.latex-article .latex-columns h2,
main.paper.latex-article .latex-columns h3 {
  break-after: avoid;
  page-break-after: avoid;
  column-span: none;
}

main.paper.latex-article .latex-columns h2 {
  border-bottom: none;
  padding-bottom: 0;
  font-size: 1.08rem;
  font-weight: 700;
  margin: 1rem 0 0.5rem;
  text-align: left;
}

main.paper.latex-article .latex-columns h3 {
  font-size: 0.98rem;
  font-weight: 700;
  margin: 0.85rem 0 0.4rem;
}

main.paper.latex-article .latex-columns table,
main.paper.latex-article .latex-columns pre,
main.paper.latex-article .latex-columns figure {
  column-span: all;
  margin-top: 0.75em;
  margin-bottom: 0.75em;
}

main.paper.latex-article .latex-columns pre {
  text-align: left;
}
`;
}

/**
 * @param {string} bodyHtml marked で得た本文 HTML
 * @param {{ title?: string, layout?: import("./layout-options.mjs").LayoutOptions | Record<string, unknown> }} [opts]
 */
export function buildPrintHtml(bodyHtml, opts = {}) {
  const title = opts.title ?? "Document";
  const layout = resolveLayout(
    opts.layout && typeof opts.layout === "object" ? opts.layout : {}
  );

  let inner = bodyHtml;
  let mainClass = "paper";
  if (layout.latexArticleStyle) {
    const { html, wrapped } = wrapLatexArticleBody(bodyHtml);
    if (wrapped) {
      inner = html;
      mainClass = "paper latex-article";
    }
  }

  const css = buildPaperCss(layout);
  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="stylesheet" href="${GOOGLE_FONTS_HREF}" />
  <style>${css}</style>
</head>
<body>
  <main class="${mainClass}">
${inner}
  </main>
</body>
</html>`;
}

function escapeHtml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
