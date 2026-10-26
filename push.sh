#!/bin/bash
cd "$(dirname "$0")"
rm -f .git/HEAD.lock .git/index.lock
git add index.html
git commit -m "feat: ランキング名称変更（人気ランキング→MY TOP PICKS / おすすめランキング）"
echo ""
echo "Pushing... (enter your GitHub token as password when prompted)"
git push https://lovablecasual-del@github.com/lovablecasual-del/my-lovable.git
