const mdEl = document.getElementById("md");
const mdFile = document.getElementById("mdFile");
const preview = document.getElementById("preview");
const docTitle = document.getElementById("docTitle");
const btnPdf = document.getElementById("btnPdf");
const statusEl = document.getElementById("status");

const fontSizePt = document.getElementById("fontSizePt");
const marginMm = document.getElementById("marginMm");
const marginBottomMm = document.getElementById("marginBottomMm");
const maxWidthRem = document.getElementById("maxWidthRem");
const lineHeight = document.getElementById("lineHeight");
const latexArticleStyle = document.getElementById("latexArticleStyle");

const fontSizeVal = document.getElementById("fontSizeVal");
const marginVal = document.getElementById("marginVal");
const marginBottomVal = document.getElementById("marginBottomVal");
const maxWidthVal = document.getElementById("maxWidthVal");
const lineHeightVal = document.getElementById("lineHeightVal");

const SAMPLE = `# サンプル表題（LaTeX 風を ON にすると要旨が1段・本文が2段）

> **Abstract.** 最初の \`##\` より前が **1段組**（表題・要旨）。チェックを入れると **2段組** と節番号が付きます。

## Introduction

吾輩は猫である。名前はまだない。どこで生れたかとんと見当がつかぬ。何でも薄暗いじめじめした所でニャーニャー泣いていたことだけは記憶している。

### サブ節の例

小見出しには 1.1 のように番号が付きます。

## Related Work

続きの節は番号が 2 から始まります。表やコードは段をまたいで通し幅になります。

`;

let previewTimer = null;

function readLayout() {
  return {
    fontSizePt: Number(fontSizePt.value),
    marginMm: Number(marginMm.value),
    marginBottomMm: Number(marginBottomMm.value),
    maxWidthRem: Number(maxWidthRem.value),
    lineHeight: Number(lineHeight.value),
    latexArticleStyle: Boolean(latexArticleStyle.checked),
  };
}

function syncLabels() {
  fontSizeVal.textContent = fontSizePt.value;
  marginVal.textContent = marginMm.value;
  marginBottomVal.textContent = marginBottomMm.value;
  maxWidthVal.textContent = maxWidthRem.value;
  lineHeightVal.textContent = lineHeight.value;
}

function schedulePreview() {
  if (previewTimer) clearTimeout(previewTimer);
  previewTimer = setTimeout(runPreview, 400);
}

async function runPreview() {
  statusEl.textContent = "プレビュー更新中…";
  btnPdf.disabled = true;
  try {
    const res = await fetch("/api/preview-html", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        markdown: mdEl.value,
        title: docTitle.value || "preview",
        layout: readLayout(),
      }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      throw new Error(j.error || res.statusText);
    }
    const html = await res.text();
    preview.srcdoc = html;
    statusEl.textContent = "プレビュー更新済み";
  } catch (e) {
    statusEl.textContent = "エラー: " + e.message;
  } finally {
    btnPdf.disabled = false;
  }
}

async function downloadPdf() {
  statusEl.textContent = "PDF 生成中…";
  btnPdf.disabled = true;
  try {
    const res = await fetch("/api/pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        markdown: mdEl.value,
        title: docTitle.value || "document",
        layout: readLayout(),
      }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      throw new Error(j.error || res.statusText);
    }
    const blob = await res.blob();
    const cd = res.headers.get("Content-Disposition");
    let name = (docTitle.value || "document").replace(/[/\\?%*:|"<>]/g, "_") + ".pdf";
    const m = cd && /filename\*=UTF-8''([^;]+)/i.exec(cd);
    if (m) {
      try {
        name = decodeURIComponent(m[1]);
      } catch {
        /* ignore */
      }
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
    statusEl.textContent = "PDF をダウンロードしました";
  } catch (e) {
    statusEl.textContent = "エラー: " + e.message;
  } finally {
    btnPdf.disabled = false;
  }
}

/** @param {File} file */
async function loadMarkdownFile(file) {
  const name = file.name || "";
  const lower = name.toLowerCase();
  const isMd =
    lower.endsWith(".md") ||
    lower.endsWith(".markdown") ||
    file.type === "text/markdown" ||
    file.type === "text/x-markdown" ||
    file.type === "text/plain";
  if (!isMd) {
    statusEl.textContent =
      "対応しているのは .md / .markdown などの Markdown ファイルです";
    return;
  }
  const text = await file.text();
  mdEl.value = text;
  const base = name.replace(/\.[^.]+$/, "").trim() || "document";
  docTitle.value = base;
  statusEl.textContent = "ファイルを読み込みました: " + name;
  schedulePreview();
}

function setupFileUpload() {
  mdFile.addEventListener("change", async () => {
    const f = mdFile.files && mdFile.files[0];
    mdFile.value = "";
    if (!f) return;
    try {
      await loadMarkdownFile(f);
    } catch (e) {
      statusEl.textContent = "読み込みエラー: " + e.message;
    }
  });

  ["dragenter", "dragover"].forEach((ev) => {
    mdEl.addEventListener(ev, (e) => {
      e.preventDefault();
      e.stopPropagation();
      mdEl.classList.add("drop-target");
    });
  });
  ["dragleave", "drop"].forEach((ev) => {
    mdEl.addEventListener(ev, (e) => {
      e.preventDefault();
      e.stopPropagation();
      mdEl.classList.remove("drop-target");
    });
  });
  mdEl.addEventListener("drop", async (e) => {
    const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
    if (!f) return;
    try {
      await loadMarkdownFile(f);
    } catch (err) {
      statusEl.textContent = "読み込みエラー: " + err.message;
    }
  });
}

async function init() {
  try {
    const res = await fetch("/api/defaults");
    if (res.ok) {
      const data = await res.json();
      const L = data.layout || {};
      if (L.fontSizePt != null) fontSizePt.value = String(L.fontSizePt);
      if (L.marginMm != null) marginMm.value = String(L.marginMm);
      if (L.marginBottomMm != null) marginBottomMm.value = String(L.marginBottomMm);
      if (L.maxWidthRem != null) maxWidthRem.value = String(L.maxWidthRem);
      if (L.lineHeight != null) lineHeight.value = String(L.lineHeight);
      if (typeof L.latexArticleStyle === "boolean") {
        latexArticleStyle.checked = L.latexArticleStyle;
      }
    }
  } catch {
    /* 既定 HTML のまま */
  }

  mdEl.value = SAMPLE;
  syncLabels();

  [
    fontSizePt,
    marginMm,
    marginBottomMm,
    maxWidthRem,
    lineHeight,
  ].forEach((el) => el.addEventListener("input", () => {
    syncLabels();
    schedulePreview();
  }));

  latexArticleStyle.addEventListener("change", schedulePreview);

  docTitle.addEventListener("input", schedulePreview);
  mdEl.addEventListener("input", schedulePreview);
  btnPdf.addEventListener("click", downloadPdf);
  setupFileUpload();

  await runPreview();
}

init();
