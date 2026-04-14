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

  return {
    fontSizePt,
    maxWidthRem,
    lineHeight,
    marginMm,
    marginBottomMm: marginsMm.bottom,
    marginsMm,
    footerFontPt,
  };
}

function clampNum(v, min, max, fallback) {
  const n = typeof v === "number" && !Number.isNaN(v) ? v : fallback;
  return Math.min(max, Math.max(min, n));
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
  });
}

function num(v) {
  if (v == null) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}
