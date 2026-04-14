/**
 * 印刷レイアウトの既定値と正規化。
 * デフォルトは余白を抑え、本文フォントをやや小さめにする。
 */

/**
 * @typedef {{
 *   fontSizePt: number,
 *   maxWidthRem: number,
 *   lineHeight: number,
 *   marginMm: number,
 *   marginBottomMm: number,
 *   marginsMm: { top: number, right: number, bottom: number, left: number },
 *   footerFontPt: number,
 *   latexArticleStyle: boolean,
 *   latexAutoSectionNumbers: boolean,
 * }} LayoutOptions
 */

/** @typedef {{ top: number, right: number, bottom: number, left: number }} MarginsMm */

/**
 * @param {Partial<LayoutOptions>} [partial]
 * @returns {LayoutOptions}
 */
export function resolveLayout(partial = {}) {
  const fontSizePt = clampNum(partial.fontSizePt, 7, 12, 9);
  const maxWidthRem = clampNum(partial.maxWidthRem, 28, 44, 36);
  const lineHeight = clampNum(partial.lineHeight, 1.55, 2.1, 1.85);

  const marginMm = clampNum(partial.marginMm, 8, 28, 14);
  const marginBottomMm =
    partial.marginBottomMm != null
      ? clampNum(partial.marginBottomMm, 14, 40, marginMm + 10)
      : marginMm + 10;

  /** @type {MarginsMm} */
  const marginsMm = {
    top: marginMm,
    right: marginMm,
    bottom: marginBottomMm,
    left: marginMm,
  };

  const footerFontPt = clampNum(
    partial.footerFontPt,
    6,
    11,
    Math.min(11, fontSizePt - 0.5)
  );

  const latexArticleStyle = boolish(partial.latexArticleStyle, false);
  const latexAutoSectionNumbers = boolish(partial.latexAutoSectionNumbers, true);

  return {
    fontSizePt,
    maxWidthRem,
    lineHeight,
    marginMm,
    marginBottomMm: marginsMm.bottom,
    marginsMm,
    footerFontPt,
    latexArticleStyle,
    latexAutoSectionNumbers,
  };
}

function clampNum(v, min, max, fallback) {
  const n = typeof v === "number" && !Number.isNaN(v) ? v : fallback;
  return Math.min(max, Math.max(min, n));
}

/** @param {unknown} v */
function boolish(v, fallback) {
  if (typeof v === "boolean") return v;
  if (v === "true" || v === 1 || v === "1") return true;
  if (v === "false" || v === 0 || v === "0") return false;
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    if (s === "true" || s === "yes" || s === "on") return true;
    if (s === "false" || s === "no" || s === "off") return false;
  }
  return fallback;
}

/**
 * API / CLI からの生オブジェクトを受け取り正規化する。
 * @param {unknown} raw
 */
export function parseLayoutFromBody(raw) {
  if (raw == null || typeof raw !== "object") return resolveLayout();
  const o = /** @type {Record<string, unknown>} */ (raw);
  return resolveLayout({
    fontSizePt: num(o.fontSizePt),
    maxWidthRem: num(o.maxWidthRem),
    lineHeight: num(o.lineHeight),
    marginMm: num(o.marginMm),
    marginBottomMm: num(o.marginBottomMm),
    footerFontPt: num(o.footerFontPt),
    latexArticleStyle: o.latexArticleStyle,
    latexAutoSectionNumbers: o.latexAutoSectionNumbers,
  });
}

function num(v) {
  if (v == null) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}
