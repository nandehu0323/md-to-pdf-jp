/**
 * Markdown 本文を、印刷向けスタイル付き HTML に包む。
 * 論文調: Noto Serif JP（本文・見出し）、JetBrains Mono（コード）
 */

const GOOGLE_FONTS_HREF =
  "https://fonts.googleapis.com/css2?" +
  [
    "family=JetBrains+Mono:wght@400;500",
    "family=Noto+Serif+JP:wght@400;600;700",
    "display=swap",
  ].join("&");

const DEFAULT_CSS = `
:root {
  --ink: #111;
  --muted: #444;
  --rule: #bbb;
  --code-bg: #f6f5f3;
  --accent: #1a365d;
}

@page {
  size: A4;
  margin: 24mm 24mm 30mm;
}

* {
  box-sizing: border-box;
}

html {
  font-size: 10.25pt;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

body {
  margin: 0;
  color: var(--ink);
  font-family: "Noto Serif JP", "Hiragino Mincho ProN", "Yu Mincho",
    "MS PMincho", serif;
  font-weight: 400;
  line-height: 1.9;
  letter-spacing: 0.03em;
  font-feature-settings: "palt" 1;
  text-rendering: optimizeLegibility;
}

/* 学術文書風: 読みやすいカラム幅で中央寄せ */
main.paper {
  max-width: 38rem;
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

/* 先頭の h1 を表題（中央・二重下線） */
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

/* 節番号の見た目を付けやすいよう、h2 は下線で区切る */
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

/* 見出し直後以外は字下げ（横書き学術文の一般的な体裁） */
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
`;

/**
 * @param {string} bodyHtml marked で得た本文 HTML
 * @param {{ title?: string }} [opts]
 */
export function buildPrintHtml(bodyHtml, opts = {}) {
  const title = opts.title ?? "Document";
  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="stylesheet" href="${GOOGLE_FONTS_HREF}" />
  <style>${DEFAULT_CSS}</style>
</head>
<body>
  <main class="paper">
${bodyHtml}
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
