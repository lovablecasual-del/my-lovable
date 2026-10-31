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

function MobileNav({ open, onClose }) {
  const navItems = useNav();
  const firstLinkRef = useRef(null);
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      // focus first nav link for keyboard users
      setTimeout(() => { firstLinkRef.current && firstLinkRef.current.focus(); }, 50);
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);
  useEffect(() => {
    const h = (e) => { if (e.key === "Escape" && open) onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="mnav" role="dialog" aria-modal="true" aria-label="ナビゲーションメニュー" onClick={onClose}>
      <div id="mnav-panel" className="mnav__panel" onClick={e=>e.stopPropagation()}>
        <div className="mnav__head">
          <Logo />
          <button className="iconbtn" aria-label="メニューを閉じる" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <nav className="mnav__nav" role="navigation" aria-label="メインナビゲーション">
          {navItems.map((n, i) => (
            <a key={n.id} className="mnav__link" href={"#"+n.url}
              ref={i === 0 ? firstLinkRef : null}
              onClick={(e)=>{ e.preventDefault(); onClose(); window.LBnav(n.url); }}>
              {(()=>{const MI={"beauty":"beauty","fashion":"fashion","lifestyle":"lifestyle","travel":"travel","ranking":"ranking","journal":"journal"};const k=Object.keys(MI).find(k=>(n.url&&n.url.includes(k))||(n.title&&n.title.toLowerCase()===k));const src=k?"./assets/menu/"+MI[k]+".png":null;return src?<span className="mnav__icon"><img src={src} alt={n.title} className="mnav__icon-img"/></span>:n.icon?<span className="mnav__icon">{n.icon}</span>:null;})()}
              <span>{n.title}</span>
            </a>
          ))}
          <a className="mnav__link" href="#/saved" onClick={(e)=>{ e.preventDefault(); onClose(); window.LBnav("/saved"); }}>
            <span className="mnav__icon">♡</span><span>保存リスト</span>
          </a>
        </nav>
        <div className="mnav__about">
          <a href="#/about" onClick={(e)=>{ e.preventDefault(); onClose(); window.LBnav("/about"); }}>About</a>
          <a href="#/affiliate" onClick={(e)=>{ e.preventDefault(); onClose(); window.LBnav("/affiliate"); }}>PR・アフィリエイト</a>
          <a href="#/privacy" onClick={(e)=>{ e.preventDefault(); onClose(); window.LBnav("/privacy"); }}>プライバシー</a>
        </div>
      </div>
    </div>
  );
}

function Header({ onSearch }) {
  const fav = useFav();
  const navItems = useNav();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 12);
    h(); window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  return (
    <>
    <header className={"hdr" + (scrolled ? " hdr--scrolled" : "")}>
      <div className="wrap-wide hdr__bar">
        <Logo />
        <nav className="hdr__nav">
          {navItems.map(n => {
            const navImg = (() => { try { return localStorage.getItem("LB_navimg_" + n.id) || ""; } catch(e) { return ""; } })();
            return (
              <a key={n.id} href={"#"+n.url}
                 onClick={(e)=>{ e.preventDefault(); window.LBnav(n.url); }}>
                {navImg ? <img src={navImg} style={{width:"clamp(44px,5vw,68px)",height:"clamp(44px,5vw,68px)",objectFit:"contain",flexShrink:0}} alt="" /> : (n.icon ? n.icon + " " : "")}
                {n.title}
              </a>
            );
          })}
        </nav>
        <div className="hdr__actions">
          <button className="iconbtn" aria-label={T("header.searchAriaLabel")} onClick={onSearch}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
          </button>
          <button className="iconbtn" aria-label={T("header.favBadgeAria")} onClick={()=>window.LBnav("/saved")}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M12 20.5S3.5 15 3.5 9.2C3.5 6.4 5.7 4.5 8.1 4.5c1.7 0 3.1.9 3.9 2.3C12.8 5.4 14.2 4.5 15.9 4.5c2.4 0 4.6 1.9 4.6 4.7C20.5 15 12 20.5 12 20.5Z"/></svg>
            {fav.favs.length > 0 && <span className="iconbtn__count">{fav.favs.length}</span>}
          </button>
          <button className="iconbtn hdr__menu" aria-label="メニューを開く" aria-expanded={menuOpen} aria-controls="mnav-panel" onClick={()=>setMenuOpen(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
          </button>
        </div>
      </div>
    </header>
    <MobileNav open={menuOpen} onClose={()=>setMenuOpen(false)} />
    </>
  );
}

/* ---------- Search overlay ---------- */
/* normalise: full-width alpha/num → half-width, lowercase, trim */
function searchNorm(s) {
  return (s || "")
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xFEE0))
    .toLowerCase().trim();
}
function searchMatch(p, norm) {
  const hay = searchNorm(
    [p.displayName, p.name, p.brand, p.sub, p.cat, p.tag].join(" ") +
    " " + (p.tags || []).join(" ")
  );
  return norm.split(/\s+/).every(word => hay.includes(word));
}

