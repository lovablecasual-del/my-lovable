#!/bin/bash
cd "$(dirname "$0")"
rm -f .git/HEAD.lock .git/index.lock
git add index.html
git commit -m "fix: PDP画像高さバグ修正（padding-topトリックでSafari対応）

修正内容:
1. [CSS] .gallery__main .ph の aspect-ratio を padding-top:125% + height:0 に変更
   → aspect-ratioがSafariで効かない問題をpadding-topトリックで回避
   → 縦横比4:5 → 125% (=5/4×100%) で正しい高さを保証
2. [Ph] loading=lazy 削除済み（前回コミット）
3. [data] Levi's p16 無効URL削除済み（前回コミット）"
echo ""
echo "Pushing... (enter your GitHub token as password when prompted)"
git push https://lovablecasual-del@github.com/lovablecasual-del/my-lovable.git
