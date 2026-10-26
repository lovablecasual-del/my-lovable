#!/bin/bash
cd "$(dirname "$0")"
rm -f .git/HEAD.lock .git/index.lock
git add index.html admin_index.html lb_data.js
git commit -m "feat: 商品編集画面にTikTok動画セクション追加 + PDP見出し更新（AS SEEN ON TIKTOK）"
echo ""
echo "Pushing... (enter your GitHub token as password when prompted)"
git push https://lovablecasual-del@github.com/lovablecasual-del/my-lovable.git