function SearchOverlay({ open, onClose }) {
  const [q, setQ] = useState("");
  const inputRef = useRef(null);
  useEffect(() => { if (open) setTimeout(() => inputRef.current && inputRef.current.focus(), 80); }, [open]);
  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  const tags = ["韓国コスメ", "ミニバッグ", "美容家電", "とろみブラウス", "日焼け止め", "旅行ポーチ", "華奢アクセ"];
  const norm = searchNorm(q);
  const allResults = norm ? LB.PRODUCTS.filter(p => searchMatch(p, norm)) : [];
  const results = allResults.slice(0, 8);
  const hasQuery = q.trim().length > 0;

  const goSearch = () => { if (!norm) return; onClose(); window.LBnav("/search/" + encodeURIComponent(q.trim())); };

  return (
    <div className={"search" + (open ? " search--open" : "")} onClick={onClose}>
      <div className="search__box" onClick={(e)=>e.stopPropagation()}>
        <div className="search__field">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
          <input ref={inputRef} value={q} onChange={(e)=>setQ(e.target.value)}
            onKeyDown={(e)=>{ if (e.key==="Enter") goSearch(); }}
            placeholder={T("header.searchPlaceholder")} />
          <button className="search__close" onClick={onClose}>{T("header.searchClose")}</button>
        </div>
        {hasQuery && results.length > 0 ? (
          <div className="search__results">
            {results.map(p => (
              <div key={p.id} className="search__res" onClick={()=>{ onClose(); window.LBnav("/product/"+p.id); }}>
                <Ph grad={p.imgs && p.imgs[0] ? null : p.grad} img={p.imgs && p.imgs[0] || null} ratio="1 / 1" labelSize={0} />
                <div><b>{p.displayName || p.name}</b><br/><span>{p.brand}{p.price ? " · ¥" + p.price.toLocaleString() : ""}</span></div>
              </div>
            ))}
            {allResults.length > 0 && (
              <button className="search__more" onClick={goSearch}>
                {allResults.length}件の結果をすべて見る →
              </button>
            )}
          </div>
        ) : hasQuery ? (
          <div className="search__tags search__empty-state">
            <p className="search__empty-msg">「{q.trim()}」に一致するアイテムが見つかりませんでした。</p>
            <p className="search__empty-sub">キーワードを変えてもう一度検索してみてください</p>
            <div style={{marginTop:"16px",display:"flex",gap:"8px",flexWrap:"wrap"}}>
              <button className="pill" onClick={()=>{ onClose(); window.LBnav("/all"); }}>すべてのアイテムを見る</button>
              {LB.CATEGORIES.slice(0,3).map(c => (
                <button key={c.key} className="pill" onClick={()=>{ onClose(); window.LBnav("/category/"+c.key); }}>{c.en}</button>
              ))}
            </div>
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
  const col = (title, links, mod) => (
    <div className={"ftr__col" + (mod ? " ftr__col--" + mod : "")}>
      <h4>{title}</h4>
      {links.map(([l, href]) => (
        <a key={l} href={"#"+href} onClick={(e)=>{ e.preventDefault(); window.LBnav(href); }}>{
          /* 2026-10-31 長いリンク名は「・」の位置でだけ折り返す（例：アフィリエイト・／PRについて） */
          l.split("・").map((s, i, arr) => <span key={i} style={{ whiteSpace: "nowrap" }}>{s}{i < arr.length - 1 ? "・" : ""}</span>)
        }</a>
      ))}
    </div>
  );
  return (
    <footer className="ftr">
      <div className="wrap-wide">
        <div className="ftr__top">
          {/* 2026-10-31 SPは左列＝ロゴ・SNS・READ／右列＝SHOP・ABOUT。PC・タブレットでは囲みを display:contents にして従来の4列（ロゴ・SHOP・READ・ABOUT）のまま */}
          <div className="ftr__left">
          <div className="ftr__brand">
            <Logo />
            <p>{T("footer.brandBlurb")}</p>
            <div className="ftr__social">
              {T("footer.igUrl") && <a className="iconbtn" href={T("footer.igUrl")} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>
              </a>}
              {T("footer.tiktokUrl") && <a className="iconbtn" href={T("footer.tiktokUrl")} target="_blank" rel="noopener noreferrer" aria-label="TikTok">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 3c.3 2.1 1.5 3.6 3.5 3.9v2.4c-1.3.1-2.5-.3-3.6-1v5.5c0 3.2-2.4 5.7-5.5 5.7S5.4 16.9 5.4 13.8c0-3 2.2-5.3 5.1-5.4v2.5c-.3.1-.7.1-1 .3-1.1.4-1.8 1.5-1.6 2.7.2 1.2 1.2 2 2.4 1.9 1.3 0 2.2-1 2.2-2.5V3h2.9Z"/></svg>
              </a>}
            </div>
          </div>
          {col(T("footer.colRead"), [["JOURNAL 記事一覧","/all"],["Beauty","/category/beauty"],["Fashion","/category/fashion"],["Lifestyle","/category/lifestyle"]], "read")}
          </div>
          <div className="ftr__right">
          {col(T("footer.colShop"), [["All Items","/all"],["Beauty","/category/beauty"],["Fashion","/category/fashion"],["Lifestyle","/category/lifestyle"],["Travel","/category/travel"]], "shop")}
          {col(T("footer.colAbout"), [["About","/about"],["アフィリエイト・PRについて","/affiliate"],["プライバシーポリシー","/privacy"]], "about")}
          </div>
        </div>
        <div className="ftr__bot">
          <small>{T("footer.copyright")}</small>
          <p className="ftr__disc">{T("footer.disclaimer")}</p>
        </div>
      </div>
    </footer>
  );
}

/* ---------- Mobile bottom navigation ---------- */
function BottomNav() {
  const [hash, setHash] = React.useState(window.location.hash);
  React.useEffect(() => {
    const h = () => setHash(window.location.hash);
    window.addEventListener("hashchange", h);
    return () => window.removeEventListener("hashchange", h);
  }, []);

  const isSaved = hash.startsWith("#/saved");
  const nav = (e) => { e.preventDefault(); window.LBnav("/saved"); };

  return (
    <div className="bnav">
      <a href="#/saved" className={"bnav__save" + (isSaved ? " bnav__save--on" : "")} onClick={nav} aria-label="保存リスト">
        <svg width="18" height="18" viewBox="0 0 24 24" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
          <path d="M12 20.5C12 20.5 3.5 15 3.5 9.2 3.5 6.4 5.7 4.5 8.1 4.5c1.7 0 3.1.9 3.9 2.3C12.8 5.4 14.2 4.5 15.9 4.5c2.4 0 4.6 1.9 4.6 4.7C20.5 15 12 20.5 12 20.5Z"/>
        </svg>
        <span>{isSaved ? "保存リスト" : "保存リスト"}</span>
      </a>
    </div>
  );
}

Object.assign(window, { Header, Footer, SearchOverlay, Logo, BottomNav });
