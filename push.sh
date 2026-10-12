#!/bin/bash
cd "$(dirname "$0")"
rm -f .git/HEAD.lock .git/index.lock
git add admin_index.html index.html
git commit -m "feat: TOPページUI改善 — FV縮小/ランキング1位スクエア化/JOURNALカバー画像/SNSカードホバー/余白統一 + 管理画面Hero画像欄削除"
echo ""
echo "Pushing... (enter your GitHub token as password when prompted)"
git push https://lovablecasual-del@github.com/lovablecasual-del/my-lovable.git
