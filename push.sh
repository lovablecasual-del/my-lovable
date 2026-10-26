#!/bin/bash
cd "$(dirname "$0")"
rm -f .git/HEAD.lock .git/index.lock
git add index.html assets/menu/
git commit -m "feat: SPメニューアイコンをイラスト画像に変更

変更内容:
- assets/menu/ に6枚のカテゴリイラスト画像を追加
  (beauty / fashion / lifestyle / travel / ranking / journal)
- DrawerNavのアイコン表示をemoji→イラスト画像(44px)に変更
  URLキーワードで自動マッピング（/category/beauty → beauty.png など）
- .mnav__icon の幅を28px→44px に拡張、.mnav__icon-img CSS追加"
echo ""
echo "Pushing... (enter your GitHub token as password when prompted)"
git push https://lovablecasual-del@github.com/lovablecasual-del/my-lovable.git
