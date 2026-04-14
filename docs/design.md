# Design: md-to-pdf-jp

## 全体構成

1. **Markdown → HTML**: `marked`（GFM 有効）で本文 HTML を生成
2. **HTML ラップ**: 印刷向け CSS と Google Fonts の `<link>` を付与した完全な HTML
3. **HTML → PDF**: Playwright の Chromium で `page.setContent` 後 `page.pdf` を実行

## フォント選定

- **Noto Serif JP**: 本文・見出し。学術文書で一般的な明朝系で統一
- **JetBrains Mono**: コードブロック用。ASCII の視認性が高い

## スタイル方針（論文調レイアウト）

- `main.paper` で最大幅（約 38rem）の単カラムを中央配置し、読み幅を抑える
- 本文は `text-align: justify`（日本語の行末そろえ）とやや広い行間（約 1.9）
- 先頭の `# 見出し` は表題として中央揃え・二重下線。`##` は下線で節を区切る
- 段落は見出し直後を除き先頭字下げ（`p + p`）を付与
- 引用（`blockquote`）は要旨・抄録風に上下罫線のみの落ち着いた体裁
- ページ番号は Playwright の `footerTemplate`（`pageNumber`）で各ページ下部に付与
- `@page` と `page.pdf` の margin を概ね一致させ、A4 固定。フッター用に下余白を広げる

## 依存関係

- `playwright`: Headless Chromium で印刷品質の PDF を得る
- `marked`: 軽量な Markdown パーサ

## 制約・注意

- PDF 生成時に Google Fonts にアクセスするため、**オフラインではフォントが当たらない**可能性がある
- 完全オフラインが必要な場合は、将来 `@fontsource/*` 等での同梱を検討する
