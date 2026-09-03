/* ============================================================
   LOVABLE — shared components
   ============================================================ */
const { useState, useEffect, useRef, useCallback, createContext, useContext } = React;
const LB = window.LB;

/* ---------- Favorites store (localStorage) ---------- */
const FAV_KEY = "lovable.favs.v1";
const FavCtx = createContext(null);

function FavProvider({ children }) {
  const [favs, setFavs] = useState(() => {
    try { return JSON.parse(localStorage.getItem(FAV_KEY)) || []; } catch { return []; }
  });
  useEffect(() => {
    try { localStorage.setItem(FAV_KEY, JSON.stringify(favs)); } catch {}
  }, [favs]);
  const toggle = useCallback((id) => {
    setFavs(f => f.includes(id) ? f.filter(x => x !== id) : [...f, id]);
  }, []);
  return <FavCtx.Provider value={{ favs, toggle, has: (id) => favs.includes(id) }}>{children}</FavCtx.Provider>;
}
const useFav = () => useContext(FavCtx);

/* ---------- Placeholder image ---------- */
function Ph({ grad, label, ratio, className = "", style = {}, children, labelSize = 15, img, imgStyle, alt }) {
  const st = { background: grad || "var(--beige)", ...style };
  if (ratio) st.aspectRatio = ratio;
  return (
    <div className={"ph " + className} style={st}>
      {img
        ? <img className="ph__img" src={img} alt={alt || label || ""} loading="lazy" style={imgStyle} />
        : <div className="ph__grain"></div>}
      {label && !img && <div className="ph__label" style={{ fontSize: labelSize }}>{label}</div>}
      {children}
    </div>
  );
}

/* ---------- Heart button ---------- */
function Heart({ id, onLight = false }) {
  const fav = useFav();
  const on = fav.has(id);
  const [burst, setBurst] = useState(false);
  return (
    <button
      className={"heart" + (on ? " heart--on" : "") + (burst ? " heart--burst" : "")}
      aria-label={on ? "お気に入りから外す" : "お気に入りに保存"}
      aria-pressed={on}
      onClick={(e) => { e.stopPropagation(); e.preventDefault(); if (!on) { setBurst(true); setTimeout(() => setBurst(false), 460); } fav.toggle(id); }}
      style={onLight ? {} : {}}
    >
      <svg viewBox="0 0 24 24">
        <path className="heart__path" d="M12 20.5C12 20.5 3.5 15 3.5 9.2 3.5 6.4 5.7 4.5 8.1 4.5c1.7 0 3.1.9 3.9 2.3C12.8 5.4 14.2 4.5 15.9 4.5c2.4 0 4.6 1.9 4.6 4.7C20.5 15 12 20.5 12 20.5Z"/>
      </svg>
    </button>
  );
}

/* ---------- Rating stars ---------- */
function Stars({ value, size = 13 }) {
  return (
    <span className="stars" style={{ "--s": size + "px" }} aria-label={`評価 ${value}`}>
      {[0,1,2,3,4].map(i => {
        const fill = Math.max(0, Math.min(1, value - i));
        return (
          <span key={i} className="star">
            <span className="star__bg">★</span>
            <span className="star__fg" style={{ width: (fill*100)+"%" }}>★</span>
          </span>
        );
      })}
    </span>
  );
}

/* ---------- Product card ---------- */
/* ---------- Product badges (generic, multi-badge) ---------- */
function Badges({ p, className = "", max }) {
  const list = (window.LBBadges ? window.LBBadges.resolve(p) : []);
  if (!list.length) return null;
  const shown = max ? list.slice(0, max) : list;
  return (
    <div className={"badges " + className} role="list" aria-label="商品バッジ">
      {shown.map(b => b.iconOnly ? (
        <span key={b.key} className={"badge-icon badge-icon--" + b.tone} role="listitem" aria-label={b.desc || b.label} title={b.label}>
          <span aria-hidden="true">{b.icon}</span>
        </span>
      ) : (
        <span key={b.key} className={"badge badge--" + b.tone} role="listitem" title={b.desc}>
          <span className="badge__i" aria-hidden="true">{b.icon}</span>
          <span className="badge__t">{b.label}</span>
        </span>
      ))}
    </div>
  );
}

