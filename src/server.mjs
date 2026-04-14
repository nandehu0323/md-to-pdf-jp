/**
 * Web UI: レイアウト調整・プレビュー・PDF ダウンロード
 */

import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { markdownToPdfBuffer, markdownToPreviewHtml } from "./render-pdf.mjs";
import { parseLayoutFromBody, resolveLayout } from "./layout-options.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "..", "public");
const port = Number(process.env.PORT) || 3847;

const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "2mb" }));
app.use(
  express.static(publicDir, {
    setHeaders(res, filePath) {
      if (/\.(html|js|css)$/i.test(filePath)) {
        res.setHeader("Cache-Control", "no-store, max-age=0");
      }
    },
  })
);

app.get("/api/defaults", (_req, res) => {
  res.json({ layout: resolveLayout() });
});

app.post("/api/preview-html", async (req, res) => {
  try {
    const markdown = typeof req.body?.markdown === "string" ? req.body.markdown : "";
    const title =
      typeof req.body?.title === "string" ? req.body.title : "preview";
    const layout = parseLayoutFromBody(req.body?.layout);
    const html = await markdownToPreviewHtml(markdown, { title, layout });
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(html);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: String(err?.message ?? err) });
  }
});

app.post("/api/pdf", async (req, res) => {
  try {
    const markdown = typeof req.body?.markdown === "string" ? req.body.markdown : "";
    const title =
      typeof req.body?.title === "string" ? req.body.title : "document";
    const layout = parseLayoutFromBody(req.body?.layout);
    const buf = await markdownToPdfBuffer(markdown, { title, layout });
    const filename = safeFilename(title) + ".pdf";
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`
    );
    res.send(buf);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: String(err?.message ?? err) });
  }
});

app.listen(port, () => {
  console.log(`md-to-pdf-jp Web UI: http://127.0.0.1:${port}/`);
});

function safeFilename(s) {
  const t = s.replace(/[/\\?%*:|"<>]/g, "_").trim() || "document";
  return t.slice(0, 120);
}
