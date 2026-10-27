# LOVABLE プロジェクト 引き継ぎ資料

最終更新: 2026年10月

---

## 1. プロジェクト概要

| 項目 | 内容 |
|------|------|
| サイト名 | LOVABLE |
| コンセプト | 20〜30代向け Quiet Luxury ライフスタイルセレクトショップ（アフィリエイト） |
| URL | https://lily-brw.github.io/lovable/ |
| リポジトリ | https://github.com/lovablecasual-del/my-lovable |
| ホスティング | GitHub Pages（静的配信） |

---

## 2. ファイル構成

```
my-lovable/
├── index.html          # サイト本体（全CSS・JS・テンプレート内包 約1.5MB）
├── admin_index.html    # 管理画面（商品・コンテンツ管理UI）
├── lb_data.js          # 商品データ（JSON形式）
└── push.sh             # git push用スクリプト
```

---

## 3. 管理画面の使い方

### 3-1. アクセス方法
`admin_index.html` をブラウザで開く → ログイン（パスワード認証）

### 3-2. 商品登録・編集のフロー

1. 左メニュー「**商品管理**」→「新規追加」または既存商品をクリック
2. **URLから自動入力**（推奨）：楽天・Amazon等の商品URLを貼り付けて「読み込む」→ 商品名・画像・価格が自動入力される
3. 必要に応じて手動で以下を編集：
   - 商品名・短縮表示名・ブランド
   - 価格・ランキング順位
   - 編集タグ（任意）
   - バッジテキスト
   - ショップリンク（アフィリエイトURL）
   - 画像
   - MY PERSONAL REVIEW（レビュー文・評価）
   - TikTok動画URL
4. 右パネル「**公開する**」ボタンを押して状態を「公開」にする
5. 右上「**サイトに公開**」ボタンを押す → `index.html` と `lb_data.js` が更新されてGitHub Pagesに反映

> ⚠️ 「下書き」のまま「サイトに公開」しても商品はサイトに表示されません。必ず「公開する」→「サイトに公開」の順で操作してください。

### 3-3. その他の管理メニュー

| メニュー | 用途 |
|---------|------|
| カテゴリー | カテゴリー名・バナー画像の管理 |
| ナビゲーション | ヘッダー・ボトムナビのリンク設定 |
| メディア | 画像ファイルの管理 |
| 記事・特集 | JOURNALページの記事管理 |
| TOPページ | ヒーロー画像・AS SEEN ON SOCIALコンテンツ |
| サイトコンテンツ管理 | GIFT・ギャラリーコンテンツ等 |
| アクセス解析 | PV・クリック数の確認 |
| 設定・SEO | サイト名・メタ情報等 |

---

## 4. ページ構成

### TOP（`/`）
Hero FV → ランキング → JUST IN（新着） → AS SEEN ON SOCIAL → JOURNAL → GIFT → SNSフォロー → フッター

### 商品詳細ページ PDP（`/product/:slug`）
パンくず → 商品画像ギャラリー（PC:2カラム / SP:縦並び） → 商品名・価格・ショップボタン → MY PERSONAL REVIEW → POINTS / SPEC → 関連商品

### その他のページ
- `/category/:slug` — カテゴリーページ
- `/ranking` — ランキングページ
- `/journal/:slug` — 記事ページ
- `/about`, `/affiliate`, `/privacy` — 静的ページ

---

## 5. ⚠️ 変更禁止ルール（絶対厳守）

以下はユーザー明示指示により変更禁止：

- 商品画像のCSS・コンポーネント・サイズ・角丸・縦横比
- アフィリエイトURL
- クリック計測・アクセス解析
- 商品名・価格・レビュー（ユーザー指示がある場合を除く）
- TOPページのレイアウト
- 商品詳細ページの仕様（バグ修正を除く）
- 管理画面のデータ構造
- ランキングの内容
- 既存商品データの書き換え
- 認証方式

---

## 6. ⚠️ 重要アーキテクチャ（CSSを触る場合は必読）

このSPAはカスタムバンドラーを採用しており、ページロード時に以下が実行される：

```js
document.documentElement.replaceWith(doc.documentElement);
```

**→ raw `<head>` に直接書いたCSSは完全に無効化される**

