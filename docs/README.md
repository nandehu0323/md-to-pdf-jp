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

## 使い方（CLI）

```bash
node src/cli.mjs examples/sample.md -o out.pdf
```

オプションでレイアウトを変えられます（省略時は **約 9pt・上・左右 14mm・下 24mm** 前後の既定）:

```bash
node src/cli.mjs report.md -o out.pdf --font-size 8.5 --margin 12 --margin-bottom 22
```

グローバルに `bin` を使う場合は `npm link` 後:

```bash
md-to-pdf-jp input.md -o output.pdf
md-to-pdf-jp notes.md --title "会議メモ"
```

`-o` を省略すると、入力ファイルと同じディレクトリに `<basename>.pdf` が出力されます。

## Web UI（ブラウザで調整・PDF 保存）

```bash
npm run web
```

ブラウザで `http://127.0.0.1:3847/` を開き、スライダーでフォントサイズ・余白・行間・カラム幅を変えながら **プレビュー**し、**PDF をダウンロード**できます。**Markdown（.md）ファイルの読み込み**（ファイル選択または編集欄へのドラッグ＆ドロップ）にも対応しています。ポートは環境変数 `PORT` で変更可能です。

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
