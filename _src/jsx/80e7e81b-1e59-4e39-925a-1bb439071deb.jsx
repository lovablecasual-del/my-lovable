/* ============================================================
   LOVABLE — app shell, router, tweaks
   ============================================================ */

const _site = (window.LB && window.LB.site) || {};
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "heroVariant": "stack",
  "theme": "light",
  "accent": "#6b4e34"
}/*EDITMODE-END*/;
// Admin TOP-page settings take precedence as the live default
if (_site.hero && _site.hero.variant) TWEAK_DEFAULTS.heroVariant = _site.hero.variant;
if (_site.theme) TWEAK_DEFAULTS.theme = _site.theme;
if (_site.accent) TWEAK_DEFAULTS.accent = _site.accent;

/* ---------- tiny hash router ---------- */
function useRoute() {
  const parse = () => {
    let h = window.location.hash.replace(/^#/, "");
    if (!h || h === "/") return { name: "top", anchor: null, raw: "/" };
    const [path, anchor] = h.split("#");
    const parts = path.split("/").filter(Boolean);
    if (parts[0] === "category") return { name: "category", cat: parts[1] || "beauty", raw: h };
    if (parts[0] === "all")      return { name: "all", raw: h };
    if (parts[0] === "product")  return { name: "product", id: parts[1], raw: h };
    if (parts[0] === "saved")    return { name: "saved", raw: h };
    if (parts[0] === "search")   return { name: "search", q: decodeURIComponent(parts.slice(1).join("/") || ""), raw: h };
    if (parts[0] === "feature")  return { name: "feature", key: parts[1] || "", raw: h };
    if (parts[0] === "journal")  return { name: "feature", key: parts[1] || "", raw: h };
    if (parts[0] === "about")    return { name: "about", raw: h };
    if (parts[0] === "privacy")  return { name: "privacy", raw: h };
    if (parts[0] === "affiliate")return { name: "affiliate", raw: h };
    if (parts[0] === "tiktok")  return { name: "tiktok", raw: h };
    return { name: "top", anchor: anchor || (parts.length===0?null:path), raw: h };
  };
  const [route, setRoute] = useState(parse);
  useEffect(() => {
    const h = () => setRoute(parse());
    window.addEventListener("hashchange", h);
    return () => window.removeEventListener("hashchange", h);
  }, []);
  return route;
}

window.LBnav = (to) => {
  // support "/#anchor" style
  if (to.startsWith("/#")) {
    const anc = to.slice(2);
    if (window.location.hash.replace(/^#/,"") === "/" || window.location.hash === "" || window.location.hash === "#/") {
      const el = document.getElementById(anc);
      if (el) { el.scrollIntoView({ behavior: "smooth", block: "start" }); return; }
    }
    window.location.hash = "/#" + anc;
    setTimeout(() => { const el = document.getElementById(anc); if (el) el.scrollIntoView({ behavior:"smooth", block:"start" }); }, 60);
    return;
  }
  window.location.hash = to;
};

/* ---------- page transition wrapper ---------- */
function PageFade({ routeKey, children }) {
  const [shown, setShown] = useState(children);
  const [cls, setCls] = useState("pagefade in");
  const keyRef = useRef(routeKey);
  useEffect(() => {
    if (keyRef.current === routeKey) { setShown(children); return; }
    keyRef.current = routeKey;
    setCls("pagefade out");
    const t = setTimeout(() => {
      setShown(children);
      window.scrollTo({ top: 0, behavior: "auto" });
      requestAnimationFrame(() => requestAnimationFrame(() => setCls("pagefade in")));
    }, 220);
    return () => clearTimeout(t);
  }, [routeKey, children]);
  return <div className={cls}>{shown}</div>;
}

/* ---------- back-to-admin link (hidden) ---------- */
function AdminBackLink() { return null; }

/* ---------- App ---------- */
function App() {
  const [, _forceRerender] = useState(0);
  useEffect(() => {
    const h = () => _forceRerender(x => x + 1);
    window.addEventListener("lb:store", h);
    return () => window.removeEventListener("lb:store", h);
  }, []);
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const route = useRoute();
  const [searchOpen, setSearchOpen] = useState(false);

  // apply theme + accent to :root
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", t.theme === "dark" ? "dark" : "light");
  }, [t.theme]);
  useEffect(() => {
    document.documentElement.style.setProperty("--gold", t.accent);
    // derive a deeper variant for text-on-light
    document.documentElement.style.setProperty("--gold-deep", shade(t.accent, -0.18));
  }, [t.accent]);

  const onOpen = useCallback((id) => window.LBnav("/product/" + id), []);

  let page, key;
  const showHome = window.LB && window.LB.site ? window.LB.site.showHomePage !== false : true;
  if (route.name === "product")      { page = <ProductPage id={route.id} onOpen={onOpen} />; key = "product:"+route.id; }
  else if (route.name === "category"){ page = <CategoryPage catKey={route.cat} onOpen={onOpen} />; key = "category:"+route.cat; }
  else if (route.name === "all")     { page = <AllPage onOpen={onOpen} />; key = "all"; }
  else if (route.name === "saved")   { page = <SavedPage onOpen={onOpen} />; key = "saved"; }
  else if (route.name === "about")   { page = <AboutPage />; key = "about"; }
  else if (route.name === "privacy") { page = <PrivacyPage />; key = "privacy"; }
  else if (route.name === "affiliate"){ page = <AffiliatePage />; key = "affiliate"; }
  else if (route.name === "search")   { const SP = window.SearchPage; page = SP ? <SP q={route.q} onOpen={onOpen} /> : <AllPage onOpen={onOpen} />; key = "search:"+route.q; }
  else if (route.name === "feature")  { const FP = window.FeaturePage; page = FP ? <FP featureKey={route.key} onOpen={onOpen} /> : <AllPage onOpen={onOpen} />; key = "feature:"+route.key; }
  else if (route.name === "tiktok")     { page = window.TikTokPage ? React.createElement(window.TikTokPage, {onOpen}) : React.createElement("div",null); key = "tiktok"; }
  else if (!showHome)                { page = <AllPage onOpen={onOpen} />; key = "top-as-all"; }
  else                               { page = <TopPage heroVariant={t.heroVariant} onOpen={onOpen} />; key = "top"; }

  // per-page SEO — title tag + meta description resolved from the Site Content
  // registry (draft-aware in ?cms_preview=1), never hardcoded per page.
  useEffect(() => {
    let title, desc;
    if (route.name === "product") {
      const p = window.LB.get(route.id);
      title = p ? p.name + T("seo.product.titleSuffix") : T("seo.top.title");
      desc = p ? p.copy : T("seo.top.desc");
    } else if (route.name === "category") {
      const cat = window.LB.CATEGORIES.find(c => c.key === route.cat);
      title = (cat ? cat.en : route.cat) + T("seo.category.titleSuffix");
      desc = (cat && cat.blurb) || T("seo.top.desc");
    } else if (route.name === "all") { title = T("seo.all.title"); desc = T("seo.all.desc"); }
    else if (route.name === "saved") { title = T("seo.saved.title"); desc = T("seo.top.desc"); }
    else if (route.name === "feature") { const fa = window.LBStore && window.LBStore.getArticle && window.LBStore.getArticle(route.key); if (fa) { title = fa.title + " | LOVABLE"; desc = fa.excerpt || ""; } }
    else { title = T("seo.top.title"); desc = T("seo.top.desc"); }
    if (title) document.title = title;
    if (desc) {
      let m = document.querySelector('meta[name="description"]');
      if (!m) { m = document.createElement("meta"); m.setAttribute("name", "description"); document.head.appendChild(m); }
      m.setAttribute("content", desc);
    }
  }, [route.name, route.id, route.cat]);

  // handle top-anchor on load
  useEffect(() => {
    if (route.name === "top" && route.anchor) {
      setTimeout(() => { const el = document.getElementById(route.anchor); if (el) el.scrollIntoView({ behavior:"smooth" }); }, 120);
    }
  }, [route.name, route.anchor, t.heroVariant]);

  return (
    <React.Fragment>
      <Header onSearch={() => setSearchOpen(true)} />
      <AdminBackLink />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
      <BottomNav />
      <PageFade routeKey={key + ":" + (route.name==="top"?t.heroVariant:"")}>
        <ErrorBoundary scope={"page:" + key} resetKey={key}
          fallback={() => (
            <main className="wrap sect" style={{textAlign:"center"}}>
              <p className="eyebrow" style={{marginBottom:12}}>Something went wrong</p>
              <h2 className="section-title" style={{marginBottom:16}}>{T("error.title")}</h2>
              <p style={{color:"var(--muted)",marginBottom:22}}>{T("error.body")}</p>
              <button className="btn btn--dark" onClick={()=>window.LBnav("/")}>{T("error.cta")}</button>
            </main>
          )}>
          {page}
        </ErrorBoundary>
      </PageFade>
      <Footer />

      <TweaksPanel>
        <TweakSection label="Hero" />
        <TweakRadio label="Heroレイアウト" value={t.heroVariant}
          options={[{value:"stack",label:"Cover"},{value:"split",label:"Split"},{value:"editorial",label:"Bleed"}]}
          onChange={(v) => setTweak("heroVariant", v)} />
        <TweakSection label="Theme" />
        <TweakRadio label="トーン" value={t.theme}
          options={[{value:"light",label:"Ivory"},{value:"dark",label:"Luxe"}]}
          onChange={(v) => setTweak("theme", v)} />
        <TweakColor label="アクセント" value={t.accent}
          options={["#6b4e34","#4d3722","#8a6a45","#c9a96a","#1a1a1a"]}
          onChange={(v) => setTweak("accent", v)} />
      </TweaksPanel>
    </React.Fragment>
  );
}

