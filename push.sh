#!/bin/bash
cd "$(dirname "$0")"
rm -f .git/HEAD.lock .git/index.lock
git add index.html admin_index.html lb_data.js
git commit -m "feat: カテゴリーバナーMinimal Editorial化 + 旧Badges絵文字タグ削除（編集タグ4種統一）"
echo ""
echo "Pushing... (enter your GitHub token as password when prompted)"
git push https://lovablecasual-del@github.com/lovablecasual-del/my-lovable.git
