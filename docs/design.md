# Design: md-to-pdf-jp

## 全体構成

1. **Markdown → HTML**: `marked`（GFM 有効）で本文 HTML を生成
2. **HTML ラップ**: 印刷向け CSS と Google Fonts の `<link>` を付与した完全な HTML
3. **HTML → PDF**: Playwright の Chromium で `page.setContent` 後 `page.pdf` を実行

## フォント選定

- **Noto Sans JP**: 本文用。可読性が高く、ウェイト展開がある
- **Shippori Mincho**: 見出し用。明朝で文書らしさを付与
- **JetBrains Mono**: コードブロック用。ASCII の視認性が高い

## スタイル方針

- `lang="ja"`、本文に `line-height: 1.75` 前後
- `font-feature-settings: "palt"` でプロポーショナル寄せ（環境により無視される場合あり）
- `@page` と `page.pdf` の margin を概ね一致させ、A4 固定

## 依存関係

- `playwright`: Headless Chromium で印刷品質の PDF を得る
- `marked`: 軽量な Markdown パーサ

## 制約・注意

- PDF 生成時に Google Fonts にアクセスするため、**オフラインではフォントが当たらない**可能性がある
- 完全オフラインが必要な場合は、将来 `@fontsource/*` 等での同梱を検討する
