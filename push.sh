#!/bin/bash
cd "$(dirname "$0")"
rm -f .git/HEAD.lock .git/index.lock
git add index.html admin_index.html
git commit -m "feat: 愛用品バッジ削除 + 編集タグ4種類追加（MY FAVORITE / BEST BUY / REPEAT ITEM / PETITE PICK）"
echo ""
echo "Pushing... (enter your GitHub token as password when prompted)"
git push https://lovablecasual-del@github.com/lovablecasual-del/my-lovable.git