function ProductCardInner({ p, onOpen, index = 0, showRank = false }) {
  // Some products' "tag" is really a shop label (e.g. "Rakuten Fashion") —
  // the shop chips below already convey that; showing it twice as a sticker
  // on the photo reads as an affiliate listing. Only genuinely descriptive
  // tags (新着 / 韓国 etc.) get shown as the on-image pill.
  // Real tag values seen in data are things like "Rakuten Fashion" — match
  // against shop keys/names/short labels AND common shop brand words, since
  // the tag text doesn't consistently match LB.SHOPS' own (Japanese) labels.
  const SHOP_WORDS = ["rakuten","amazon","qoo10","tiktok","楽天","アマゾン"];
  const isShopNameTag = p.tag && SHOP_WORDS.some(w => p.tag.toLowerCase().includes(w));
  return (
    <article className="card reveal" style={{ transitionDelay: (index%4)*70 + "ms" }}
      onClick={() => onOpen(p.id)} role="link" tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter") onOpen(p.id); }}>
      <div className="card__media">
        <Ph grad={p.grad} label={p.name} ratio="3 / 4" img={p.imgs && p.imgs[0]} />
        {showRank && p.rank && <span className="card__rank">{String(p.rank).padStart(2,"0")}</span>}
        {p.tag && !isShopNameTag && <span className="card__tag">{p.tag}</span>}
        <Badges p={p} className="card__badges" max={2} />
        <div className="card__heart"><Heart id={p.id} /></div>
        <div className="card__shops">
          {(p.links ? Object.keys(LB.SHOPS).filter(s => p.links[s]) : []).slice(0,4)
            .map(s => <span key={s} className={"chip chip--"+s}>{LB.SHOPS[s].short}</span>)}
        </div>
      </div>
      <div className="card__body">
        <div className="card__brand">{p.brand}</div>
        <h3 className="card__name">{p.name}</h3>
        {p.copy && <p className="card__copy">{p.copy}</p>}
        <div className="card__meta">
          <Stars value={p.rating} />
          <span className="card__rev">({p.reviews.toLocaleString()})</span>
        </div>
        <div className="card__price">¥{p.price.toLocaleString()}<span className="card__taxnote">税込 / 目安</span></div>
      </div>
    </article>
  );
}
/* isolate each card: a single broken product can't break the grid */
function ProductCard(props) {
  if (!props || !props.p || !props.p.id) return null;
  const EB = window.ErrorBoundary;
  if (!EB) return <ProductCardInner {...props} />;
  return (
    <EB scope={"card:" + props.p.id} resetKey={props.p.id} silent={true}>
      <ProductCardInner {...props} />
    </EB>
  );
}

/* ---------- EC / retailer buttons ---------- */
const SHOP_ICON = {
  tiktok: "♪",
  rakuten: "R",
  amazon: "a",
  qoo10: "Q",
};
function ShopButtons({ p, layout = "grid" }) {
  // Only show shops that actually have a working link — never lead with a
  // dead placeholder button. A shop is only visually "featured" if it's
  // both flagged as such (LB.SHOPS[s].feature) and actually usable.
  const linkFor = (s) => (p.links && p.links[s]) ? p.links[s] : "";
  const order = Object.keys(LB.SHOPS).filter(s => linkFor(s));
  return (
    <div className={"shopbtns shopbtns--" + layout}>
      {!order.length && <p style={{fontSize:13,color:"var(--fg-muted)",margin:"4px 0"}}>現在、購入先を準備中です。</p>}
      {order.map(s => {
        const sh = LB.SHOPS[s];
        const url = linkFor(s);
        const ready = !!url;
        const feat = !!sh.feature && ready;
        return (
          <a key={s}
             href={ready ? url : "#"}
             target={ready ? "_blank" : undefined}
             rel={ready ? "sponsored noopener noreferrer" : undefined}
             onClick={ready ? undefined : (e)=>e.preventDefault()}
             aria-disabled={ready ? undefined : "true"}
             className={"shopbtn" + (feat ? " shopbtn--feature" : "") + (ready ? "" : " shopbtn--pending")}
             style={{ "--sa": sh.accent }}>
            <span className="shopbtn__mark">{SHOP_ICON[s]}</span>
            <span className="shopbtn__txt">
              <span className="shopbtn__lead">{ready ? (feat ? T("pdp.shopBtnFeatCta") : T("pdp.shopBtnCta")) : T("pdp.shopBtnUnset")}</span>
              <span className="shopbtn__name">{sh.name}</span>
            </span>
            <span className="shopbtn__arrow" aria-hidden="true">↗</span>
          </a>
        );
      })}
    </div>
  );
}

/* ---------- Section reveal-on-scroll hook ---------- */
function useReveal(deps = []) {
  useEffect(() => {
    if (!("IntersectionObserver" in window)) {
      document.querySelectorAll(".reveal:not(.in)").forEach(e => e.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    document.querySelectorAll(".reveal:not(.in)").forEach(e => io.observe(e));
    // Product/article data now loads from Supabase asynchronously, so
    // sections can render *after* this effect already ran (data arrives
    // post first-paint). Those late elements would otherwise never be
    // queried/observed above and would stay invisible (.reveal without
    // .in) forever — watch the DOM for anything added later and hook it
    // into the same observer.
    const revealLate = (e) => {
      io.observe(e);
      // Content that shows up after this effect's initial scan is almost
      // always async data that just finished loading (products/articles
      // from Supabase), not something the visitor scrolled to — reveal it
      // right away instead of gambling on the intersection callback firing
      // for a post-hoc observe() call, which isn't reliable in every
      // environment. The IntersectionObserver above still owns the normal
      // scroll-reveal animation for whatever was already on the page.
      setTimeout(() => e.classList.add("in"), 50);
    };
    const mo = new MutationObserver((mutations) => {
      mutations.forEach((m) => m.addedNodes.forEach((node) => {
        if (node.nodeType !== 1) return;
        if (node.matches && node.matches(".reveal:not(.in)")) revealLate(node);
        if (node.querySelectorAll) node.querySelectorAll(".reveal:not(.in)").forEach(revealLate);
      }));
    });
    mo.observe(document.body, { childList: true, subtree: true });
    const safety = setTimeout(() => document.querySelectorAll(".reveal:not(.in)").forEach(e => e.classList.add("in")), 2600);
    return () => { io.disconnect(); mo.disconnect(); clearTimeout(safety); };
  }, deps);
}

Object.assign(window, { FavProvider, useFav, Ph, Heart, Stars, Badges, ProductCard, ShopButtons, useReveal, SHOP_ICON });
