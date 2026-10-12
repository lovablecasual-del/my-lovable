#!/bin/bash
cd "$(dirname "$0")"
rm -f .git/HEAD.lock .git/index.lock
git add admin_index.html index.html
git commit -m "feat: カテゴリヘッダー画像管理機能追加（管理画面アップロード + ストアフロント表示）"
echo ""
echo "Pushing... (enter your GitHub token as password when prompted)"
git push https://lovablecasual-del@github.com/lovablecasual-del/my-lovable.git
