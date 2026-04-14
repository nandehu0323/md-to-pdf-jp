# md-to-pdf-jp

Markdown を入力に、日本語向けに組版した PDF を出力する CLI ツールです。

## 必要環境

- Node.js 18 以上

## セットアップ

```bash
cd md-to-pdf-jp
npm install
npx playwright install chromium
```

初回は Chromium のダウンロードが走ります。

## 使い方

```bash
node src/cli.mjs examples/sample.md -o out.pdf
```

グローバルに `bin` を使う場合は `npm link` 後:

```bash
md-to-pdf-jp input.md -o output.pdf
md-to-pdf-jp notes.md --title "会議メモ"
```

`-o` を省略すると、入力ファイルと同じディレクトリに `<basename>.pdf` が出力されます。

## レイアウト

論文・レポートに近い体裁です（明朝ベースの単カラム、表題の中央配置、段落の字下げ、ページ番号など）。詳細は [design.md](./design.md) を参照してください。

## フォント（Google Fonts）

| 用途       | フォント名   |
| ---------- | ------------ |
| 本文・見出し | Noto Serif JP |
| コード     | JetBrains Mono |

PDF 生成時に Google Fonts から取得します（ネットワーク接続が必要です）。

## 関連ドキュメント

- [PRD](./prd.md) — 目的とスコープ
- [Design](./design.md) — 技術方針