### 有効なCSS追加場所は2箇所のみ

**① `<script type="__bundler/template">` 内のstyleタグ（9個）**
- ファイル末尾付近（~1,452,000バイト付近）
- JSON文字列をデコードした中のHTMLに `<style>` タグが含まれる
- グローバルCSS・PCレイアウト・ギャラリー基本設定など

**② インラインJS `s.textContent`（SP専用CSS・最優先）**
- ファイル ~80,345〜99,300バイト付近
- `replaceWith()` 後に `document.head.appendChild(s)` で追加される
- **最後にカスケードされるため最も優先度が高い**
- `@media (max-width: 767px) { ... }` 1ブロックで全SP CSSを定義

### CSSカスケード順（後勝ち）
テンプレート style 1〜9 → インラインJS `sg`（ソーシャルグリッド） → インラインJS `s`（SP CSS）← 最終・最優先

### SP CSSを編集する場合
```python
content = open('index.html', encoding='utf-8').read()
idx = content.find("s.textContent = '@media (max-width: 767px)")
# このidxから始まるブロックを編集する
```

---

## 7. レイアウト値（SP基準 iPhone 390px）

| 要素 | 値 |
|------|----|
| viewport幅 | 390px |
| `.wrap-wide` padding | 16px × 2 = 32px |
| コンテンツ幅 | **358px** |
| `--gutter` (SP上書き) | `padding-inline: 16px !important` |
| ギャラリーメイン画像高さ | `min(50vh, 430px)` |
| ギャラリーサムネイル | 68px × 68px（横スクロール） |

---

## 8. 重要な技術的知見

### CSSグリッドの横スクロールバグ対策
グリッドアイテムは `min-width: auto` がデフォルトのため、コンテンツ幅が1frトラック幅を超えて横スクロールが発生する。
→ **修正: `min-width: 0 !important`** をグリッドアイテムに付与する

### iOS Safari 横スクロール対策
- `body { overflow-x: hidden }` はiOS Safariで縦スクロールも壊す → 使わない
- **`html { overflow-x: hidden }`** を使う

### ギャラリーSP配置
- メイン画像（上）+ サムネイル横スクロール（下）
- `display: flex !important; flex-direction: column !important` で縦並び実現

---

## 9. 商品データ構造（lb_data.js）

各商品の主要フィールド：

```js
{
  slug: "product-slug",        // URL識別子（一意）
  name: "商品名（フル）",
  displayName: "短縮表示名",   // ランキング等で使用
  brand: "ブランド名",
  price: 29920,               // 円
  category: "dress",
  images: ["url1", "url2"],
  shops: [
    { name: "楽天", url: "アフィリエイトURL", price: 29920 }
  ],
  igUrl: "Instagram URL",
  tags: ["tag1", "tag2"],     // 編集タグ
  review: {
    text: "レビュー文",
    rating: 5,
    points: ["ポイント1", "ポイント2"]
  },
  tiktokVideos: ["url1"]
}
```

---

## 10. git操作・デプロイ手順

```bash
# 1. 変更をコミット
cd /Users/ikuyo/Downloads/my-lovable
git add index.html admin_index.html lb_data.js
git commit -m "fix: 変更内容の説明"

# 2. GitHubにpush（push.shを使うか直接実行）
bash push.sh
# または
git push origin main
```

push後、約1〜2分でGitHub Pagesに反映される。

---

## 11. 完了した主要実装（履歴）

| 機能 | 概要 |
|------|------|
| SP版PDP横スクロールバグ修正 | `min-width: 0` on grid items |
| ギャラリーSP表示 | メイン画像全幅（上）+ サムネイル横スクロール（下） |
| AS SEEN ON SOCIAL | TOPページ + 管理画面 |
| TikTok動画セクション | PDP + 管理画面 |
| カテゴリーバナー redesign | Minimal Editorial スタイル |
| 商品編集タグ機能 | 管理画面 |
| MY PERSONAL REVIEW | PDPセクション |
| ヘッダー・ボトムナビ改善 | |
| 検索・カテゴリー改善 | |
| JOURNALページSP改善 | |
| ランキングページSP改善 | |
| 管理画面全般 | 商品・レビュー・JOURNAL・ギフト・カテゴリー画像管理 |
