#!/bin/bash
cd "$(dirname "$0")"
rm -f .git/HEAD.lock .git/index.lock
git add index.html admin_index.html lb_data.js
git commit -m "feat: 管理画面整理 — 商品バッジUI廃止・SNS TikTok欄削除・左メニューTikTok動画管理削除"
echo ""
echo "Pushing... (enter your GitHub token as password when prompted)"
git push https://lovablecasual-del@github.com/lovablecasual-del/my-lovable.git
