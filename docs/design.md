# Design: md-to-pdf-jp

## 全体構成

1. **Markdown → HTML**: `marked`（GFM 有効）で本文 HTML を生成
2. **HTML ラップ**: `layout-options.mjs` で正規化した余白・フォントサイズ等を反映した CSS と Google Fonts の `<link>` を付与した完全な HTML（`build-html.mjs`）
3. **HTML → PDF**: Playwright の Chromium で `page.setContent` 後 `page.pdf` を実行（`render-pdf.mjs`）
4. **Web UI**: `express` で静的ファイル（`public/`）と `POST /api/preview-html`・`POST /api/pdf` を提供。CLI と同じレンダラを共有する

### LaTeX article 風レイアウト（近似）

本物の LaTeX エンジンではないが、**HTML/CSS でよくある論文の見た目**に寄せられる。

- オプション `latexArticleStyle`（CLI は `--latex`、Web はチェックボックス）が有効なとき、Markdown 本文を **先頭の `##` より前**と **以降**に分割する（`latex-article.mjs`）。
- 前半を **1段組**（表題・抄録用）、後半を **2段組**（`column-count: 2`）。図・表・コードは `column-span: all` で段抜きを試みる。
- `##` には `1` `2` …、`###` には `1.1` … の **CSS カウンタ**で番号を付与（LaTeX の section / subsection に相当する見た目）。
- **限界**: 数式・文献自動ソート・参照クロスリファレンス・厳密なハイフネーション等は HTML では再現しない。完全な LaTeX 品質が必要なら `.tex` を別途使う前提。

## フォント選定

- **Noto Serif JP**: 本文・見出し。学術文書で一般的な明朝系で統一
- **JetBrains Mono**: コードブロック用。ASCII の視認性が高い

## スタイル方針（論文調レイアウト）

- `main.paper` で最大幅（既定 **約 36rem**、Web/CLI で変更可）の単カラムを中央配置し、読み幅を抑える
- 本文フォントサイズは既定 **約 9pt**、上・左右余白は既定 **約 14mm**、下余白はページ番号分を含め **約 24mm**（いずれも `resolveLayout` でクランプ）
- 本文は `text-align: justify`（日本語の行末そろえ）と行間（既定 **約 1.85**、可変）
- 先頭の `# 見出し` は表題として中央揃え・二重下線。`##` は下線で節を区切る
- 段落は見出し直後を除き先頭字下げ（`p + p`）を付与
- 引用（`blockquote`）は要旨・抄録風に上下罫線のみの落ち着いた体裁
- ページ番号は Playwright の `footerTemplate`（`pageNumber`）で各ページ下部に付与
- `@page` と `page.pdf` の margin を概ね一致させ、A4 固定。フッター用に下余白を広げる

## 依存関係

- `playwright`: Headless Chromium で印刷品質の PDF を得る
- `marked`: 軽量な Markdown パーサ
- `express`: Web UI の HTTP サーバ

## 制約・注意

- PDF 生成時に Google Fonts にアクセスするため、**オフラインではフォントが当たらない**可能性がある
- 完全オフラインが必要な場合は、将来 `@fontsource/*` 等での同梱を検討する
