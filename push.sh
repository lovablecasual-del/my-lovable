#!/bin/bash
cd "$(dirname "$0")"
rm -f .git/HEAD.lock .git/index.lock
git add admin_index.html index.html
git commit -m "refactor: 管理画面TOPページからHero画像欄を削除・CropModal/不要変数をクリーンアップ"
echo ""
echo "Pushing... (enter your GitHub token as password when prompted)"
git push https://lovablecasual-del@github.com/lovablecasual-del/my-lovable.git