/* hex shade helper */
function shade(hex, amt) {
  try {
    const h = hex.replace("#",""); const n = parseInt(h.length===3 ? h.split("").map(c=>c+c).join("") : h, 16);
    let r = (n>>16)&255, g = (n>>8)&255, b = n&255;
    const f = amt < 0 ? (1+amt) : 1;
    const add = amt < 0 ? 0 : 255*amt;
    r = Math.round(r*f + add); g = Math.round(g*f + add); b = Math.round(b*f + add);
    r=Math.max(0,Math.min(255,r)); g=Math.max(0,Math.min(255,g)); b=Math.max(0,Math.min(255,b));
    return "#" + [r,g,b].map(x=>x.toString(16).padStart(2,"0")).join("");
  } catch { return hex; }
}


/* ---------- Static pages: About / Privacy / Affiliate ---------- */
function StaticPage({ title, children }) {
  React.useEffect(() => { window.scrollTo({top:0}); }, []);
  return (
    <main className="wrap-wide sect" style={{maxWidth:720,margin:"0 auto",padding:"40px 20px 80px"}}>
      <h1 className="section-title" style={{marginBottom:32}}>{title}</h1>
      <div style={{lineHeight:1.9,color:"var(--fg)",fontSize:"clamp(14px,2vw,15.5px)"}}>
        {children}
      </div>
    </main>
  );
}

