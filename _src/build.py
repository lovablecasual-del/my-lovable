#!/usr/bin/env python3
"""LOVABLE サイト index.html のビルド（2026-11-01〜）

ブラウザ内 Babel をやめ、画面のプログラム（JSX）を事前に組み立てて index.html に入れる。

  python3 build.py <index.html> <jsxディレクトリ> <babel.min.js> <react.production.min.js> <react-dom.production.min.js>

- <jsxディレクトリ>/<リソースID>.jsx を、@babel/standalone 7.29.0 の text/babel と同じ設定
  （presets: react, env / plugins: class-properties, object-rest-spread, flow-strip-types）で変換し、
  index.html の同じリソースIDに入れる。ソースマップは付けない。
- テンプレートの <script type="text/babel" src=ID> を通常の <script src=ID> にし、
  以前と同じ実行順（通常のスクリプトがすべて終わってから、元の順番で）になるよう最後のスクリプトの後ろに並べる。
- Babel 本体（約3.1MB）をテンプレートとマニフェストから外す。
- React / ReactDOM 18.3.1 を開発版から本番版（production.min）に差し替える。
何度実行しても同じ結果になる（すでに変換済みの index.html にも使える）。
"""
import base64, gzip, json, os, re, subprocess, sys

BABEL_ID = "9ff45544-46af-450d-8a0c-1e2f4a3222c8"
REACT_ID = "4a323311-5b0f-446d-8735-e97164d310db"
REACTDOM_ID = "51b362c5-554a-466a-839d-019ac7f7113f"
# 実行順（元の text/babel の並び順）
JSX_ORDER = [
    "ce93274c-afdd-4f85-8d62-2c10ad748cae",
    "b729589f-46df-4079-acf9-959c9bf7d9c7",
    "1dd976c3-9b46-4cdd-9f73-c457a16b41ba",
    "29138e9f-c3ed-4289-b6de-f1fa1af9fee6",
    "9fcb2184-66b8-4e50-81ee-4c7d4b418709",
    "cd537e59-2091-4210-8e62-36f1c00b7daa",
    "80e7e81b-1e59-4e39-925a-1bb439071deb",
]
COMPILE_JS = r"""
const fs=require('fs'), vm=require('vm');
const [,, babelPath, src]=process.argv;
const ctx={console}; ctx.window=ctx; ctx.self=ctx; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(babelPath,'utf8'), ctx);
const out=ctx.Babel.transform(fs.readFileSync(src,'utf8'),{filename:'Inline Babel script',presets:['react','env'],
  plugins:['transform-class-properties','transform-object-rest-spread','transform-flow-strip-types'],sourceMaps:false}).code;
process.stdout.write(out);
"""

def main(html, jsxdir, babel, react_prod, reactdom_prod):
    c = open(html, encoding="utf-8").read()
    ms = c.find('<script type="__bundler/manifest">') + len('<script type="__bundler/manifest">')
    me = c.find("</script>", ms)
    man = json.loads(c[ms:me])
    ts = c.find('<script type="__bundler/template">') + len('<script type="__bundler/template">')
    te = c.find("</script>", ts)
    tpl = json.loads(c[ts:te])

    def put(rid, data_bytes):
        man[rid] = {"mime": "text/javascript", "compressed": True,
                    "data": base64.b64encode(gzip.compress(data_bytes, mtime=0)).decode()}

    cj = os.path.join(os.path.dirname(os.path.abspath(__file__)), "_compile_tmp.js")
    open(cj, "w").write(COMPILE_JS)
    for rid in JSX_ORDER:
        src = os.path.join(jsxdir, rid + ".jsx")
        out = subprocess.run(["node", cj, babel, src], check=True, capture_output=True).stdout
        put(rid, out)
        print("compiled", rid, os.path.getsize(src), "->", len(out))
    os.remove(cj)
    put(REACT_ID, open(react_prod, "rb").read())
    put(REACTDOM_ID, open(reactdom_prod, "rb").read())
    man.pop(BABEL_ID, None)

    # template: drop Babel tag, drop integrity on React tags, move JSX tags to the end as plain scripts
    tpl = re.sub(r'<script src="' + BABEL_ID + r'"[^>]*></script>\n?', "", tpl)
    for rid in (REACT_ID, REACTDOM_ID):
        tpl = re.sub(r'(<script src="' + rid + r'")[^>]*>', r'\1>', tpl)
    for rid in JSX_ORDER:
        tpl = re.sub(r'<script (?:type="text/(?:babel|javascript)" )?src="' + rid + r'"></script>\n?', "", tpl)
    tags = "".join('<script src="%s"></script>\n' % rid for rid in JSX_ORDER)
    last = list(re.finditer(r'<script [^>]*src="[^"]+"></script>\n?', tpl))[-1]
    tpl = tpl[:last.end()] + ("" if tpl[last.end()-1] == "\n" else "\n") + tags + tpl[last.end():]
    assert "text/babel" not in tpl and BABEL_ID not in tpl
    for rid in JSX_ORDER:
        assert tpl.count(rid) == 1, rid

    enc = json.dumps(tpl).replace("</", "<\\/")
    raw_man = json.dumps(man)
    c = c[:ms] + raw_man + c[me:ts] + enc + c[te:]
    open(html, "w", encoding="utf-8").write(c)
    print("ok", html, len(c.encode("utf-8")))

if __name__ == "__main__":
    main(*sys.argv[1:6])
