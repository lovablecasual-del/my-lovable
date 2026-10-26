#!/bin/bash
cd "$(dirname "$0")"
rm -f .git/HEAD.lock .git/index.lock
git add index.html lb_data.js
git commit -m "fix: FashionサブカテゴリーからバッグとアクセサリーをlocalStorage含め完全削除"
echo ""
echo "Pushing... (enter your GitHub token as password when prompted)"
git push https://lovablecasual-del@github.com/lovablecasual-del/my-lovable.git
