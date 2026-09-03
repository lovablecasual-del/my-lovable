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
            <div className="ftr__social">
              <a className="iconbtn" href="#" onClick={(e)=>e.preventDefault()} aria-label="Instagram">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>
              </a>
              <a className="iconbtn" href="#" onClick={(e)=>e.preventDefault()} aria-label="TikTok">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 3c.3 2.1 1.5 3.6 3.5 3.9v2.4c-1.3.1-2.5-.3-3.6-1v5.5c0 3.2-2.4 5.7-5.5 5.7S5.4 16.9 5.4 13.8c0-3 2.2-5.3 5.1-5.4v2.5c-.3.1-.7.1-1 .3-1.1.4-1.8 1.5-1.6 2.7.2 1.2 1.2 2 2.4 1.9 1.3 0 2.2-1 2.2-2.5V3h2.9Z"/></svg>
              </a>
              <a className="iconbtn" href="#" onClick={(e)=>e.preventDefault()} aria-label="Pinterest">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-3.6 19.3c-.1-.8-.1-2 .1-2.9l1.1-4.8s-.3-.6-.3-1.4c0-1.3.8-2.3 1.7-2.3.8 0 1.2.6 1.2 1.3 0 .8-.5 2-.8 3.1-.2.9.5 1.6 1.4 1.6 1.6 0 2.8-1.7 2.8-4.2 0-2.2-1.6-3.7-3.8-3.7-2.6 0-4.1 1.9-4.1 3.9 0 .8.3 1.6.7 2 .1.1.1.2.1.3l-.3 1c0 .2-.1.2-.3.1-1.2-.5-1.9-2.2-1.9-3.5 0-2.9 2.1-5.5 6-5.5 3.1 0 5.5 2.2 5.5 5.2 0 3.1-1.9 5.6-4.7 5.6-.9 0-1.8-.5-2.1-1l-.6 2.2c-.2.8-.8 1.9-1.2 2.5A10 10 0 1 0 12 2Z"/></svg>
              </a>
            </div>
          </div>
          {col(T("footer.colShop"), [["All Items","/all"],["Beauty","/category/beauty"],["Fashion","/category/fashion"],["Lifestyle","/category/lifestyle"],["Travel","/category/travel"]])}
          {col(T("footer.colRead"), [["買ってよかった美容","/#features"],["本当に使ってるコスメ","/#features"],["韓国旅行の持ちもの","/#features"],["垢抜けたいあなたへ","/#features"]])}
          {col(T("footer.colAbout"), [["このサイトについて","/"],["お問い合わせ","/"],["プライバシー","/"],["運営者","/"]])}
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
