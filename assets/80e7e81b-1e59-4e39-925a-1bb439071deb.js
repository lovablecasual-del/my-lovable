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
    if (parts[0] === "article")  return { name: "article", id: parts[1], raw: h };
    if (parts[0] === "page")     return { name: "page", slug: parts[1], raw: h };
    if (parts[0] === "saved")    return { name: "saved", raw: h };
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

/* ---------- back-to-admin link (operators only) ---------- */
function AdminBackLink() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    try { setShow(sessionStorage.getItem("lovable.admin.auth") === "1"); } catch (e) {}
  }, []);
  if (!show) return null;
  return (
    <a href="admin.html" className="adminback" title="管理画面に戻る">
      ← 管理画面に戻る
    </a>
  );
}

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
  else if (route.name === "article") { page = <ArticlePage id={route.id} onOpen={onOpen} />; key = "article:"+route.id; }
  else if (route.name === "page")    { page = <StaticPage slug={route.slug} />; key = "page:"+route.slug; }
  else if (route.name === "category"){ page = <CategoryPage catKey={route.cat} onOpen={onOpen} />; key = "category:"+route.cat; }
  else if (route.name === "all")     { page = <AllPage onOpen={onOpen} />; key = "all"; }
  else if (route.name === "saved")   { page = <SavedPage onOpen={onOpen} />; key = "saved"; }
  else if (!showHome)                { page = <AllPage onOpen={onOpen} />; key = "top-as-all"; }  // "/" — HOME disabled: reuse AllPage, no hero/brand-copy/category sections, URL unchanged
  else                               { page = <TopPage heroVariant={t.heroVariant} onOpen={onOpen} />; key = "top"; }

  // per-page SEO — title tag + meta description resolved from the Site Content
  // registry (draft-aware in ?cms_preview=1), never hardcoded per page.
  useEffect(() => {
    let title, desc;
    if (route.name === "product") {
      const p = window.LB.get(route.id);
      title = p ? p.name + T("seo.product.titleSuffix") : T("seo.top.title");
      desc = p ? p.copy : T("seo.top.desc");
    } else if (route.name === "article") {
      const a = window.LBStore && window.LBStore.getArticle(route.id);
      title = a ? a.title + T("seo.article.titleSuffix") : T("seo.top.title");
      desc = a ? ((a.seo && a.seo.desc) || a.excerpt) : T("seo.top.desc");
    } else if (route.name === "page") {
      const def = window.PAGES && window.PAGES[route.slug];
      title = def ? T(def.titleKey) + T("seo.page.titleSuffix") : T("seo.top.title");
      desc = T("seo.top.desc");
    } else if (route.name === "category") {
      const cat = window.LB.CATEGORIES.find(c => c.key === route.cat);
      title = (cat ? cat.en : route.cat) + T("seo.category.titleSuffix");
      desc = (cat && cat.blurb) || T("seo.top.desc");
    } else if (route.name === "all") { title = T("seo.all.title"); desc = T("seo.all.desc"); }
    else if (route.name === "saved") { title = T("seo.saved.title"); desc = T("seo.top.desc"); }
    else { title = T("seo.top.title"); desc = T("seo.top.desc"); }
    if (title) document.title = title;
    if (desc) {
      let m = document.querySelector('meta[name="description"]');
      if (!m) { m = document.createElement("meta"); m.setAttribute("name", "description"); document.head.appendChild(m); }
      m.setAttribute("content", desc);
    }
  }, [route.name, route.id, route.cat, route.slug]);

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

ReactDOM.createRoot(document.getElementById("root")).render(
  <FavProvider><App /></FavProvider>
);
