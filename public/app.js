const mdEl = document.getElementById("md");
const preview = document.getElementById("preview");
const docTitle = document.getElementById("docTitle");
const btnPdf = document.getElementById("btnPdf");
const statusEl = document.getElementById("status");

const fontSizePt = document.getElementById("fontSizePt");
const marginMm = document.getElementById("marginMm");
const marginBottomMm = document.getElementById("marginBottomMm");
const maxWidthRem = document.getElementById("maxWidthRem");
const lineHeight = document.getElementById("lineHeight");

const fontSizeVal = document.getElementById("fontSizeVal");
const marginVal = document.getElementById("marginVal");
const marginBottomVal = document.getElementById("marginBottomVal");
const maxWidthVal = document.getElementById("maxWidthVal");
const lineHeightVal = document.getElementById("lineHeightVal");

const SAMPLE = `# サンプル表題

これは **Web UI** から生成したプレビューです。右のスライダーで余白やフォントサイズを変えられます。

## 節見出し

段落の字下げや行間は、サーバー側の CSS と同じ設定が iframe に反映されます。

> 引用は抄録風の上下罫線です。

`;

let previewTimer = null;

function readLayout() {
  return {
    fontSizePt: Number(fontSizePt.value),
    marginMm: Number(marginMm.value),
    marginBottomMm: Number(marginBottomMm.value),
    maxWidthRem: Number(maxWidthRem.value),
    lineHeight: Number(lineHeight.value),
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

  docTitle.addEventListener("input", schedulePreview);
  mdEl.addEventListener("input", schedulePreview);
  btnPdf.addEventListener("click", downloadPdf);

  await runPreview();
}

init();
