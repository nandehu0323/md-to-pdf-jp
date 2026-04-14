# Design: md-to-pdf-jp

## 全体構成

1. **Markdown → PDF（高品質）**: Pandoc を経由し、`xelatex` / `lualatex` / `tectonic` で PDF を生成（`render-pdf.mjs`）。
2. **Markdown → HTML（プレビュー）**: `marked`（GFM 有効）で本文 HTML を生成。
3. **HTML ラップ（プレビュー/簡易PDF）**: `layout-options.mjs` の値を CSS へ反映した完全 HTML（`build-html.mjs`）。
4. **HTML → PDF（互換）**: Playwright の Chromium で `page.pdf`（`renderer=playwright`）。
5. **Web UI**: `express` で `POST /api/preview-html`・`POST /api/pdf` を提供。`renderer` と `pdfEngine` を受け取り、CLI と同じ経路で生成する。

### LaTeX article 風レイアウト（近似）

本物の LaTeX エンジンではないが、**HTML/CSS でよくある論文の見た目**に寄せる互換モード（`renderer=playwright`）。

- オプション `latexArticleStyle`（CLI は `--latex`、Web はチェックボックス）が有効なとき、Markdown 本文を **先頭の `##` より前**と **以降**に分割する（`latex-article.mjs`）。
- 前半を **1段組**（表題・抄録用）、後半を **2段組**（`column-count: 2`）。図・表・コードは `column-span: all` で段抜きを試みる。
- **ブラウザのプレビュー**では、段組コンテナの高さが「無限」に見えると multicol が **実質1段**に見えることがあるため、`@media screen` で `max-height` と `overflow` を付ける。**PDF 生成**は `@media print` でその制限を外す。
- `##` に `1` `2` …、`###` に `1.1` … を付ける **CSS カウンタ**は任意（`latexAutoSectionNumbers`）。本文が既に `## 1.` のように番号付きのときは **オフ**にし、二重表記を避ける（Numerai 系の長文向け）。
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

- `pandoc`: 高品質ルートの変換本体
- `playwright`: Headless Chromium で印刷品質の PDF を得る
- `marked`: 軽量な Markdown パーサ
- `express`: Web UI の HTTP サーバ

## 制約・注意

- 高品質ルートでは Pandoc と LaTeX エンジンが必要。`xelatex` が無い環境では `auto` 解決で `lualatex` / `tectonic` を順に試す。
- `tectonic` は環境・フォント構成により CJK 組版が不安定な場合があるため、実運用は `xelatex` 推奨。
- Playwright ルートでは Google Fonts にアクセスするため、**オフラインではフォントが当たらない**可能性がある。

## 学術向け Markdown エコシステム（参考）

「Markdown で論文を書く」ニーズ自体は広く、**自前の HTML/CSS 一択ではない**。代表的なものだけ挙げる。

| 系統 | 概要 |
|------|------|
| **[Quarto](https://quarto.org/)** | RStudio 系の統合。`.qmd` で論文・スライド・書籍。PDF は多くの場合 **LaTeX 経由**や **Typst** など。数式・引用・相互参照が強い。 |
| **[Pandoc](https://pandoc.org/)** | 変換のデファクト。`pandoc paper.md -o paper.pdf` で **LaTeX テンプレート**に流し込む運用が一般的。学会テンプレートとの組み合わせ例が多い。 |
| **[MyST](https://mystmd.org/)** | 科学技術向け Markdown 拡張。Jupyter 文化圏と親和。 |
| **Obsidian / VS Code + 拡張** | メモから原稿まで。最終 PDF は上記ツールに渡すことも多い。 |

**本プロジェクトの位置づけ**: Node だけで **日本語組版のきれいな PDF** を素早く出したい・**LaTeX 環境を立てたくない**・**ブラウザで微調整したい**、といった **軽量ルート**。数式・参考文献の厳密処理が主目的なら **Quarto / Pandoc + LaTeX** の方が適することが多い。用途に応じて使い分け、または Pandoc で `.md` を生成しつつ最終整形だけ別ツール、といった併用もありうる。
