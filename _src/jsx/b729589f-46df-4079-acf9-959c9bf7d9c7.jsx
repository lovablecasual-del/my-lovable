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
/* 2026-11-01 画像は画面に近づいてから読み込む（loading="lazy"）。最初の画面に出る大きな画像だけ eager を指定する */
function Ph({ grad, label, ratio, className = "", style = {}, children, labelSize = 15, img, alt, imgStyle, eager = false }) {
  const st = { background: img ? "var(--bg)" : (grad || "var(--bg)"), ...style };
  if (ratio) st.aspectRatio = ratio;
  return (
    <div className={"ph " + className} style={st}>
      {img
        ? <img className="ph__img" src={img} alt={alt || label || ""} loading={eager ? "eager" : "lazy"} decoding="async" style={imgStyle||{}} onError={(e) => { const el=e.currentTarget; el.style.display="none"; const wrap=el.closest(".ph"); if(wrap&&!wrap.querySelector(".ph__grain")){const g=document.createElement("div");g.className="ph__grain";wrap.appendChild(g);} }} />
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
  return (
    <article className="card reveal" style={{ transitionDelay: (index%4)*70 + "ms" }}
      onClick={() => onOpen(p.id)} role="link" tabIndex={0}
      onKeyDown={(e) => { if (e.target !== e.currentTarget) return; if (e.key === "Enter") onOpen(p.id); }}>
      <div className="card__media">
        <Ph grad={p.grad} label={p.displayName || p.name} ratio="3 / 4" img={p.imgs && p.imgs[0]} imgStyle={{objectFit:"cover",objectPosition:"top center"}} />
        {showRank && p.rank && <span className="card__rank">{String(p.rank).padStart(2,"0")}</span>}
        {p.editTag && <span className="card__etag">{p.editTag}</span>}
        {p.tag && <span className="card__tag">{p.tag}</span>}
        <div className="card__heart"><Heart id={p.id} /></div>
        <div className="card__shops">
          {(p.links ? Object.keys(LB.SHOPS).filter(s => p.links[s]) : []).slice(0,4)
            .map(s => <span key={s} className={"chip chip--"+s}>{LB.SHOPS[s].short}</span>)}
        </div>
      </div>
      <div className="card__body">
        <div className="card__brand">{p.brand}</div>
        <h3 className="card__name">{p.displayName || p.name}</h3>
        {p.tags && p.tags.length > 0 && <div className="card__tags">{p.tags.slice(0,3).join(' / ')}</div>}
        {p.price > 0 && <div className="card__price">¥{p.price.toLocaleString()}<span className="card__taxnote">税込（参考価格）</span></div>}
        <div className="card__cta">
          <span className="card__ctabtn">詳しく見る →</span>
        </div>
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
  lily: "L",
  other: "W",
};
function ShopButtons({ p, layout = "grid" }) {
  // TikTok always rendered first & emphasized
  const order = ["tiktok", ...p.shops.filter(s => s !== "tiktok")];
  const linkShops = Object.keys(p.links || {}).filter(s => LB.SHOPS[s] && !order.includes(s));
  const allOrder = [...order, ...linkShops];
  const linkFor = (s) => (p.links && p.links[s]) ? p.links[s] : "";
  return (
    <div className={"shopbtns shopbtns--" + layout}>
      {allOrder.map(s => {
        const sh = LB.SHOPS[s];
        const feat = s === "tiktok";
        const url = linkFor(s);
        const ready = !!url;
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
    const els = document.querySelectorAll(".reveal:not(.in)");
    if (!("IntersectionObserver" in window)) { els.forEach(e=>e.classList.add("in")); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    els.forEach(e => io.observe(e));
    const safety = setTimeout(() => els.forEach(e => e.classList.add("in")), 2600);
    return () => { io.disconnect(); clearTimeout(safety); };
  }, deps);
}

Object.assign(window, { FavProvider, useFav, Ph, Heart, Stars, Badges, ProductCard, ShopButtons, useReveal, SHOP_ICON });
