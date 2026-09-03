/* ============================================================
   LOVABLE — Header, Footer, Search
   ============================================================ */

function Logo({ className = "" }) {
  const site = (window.LB && window.LB.site) || {};
  const sub = T("header.subtitle");
  return (
    <a href="#/" className={"hdr__logo " + className} onClick={(e)=>{ e.preventDefault(); window.LBnav("/"); }}>
      {site.logo
        ? <img className="hdr__logo-img" src={site.logo} alt={site.logoText || "LOVABLE"} style={{ height: (Number(site.logoHeight) || 34) + "px" }} />
        : (site.logoText ? site.logoText : <>LOV<b>A</b>BLE</>)}
      {sub ? <small>{sub}</small> : null}
    </a>
  );
}

/* NAV is CMS-managed (LBStore.navItems, exposed as window.LB.NAV) — no hardcoded array here. */
/* NAV is CMS-managed (LBStore.navItems, exposed as window.LB.NAV) — no hardcoded array here.
   When HOME is switched off (site.showHomePage=false), any nav item pointing at "/" is hidden
   so the menu never links to a page that no longer renders; "All" (already first) becomes
   the effective landing entry — no reordering needed. */
function useNav() {
  const compute = () => {
    const items = (window.LB && window.LB.NAV) || [];
    const showHome = window.LB && window.LB.site ? window.LB.site.showHomePage !== false : true;
    return showHome ? items : items.filter(n => n.url !== "/" && n.url !== "");
  };
  const [items, setItems] = useState(compute);
  useEffect(() => {
    const h = () => setItems(compute());
    window.addEventListener("lb:store", h);
    return () => window.removeEventListener("lb:store", h);
  }, []);
  return items;
}

function Header({ onSearch }) {
  const fav = useFav();
  const navItems = useNav();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 12);
    h(); window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  return (
    <header className={"hdr" + (scrolled ? " hdr--scrolled" : "")}>
      <div className="wrap-wide hdr__bar">
        <Logo />
        <nav className="hdr__nav">
          {navItems.map(n => (
            <a key={n.id} href={"#"+n.url}
               onClick={(e)=>{ e.preventDefault(); window.LBnav(n.url); }}>{n.icon ? n.icon + " " : ""}{n.title}</a>
          ))}
        </nav>
        <div className="hdr__actions">
          <button className="iconbtn" aria-label={T("header.searchAriaLabel")} onClick={onSearch}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
          </button>
          <button className="iconbtn" aria-label={T("header.favBadgeAria")} onClick={()=>window.LBnav("/saved")}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 20.5S3.5 15 3.5 9.2C3.5 6.4 5.7 4.5 8.1 4.5c1.7 0 3.1.9 3.9 2.3C12.8 5.4 14.2 4.5 15.9 4.5c2.4 0 4.6 1.9 4.6 4.7C20.5 15 12 20.5 12 20.5Z"/></svg>
            {fav.favs.length > 0 && <span className="iconbtn__count">{fav.favs.length}</span>}
          </button>
          <button className="iconbtn hdr__menu" aria-label="メニュー" onClick={onSearch}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
          </button>
        </div>
      </div>
    </header>
  );
}

/* ---------- Search overlay ---------- */
function SearchOverlay({ open, onClose }) {
  const [q, setQ] = useState("");
  const inputRef = useRef(null);
  useEffect(() => { if (open) setTimeout(() => inputRef.current && inputRef.current.focus(), 80); }, [open]);
  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  const tags = ["韓国コスメ", "ミニバッグ", "美容家電", "とろみブラウス", "日焼け止め", "旅行ポーチ", "華奢アクセ"];
  const results = q.trim()
    ? LB.PRODUCTS.filter(p =>
        (p.name + p.brand + p.sub + p.cat + p.tag).toLowerCase().includes(q.toLowerCase())).slice(0, 6)
    : [];

  return (
    <div className={"search" + (open ? " search--open" : "")} onClick={onClose}>
      <div className="search__box" onClick={(e)=>e.stopPropagation()}>
        <div className="search__field">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
          <input ref={inputRef} value={q} onChange={(e)=>setQ(e.target.value)} placeholder={T("header.searchPlaceholder")} />
          <button className="search__close" onClick={onClose}>{T("header.searchClose")}</button>
        </div>
        {results.length > 0 ? (
          <div className="search__results">
            {results.map(p => (
              <div key={p.id} className="search__res" onClick={()=>{ onClose(); window.LBnav("/product/"+p.id); }}>
                <Ph grad={p.grad} />
                <div><b>{p.name}</b><br/><span>{p.brand} · ¥{p.price.toLocaleString()}</span></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="search__tags">
            <div className="search__hint">{T("header.searchHint")}</div>
            {tags.map(t => <button key={t} className="pill" onClick={()=>setQ(t)}>{t}</button>)}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- Footer ---------- */
function Footer() {
  const col = (title, links) => (
    <div className="ftr__col">
      <h4>{title}</h4>
      {links.map(([l, href]) => (
        <a key={l} href={"#"+href} onClick={(e)=>{ e.preventDefault(); window.LBnav(href); }}>{l}</a>
      ))}
    </div>
  );
  return (
    <footer className="ftr">
      <div className="wrap-wide">
        <div className="ftr__top">
          <div className="ftr__brand">
            <Logo />
            <p>{T("footer.brandBlurb")}</p>
          </div>
          {col(T("footer.colShop"), [["All Items","/all"],["Beauty","/category/beauty"],["Fashion","/category/fashion"],["Lifestyle","/category/lifestyle"],["Travel","/category/travel"]])}
          {col(T("footer.colRead"), [["ジャーナルをすべて見る","/journal"]])}
          {col(T("footer.colAbout"), [["このサイトについて","/page/about"],["お問い合わせ","/page/contact"],["プライバシー","/page/privacy"],["運営者","/page/operator"]])}
        </div>
        <div className="ftr__bot">
          <small>{T("footer.copyright")} · <a href="admin.html" style={{textDecoration:"underline",opacity:.7}}>{T("footer.adminLinkLabel")}</a></small>
          <p className="ftr__disc">{T("footer.disclaimer")}</p>
        </div>
      </div>
    </footer>
  );
}

Object.assign(window, { Header, Footer, SearchOverlay, Logo });
