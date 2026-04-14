/**
 * 先頭の ## より手前を masthead（1段）、以降を 2段組に分割する。
 * LaTeX article の「タイトル・要旨 → 本編」のイメージ。
 * @param {string} bodyHtml marked 出力の body 内 HTML
 * @returns {{ html: string, wrapped: boolean }}
 */
export function wrapLatexArticleBody(bodyHtml) {
  const trimmed = bodyHtml.trim();
  if (!trimmed) return { html: bodyHtml, wrapped: false };

  const re = /<h2[\s>]/i;
  const m = re.exec(trimmed);
  if (!m || m.index === undefined || m.index === 0) {
    return { html: bodyHtml, wrapped: false };
  }

  const mast = trimmed.slice(0, m.index).trim();
  const cols = trimmed.slice(m.index).trim();
  if (!mast || !cols) return { html: bodyHtml, wrapped: false };

  const html = `<div class="latex-masthead">${mast}</div>
<div class="latex-columns">${cols}</div>`;
  return { html, wrapped: true };
}
