/**
 * Markdown 本文を、印刷向けスタイル付き HTML に包む。
 * Google Fonts: Noto Sans JP（本文）、Shippori Mincho（見出し）、JetBrains Mono（コード）
 */

const GOOGLE_FONTS_HREF =
  "https://fonts.googleapis.com/css2?" +
  [
    "family=JetBrains+Mono:wght@400;500",
    "family=Noto+Sans+JP:wght@400;500;700",
    "family=Shippori+Mincho:wght@500;600",
    "display=swap",
  ].join("&");

const DEFAULT_CSS = `
:root {
  --ink: #1a1a1a;
  --muted: #5c5c5c;
  --rule: #d8d8d8;
  --code-bg: #f4f4f2;
  --accent: #2c5282;
}

@page {
  size: A4;
  margin: 22mm 20mm 24mm;
}

* {
  box-sizing: border-box;
}

html {
  font-size: 10.5pt;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

body {
  margin: 0;
  color: var(--ink);
  font-family: "Noto Sans JP", "Hiragino Sans", "Hiragino Kaku Gothic ProN",
    "Yu Gothic UI", "Yu Gothic", Meiryo, sans-serif;
  font-weight: 400;
  line-height: 1.75;
  letter-spacing: 0.02em;
  font-feature-settings: "palt" 1;
  text-rendering: optimizeLegibility;
}

main {
  max-width: 100%;
}

h1, h2, h3, h4 {
  font-family: "Shippori Mincho", "Noto Serif JP", "Hiragino Mincho ProN",
    "Yu Mincho", serif;
  font-weight: 600;
  line-height: 1.35;
  letter-spacing: 0.04em;
  color: var(--ink);
  page-break-after: avoid;
  break-after: avoid-page;
}

h1 {
  font-size: 1.65rem;
  margin: 0 0 1.25rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--rule);
}

h2 {
  font-size: 1.35rem;
  margin: 1.75rem 0 0.85rem;
}

h3 {
  font-size: 1.15rem;
  margin: 1.35rem 0 0.65rem;
}

h4 {
  font-size: 1.05rem;
  margin: 1.1rem 0 0.5rem;
}

p {
  margin: 0 0 0.85em;
  orphans: 3;
  widows: 3;
}

a {
  color: var(--accent);
  text-decoration: none;
  border-bottom: 1px solid rgba(44, 82, 130, 0.35);
}

ul, ol {
  margin: 0 0 1em;
  padding-left: 1.35em;
}

li {
  margin: 0.25em 0;
}

blockquote {
  margin: 1em 0;
  padding: 0.65em 1em 0.65em 1.1em;
  border-left: 3px solid var(--accent);
  background: rgba(44, 82, 130, 0.06);
  color: var(--muted);
  font-style: normal;
}

blockquote p:last-child {
  margin-bottom: 0;
}

hr {
  border: none;
  border-top: 1px solid var(--rule);
  margin: 1.5rem 0;
}

code, kbd {
  font-family: "JetBrains Mono", "Noto Sans Mono", "Osaka-Mono", monospace;
  font-size: 0.88em;
  background: var(--code-bg);
  padding: 0.12em 0.35em;
  border-radius: 3px;
}

pre {
  font-family: "JetBrains Mono", "Noto Sans Mono", monospace;
  font-size: 0.82rem;
  line-height: 1.55;
  background: var(--code-bg);
  border: 1px solid var(--rule);
  border-radius: 6px;
  padding: 0.85em 1em;
  overflow: auto;
  page-break-inside: avoid;
  break-inside: avoid;
}

pre code {
  background: none;
  padding: 0;
  font-size: inherit;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95em;
  margin: 1em 0;
  page-break-inside: avoid;
  break-inside: avoid;
}

th, td {
  border: 1px solid var(--rule);
  padding: 0.45em 0.65em;
  vertical-align: top;
}

th {
  background: rgba(0, 0, 0, 0.04);
  font-weight: 700;
}

img {
  max-width: 100%;
  height: auto;
  page-break-inside: avoid;
}

figure {
  margin: 1em 0;
  text-align: center;
}

figcaption {
  font-size: 0.9em;
  color: var(--muted);
  margin-top: 0.35em;
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
  <main>
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
