#!/bin/bash
cd "$(dirname "$0")"
rm -f .git/HEAD.lock .git/index.lock
git add index.html lb_data.js lovable-cms-backup.json
git commit -m "fix: 「いっくん」バッジテキスト削除（localStorage移行スクリプト + lb_data.js）"
echo ""
echo "Pushing... (enter your GitHub token as password when prompted)"
git push https://lovablecasual-del@github.com/lovablecasual-del/my-lovable.git