function AboutPage() {
  return (
    <StaticPage title="About">
      <p>はじめまして、いっくんです。</p>
      <br/>
      <p>このサイトは、Instagramで紹介している「買ってよかったもの」「最近のお気に入り」をまとめたショッピングメディアです。</p>
      <br/>
      <p>洋服・コスメ・美容アイテム・ライフスタイルグッズなど、実際に使って「これよかった！」と感じたものだけを厳選しています。各商品ページから楽天・Amazon・Qoo10などへ直接購入しにいけます。</p>
      <br/>
      <p>「Instagramで見た商品がどこで買えるか分からない」をなくすために作りました。気になったものはぜひここで探してみてください。</p>
      <br/>
      <p style={{marginTop:24}}>
        {T("footer.igUrl") && <><a href={T("footer.igUrl")} target="_blank" rel="noopener noreferrer" style={{color:"var(--gold)"}}>Instagram</a>もフォローしてもらえると嬉しいです。</>}
      </p>
    </StaticPage>
  );
}

function PrivacyPage() {
  return (
    <StaticPage title="プライバシーポリシー">
      <h2 style={{fontSize:"1.1em",fontWeight:600,marginBottom:8,marginTop:24}}>個人情報の収集について</h2>
      <p>本サイトでは、お気に入り機能のためにブラウザのローカルストレージを使用しています。サーバーへの個人情報の送信は行っていません。</p>
      <h2 style={{fontSize:"1.1em",fontWeight:600,marginBottom:8,marginTop:24}}>アクセス解析について</h2>
      <p>本サイトでは、アクセス状況を把握するためにGoogle Analyticsを使用する場合があります。Google Analyticsはクッキーを使用してデータを収集しますが、個人を特定する情報は収集しません。</p>
      <h2 style={{fontSize:"1.1em",fontWeight:600,marginBottom:8,marginTop:24}}>アフィリエイトリンクについて</h2>
      <p>本サイトには楽天市場・Amazon・Qoo10・TikTok Shopへのアフィリエイトリンクが含まれています。リンクから購入いただいた場合、当サイトに一定の報酬が発生することがあります。</p>
      <h2 style={{fontSize:"1.1em",fontWeight:600,marginBottom:8,marginTop:24}}>免責事項</h2>
      <p>本サイトに掲載している情報は、できる限り正確な情報を提供するよう努めていますが、価格・在庫・仕様は変更になる場合があります。各ストアの最新情報をご確認ください。</p>
      <p style={{marginTop:32,color:"var(--fg-soft)",fontSize:"0.9em"}}>最終更新：2026年</p>
    </StaticPage>
  );
}

function AffiliatePage() {
  return (
    <StaticPage title="アフィリエイト・PR について">
      <p>本サイトはアフィリエイトプログラムを利用しています。</p>
      <br/>
      <h2 style={{fontSize:"1.1em",fontWeight:600,marginBottom:8,marginTop:16}}>参加しているアフィリエイトプログラム</h2>
      <ul style={{paddingLeft:20,lineHeight:2.2}}>
        <li>楽天アフィリエイト（楽天市場）</li>
        <li>Amazonアソシエイト（Amazon.co.jp）</li>
        <li>Qoo10アフィリエイト</li>
        <li>TikTok Shopアフィリエイト</li>
      </ul>
      <br/>
      <p>商品ページの購入ボタンはアフィリエイトリンクです。リンクを経由してご購入いただいた場合、当サイトに一定の紹介料が発生することがあります。</p>
      <br/>
      <p>ただし、<strong>紹介料のためだけに商品を掲載することはしません</strong>。実際に使ってよかったと感じたものだけを紹介しています。</p>
      <br/>
      <p>価格・在庫・キャンペーン内容は各ストアでご確認ください。</p>
    </StaticPage>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <FavProvider><App /></FavProvider>
);
