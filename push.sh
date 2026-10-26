#!/bin/bash
cd "$(dirname "$0")"
rm -f .git/HEAD.lock .git/index.lock
git add index.html admin_index.html lb_data.js
git commit -m "fix: SEED_VERSION 15→16 で全端末再シード + top.ranking.eyebrowをMY TOP PICKSに統一"
echo ""
echo "Pushing... (enter your GitHub token as password when prompted)"
git push https://lovablecasual-del@github.com/lovablecasual-del/my-lovable.git
