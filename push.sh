#!/bin/bash
cd "$(dirname "$0")"
rm -f .git/HEAD.lock .git/index.lock
git add index.html admin_index.html
git commit -m "feat: カテゴリー並び替え削除 + Fashionサブカテゴリー整理（バッグ・アクセサリー削除）"
echo ""
echo "Pushing... (enter your GitHub token as password when prompted)"
git push https://lovablecasual-del@github.com/lovablecasual-del/my-lovable.git
