#!/bin/bash
cd "$(dirname "$0")"
rm -f .git/HEAD.lock .git/index.lock
git add admin_index.html index.html
git commit -m "feat: PDPページUI改善 — 画像高さSP最適化/ショップボタン/レビューカード/シェアボタン/余白調整 + TOPページ改善"
echo ""
echo "Pushing... (enter your GitHub token as password when prompted)"
git push https://lovablecasual-del@github.com/lovablecasual-del/my-lovable.git
