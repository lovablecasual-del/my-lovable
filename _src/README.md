# サイト（index.html）の組み立て元ファイル

2026-11-01 から、公開サイト `index.html` は「あらかじめ組み立てたプログラム」を使っています。
以前はブラウザが開くたびに Babel（約3.1MB）で画面のプログラム（JSX）を組み立てていました。

このフォルダ（`_src/`）は、その組み立て元です。先頭が `_` のフォルダは GitHub Pages では公開されません。

## 中身
- `jsx/<リソースID>.jsx` … 画面のプログラムの元（7本）。**サイトの画面を修正するときはここを直して組み立てる**。
  - `ce93274c-…` 微調整パネル（tweaks）
  - `b729589f-…` 共通部品（商品カード・画像 Ph・お気に入り など）
  - `1dd976c3-…` ヘッダー・フッター・検索
  - `29138e9f-…` TOPページ
  - `9fcb2184-…` 商品詳細ページ
  - `cd537e59-…` 一覧・カテゴリ・記事などのページ
  - `80e7e81b-…` ルーター（アプリ本体）
- `build.py` … 組み立てスクリプト

## 組み立て方
```
npm pack @babel/standalone@7.29.0 react@18.3.1 react-dom@18.3.1
（それぞれ展開して）
python3 _src/build.py index.html _src/jsx \
  package/babel.min.js \
  react/umd/react.production.min.js \
  react-dom/umd/react-dom.production.min.js
```
- 変換設定は以前ブラウザ内で使っていた @babel/standalone 7.29.0 の text/babel と同じ（presets: react, env）。
- 実行順も以前と同じ（通常のスクリプトの後に、上の順番で実行）。
- React / ReactDOM は 18.3.1 の本番版。

## 注意
- `index.html` の中のプログラムを直接書き換えず、必ず `jsx/` を直してから組み立てる（直接書き換えると、次の組み立てで元に戻る）。
- 管理画面（admin_index.html）は対象外（今もブラウザ内で組み立てている）。
