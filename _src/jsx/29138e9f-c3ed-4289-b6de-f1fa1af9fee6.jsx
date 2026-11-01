/* ============================================================
   LOVABLE — TOP page
   ============================================================ */

/* ---------- HERO (3 variants via tweak) ---------- */
function Hero({ variant }) {
  const site = (window.LB.site && window.LB.site.hero) || {};
  const headlineRaw = site.copy || "ときめくものだけ、日常に。";
  const headline = <>{String(headlineRaw).split("\n").map((l, i) => <React.Fragment key={i}>{i > 0 && <br />}{l}</React.Fragment>)}</>;
  const titleSize = Number(site.copySize) || 70;
  const sub = site.sub
    ? <>{site.sub.split("\n").map((l, i) => <React.Fragment key={i}>{i > 0 && <br />}{l}</React.Fragment>)}</>
    : null;
  const heroImg = site.image || null;
  const tiles = Array.isArray(site.images) ? site.images : [];

  if (variant === "split") {
    return (
      <section className="hero hero--split">
        <div className="hero__copy">
          <span className="eyebrow reveal in">{T("top.hero.eyebrow.split")}</span>
          <h1 className="hero__title display reveal in">{headline}</h1>
          <p className="hero__sub reveal in">{sub}</p>
          <div className="hero__cta reveal in">
            <button className="btn btn--dark" onClick={() => window.LBnav("/#ranking")}>{T("top.hero.ctaRanking")}</button>
            <button className="btn btn--ghost" onClick={() => window.LBnav("/category/beauty")}>{T("top.hero.ctaBeauty")}</button>
          </div>
        </div>
        <div className="hero__art hero__art--split">
          <Ph eager grad={LB.GRAD.blush} img={heroImg} label="Editorial Hero" ratio="3 / 4" labelSize={18} className="hero__img hero__img--a" />
          <Ph grad={LB.GRAD.cocoa} label="Closet Story" ratio="3 / 4" labelSize={15} className="hero__img hero__img--b" />
        </div>
      </section>);

  }

  if (variant === "editorial") {
    return (
      <section className="hero hero--editorial">
        <Ph eager grad={LB.GRAD.taupe} img={heroImg} ratio="16 / 9" className="hero__bleed" labelSize={0}>
          <div className="hero__veil"></div>
          <div className="hero__editorial-inner wrap-wide">
            <span className="eyebrow reveal in" style={{ color: "#fff" }}>{T("top.hero.eyebrow.editorial")}</span>
            <h1 className="hero__title display reveal in" style={{ color: "#fff" }}>{headline}</h1>
            <p className="hero__sub reveal in" style={{ color: "rgba(255,255,255,.86)" }}>{sub}</p>
            <button className="btn reveal in" style={{ background: "#fff", color: "#1a1a1a" }} onClick={() => window.LBnav("/all")}>{T("top.hero.ctaEditorial")}</button>
          </div>
        </Ph>
      </section>);

  }

  // default: "stack" — centered, magazine cover feel
  return (
    <section className="hero hero--stack">
      <div className="hero__stack-head wrap">
        <span className="eyebrow reveal in">{T("top.hero.eyebrow.stack")}</span>
        <h1 className="hero__title display reveal in" style={{ fontSize: "min(" + titleSize + "px, 11vw)", color: "#7b5544" }}>{headline}</h1>
        <p className="hero__sub reveal in">{sub}</p>
      </div>
      <div className="hero__lead reveal in" style={{textAlign:"center",marginBottom:"10px"}}>
        <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap",marginTop:14}}>
          <button className="btn btn--dark" onClick={() => window.LBnav("/all")}>商品をすべて見る</button>
          {!T("footer.igUrl") && <button className="btn btn--ghost" onClick={() => window.LBnav("/#ranking")}>おすすめランキング</button>}
        </div>
      </div>
      <nav className="hero__cats reveal in">
        {LB.CATEGORIES.map((c) => {
          const navImg = (() => { try { return localStorage.getItem("LB_navimg_" + c.key) || ""; } catch(e) { return ""; } })();
          return (
            <a key={c.key} className="hero__cat" href={"#/category/" + c.key}
              onClick={(e) => {e.preventDefault();window.LBnav("/category/" + c.key);}}>
              {navImg
                ? <img src={navImg} className="hero__cat-img" alt="" />
                : c.icon ? <span className="hero__cat-icon">{c.icon}</span> : null}
              <span className="hero__cat-jp">{c.jp}</span>
              <span className="hero__cat-en">{c.en}</span>
            </a>
          );
        })}
      </nav>
      {/* 2026-11-01 4枚の画像タイル（hero__strip、PCのみ表示・SPは非表示だった）はユーザー判断で廃止。
          画像データ（site.hero.images）が重かったため。tiles 変数は残しているが未使用 */}
    </section>);}

/* ---------- Category grid ---------- */
function CategoryGrid({ onOpen }) {
  return (
    <section className="wrap-wide sect" id="categories">
      <div className="section-head reveal">
        <div>
          <span className="eyebrow">{T("top.categories.eyebrow")}</span>
          <h2 className="section-title">{T("top.categories.title")}</h2>
        </div>
        <a className="link-more" href="#/all" onClick={(e) => {e.preventDefault();window.LBnav("/all");}}>{T("top.categories.more")}<span className="arrow"></span></a>
      </div>
      <div className="catgrid">
        {LB.CATEGORIES.map((c, i) =>
        <a key={c.key} className="catcard reveal" style={{ transitionDelay: i * 70 + "ms" }}
        href={"#/category/" + c.key} onClick={(e) => {e.preventDefault();window.LBnav("/category/" + c.key);}}>
            <Ph grad={c.grad} ratio="4 / 5" className="catcard__img" labelSize={0} />
            <div className="catcard__body">
              <div className="catcard__en serif">{c.en}</div>
              <div className="catcard__jp">{c.jp}</div>
              <p className="catcard__blurb">{c.blurb}</p>
              <div className="catcard__subs">{c.subs.map((s) => <span key={s}>{s}</span>)}</div>
            </div>
          </a>
        )}
      </div>
    </section>);

}

/* ---------- Ranking ---------- */
function Ranking({ onOpen }) {
  let ranked = LB.PRODUCTS.filter((p) => p.rank).sort((a, b) => a.rank - b.rank).slice(0, 5);
  // fall back to most-reviewed when nothing is explicitly ranked (e.g. after deletions)
  if (ranked.length === 0) {
    ranked = [...LB.PRODUCTS].sort((a, b) => (b.reviews || 0) - (a.reviews || 0)).slice(0, 5);
  }
  const [hero, ...rest] = ranked;
  if (!hero) return null;
  return (
    <section className="sect sect--sink" id="ranking">
      <div className="wrap-wide">
        <div className="section-head reveal">
          <div>
            <span className="eyebrow">{T("top.ranking.eyebrow")}</span>
            <h2 className="section-title">{T("top.ranking.title")}</h2>
          </div>
          <a className="link-more" href="#/all" onClick={(e) => {e.preventDefault();window.LBnav("/all");}}>{T("top.ranking.more")}<span className="arrow"></span></a>
        </div>
        <div className="rankgrid">
          <article className="rankhero reveal" onClick={() => onOpen(hero.id)}
            role="link" tabIndex={0}
            onKeyDown={(e) => { if (e.target !== e.currentTarget) return; if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen(hero.id); } }}>
            <div className="rankhero__media">
              <Ph grad={hero.imgs ? null : hero.grad} img={hero.imgs && hero.imgs[0]} label={hero.displayName || hero.name} ratio="3 / 4" labelSize={20} imgStyle={{objectFit:"cover",objectPosition:"top center"}} />
              <span className="rankhero__no serif">01</span>
              <div className="card__heart" style={{ opacity: 1, transform: "none" }}><Heart id={hero.id} /></div>
            </div>
            <div className="rankhero__body">
              {hero.badge && <span className="pill pill--active">{hero.badge}</span>}
              <div className="card__brand">{hero.brand}</div>
              <h3 className="rankhero__name serif">{hero.displayName || hero.name}</h3>
              <p className="rankhero__copy">{hero.copy ? hero.copy.slice(0,60)+(hero.copy.length>60?"…":"") : ""}</p>
              {hero.tags && hero.tags.length > 0 && <div className="card__tags rankhero__tags">{hero.tags.slice(0,3).join(' / ')}</div>}
              <div className="rankhero__foot">
                {hero.price > 0 && <span className="card__price">¥{hero.price.toLocaleString()}</span>}
                <button className="btn btn--dark" onClick={(e) => {e.stopPropagation();onOpen(hero.id);}}>{T("top.ranking.cta")}</button>
              </div>
            </div>
          </article>
          <div className="ranklist">
            {rest.map((p, ri) =>
            <article key={p.id} className="rankrow reveal" onClick={() => onOpen(p.id)}
              role="link" tabIndex={0}
              onKeyDown={(e) => { if (e.target !== e.currentTarget) return; if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen(p.id); } }}>
                <span className="rankrow__no serif">{String(p.rank || ri + 2).padStart(2, "0")}</span>
                <Ph grad={p.imgs ? null : p.grad} img={p.imgs && p.imgs[0]} ratio="1 / 1" className="rankrow__img" labelSize={0} imgStyle={{objectFit:"contain",objectPosition:"center center"}} style={{background:"transparent"}} />
                <div className="rankrow__body">
                  <div className="card__brand">{p.brand}</div>
                  <h4 className="rankrow__name">{p.displayName || p.name}</h4>
                  {p.badge && <span className="card__editorial rankrow__editorial">{p.badge}</span>}
                  {p.tags && p.tags.length > 0 && <div className="card__tags rankrow__tags">{p.tags.slice(0,3).join(' / ')}</div>}
                  {p.price > 0 && <span className="card__price">¥{p.price.toLocaleString()}</span>}
                </div>
                <div className="rankrow__right">
                  {p.price > 0 && <span className="card__price">¥{p.price.toLocaleString()}</span>}
                  <div className="rankrow__shops">{(p.links ? Object.keys(LB.SHOPS).filter((s) => p.links[s]) : []).slice(0, 2).map((s) => <span key={s} className={"chip chip--" + s}>{LB.SHOPS[s].short}</span>)}</div>
                </div>
                <div className="rankrow__heart"><Heart id={p.id} /></div>
              </article>
            )}
          </div>
        </div>
      </div>
    </section>);

}

/* ---------- New arrivals ---------- */
function NewArrivals({ onOpen }) {
  const items = LB.PRODUCTS.filter((p) => p.tag === "新着" || p.tag === "再入荷").slice(0, 4);
  const fill = LB.PRODUCTS.slice(0, 4);
  const show = (items.length ? items : fill).slice(0, 4);
  return (
    <section className="wrap-wide sect" id="new">
      <div className="section-head reveal">
        <div>
          <span className="eyebrow">{T("top.new.eyebrow")}</span>
          <h2 className="section-title">{T("top.new.title")}</h2>
        </div>
        <a className="link-more" href="#/all" onClick={(e) => {e.preventDefault();window.LBnav("/all");}}>{T("top.new.more")}<span className="arrow"></span></a>
      </div>
      <div className="prodgrid prodgrid--4">
        {show.map((p, i) => <ProductCard key={p.id} p={p} index={i} onOpen={onOpen} />)}
      </div>
    </section>);

}

/* ---------- Features ---------- */
function Features({ onOpen }) {
  return (
    <section className="sect sect--sink" id="features">
      <div className="wrap-wide">
        <div className="section-head reveal">
          <div>
            <span className="eyebrow">{T("top.features.eyebrow")}</span>
            <h2 className="section-title">{T("top.features.title")}</h2>
          </div>
          <a className="link-more" href="#/all" onClick={(e) => {e.preventDefault();window.LBnav("/all");}}>{T("top.features.more")}<span className="arrow"></span></a>
        </div>
        {/* 2026-11-01 カードは共通の JournalCard（記事ページの関連記事と同じ）。画像の上に文字を重ねない */}
        <div className="jgrid">
          {LB.FEATURES.map((f, i) => window.JournalCard
            ? React.createElement(window.JournalCard, { key: f.key, f, lead: i === 0, delay: i * 60 })
            : null)}
        </div>
      </div>
    </section>);

}


/* ---------- Gift Section ---------- */
function GiftSection({ onOpen }) {
  const gs = (window.LB.site && window.LB.site.giftSection) || {};
  if (!gs.enabled) return null;
  const items = Array.isArray(gs.items) ? gs.items : [];
  if (items.length === 0) return null;
  const cards = items.slice(0, 4).map(item => {
    const p = LB.PRODUCTS.find(pr => pr.id === item.id);
    return p ? { p, comment: item.comment || "" } : null;
  }).filter(Boolean);
  if (cards.length === 0) return null;
  return (
    <section className="wrap-wide sect" id="gifts">
      <div className="section-head reveal">
        <div>
          <span className="eyebrow">THOUGHTFUL GIFTS</span>
          <h2 className="section-title">プレゼントして喜ばれたもの</h2>
          <p className="section-sub">大切な人に贈って、喜んでもらえたお気に入り。</p>
        </div>
      </div>
      <div className="prodgrid prodgrid--4">
        {cards.map(({ p, comment }, i) => (
          <div key={p.id} className="giftcard reveal" style={{transitionDelay: i * 60 + "ms"}}>
            <ProductCard p={p} index={i} onOpen={onOpen} />
            {/* 2026-10-31 GIFT NOTE：ベージュの角丸ボックスと自動の🎁を廃止。コメント本文（登録データ）はそのまま表示 */}
            {comment && <div className="giftcard__note"><span className="giftcard__note-label">GIFT NOTE</span><p className="giftcard__note-text" title={comment}>{comment}</p></div>}
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- Editorial quote band ---------- */
function QuoteBand() {
  return (
    <section className="quoteband reveal">
      <div className="wrap">
        <span className="eyebrow">{T("top.quote.eyebrow")}</span>
        <p className="quoteband__text serif" style={{ color: "rgb(123, 85, 68)" }}>{String(T("top.quote") || "").split("\n").map((l, i) => <React.Fragment key={i}>{i > 0 && <br />}{l}</React.Fragment>)}</p>
      </div>
    </section>);

}


/* ---------- AS SEEN ON SOCIAL ---------- */
function SocialFeatured({ onOpen }) {
  const sf = (window.LB.site && window.LB.site.socialFeatured) || {};
  if (!sf.enabled) return null;
  const ids = Array.isArray(sf.productIds) ? sf.productIds : [];
  if (ids.length === 0) return null;
  const products = ids.map(id => LB.PRODUCTS.find(p => p.id === id)).filter(Boolean).slice(0, 4);
  if (products.length === 0) return null;
  return (
    <section className="sect social-featured" id="social-featured">
      <div className="wrap-wide">
        <div className="section-head reveal">
          <div>
            <span className="eyebrow">{T("top.social.eyebrow")}</span>
            <h2 className="section-title">{T("top.social.title")}</h2>
          </div>
          <a className="link-more" href="#/all" onClick={(e) => {e.preventDefault();window.LBnav("/all");}}>{T("top.categories.more")}<span className="arrow"></span></a>
        </div>
        <div className="socialgrid">
          {products.map((p, i) => (
            <article key={p.id} className="socialcard reveal"
              style={{ transitionDelay: i * 60 + "ms" }}
              role="link" tabIndex={0}
              onKeyDown={(e) => { if (e.target !== e.currentTarget) return; if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen(p.id); } }}
              onClick={() => onOpen(p.id)}>
              <div className="socialcard__media">
                <Ph grad={p.imgs ? null : p.grad} img={p.imgs && p.imgs[0]} ratio="3 / 4" labelSize={0} />
                <div className="card__heart" style={{ opacity: 1, transform: "none" }}><Heart id={p.id} /></div>
              </div>
              <div className="socialcard__body">
                <div className="card__brand">{p.brand}</div>
                <h3 className="socialcard__name">{p.displayName || p.name}</h3>
                {p.price > 0 && <span className="card__price">¥{p.price.toLocaleString()}</span>}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- TOP page composition ---------- */
const SHOW_TOP_TIKTOK_PICKUP = false;
function TopPage({ heroVariant, onOpen }) {
  useReveal([heroVariant]);
  return (
    <main>
      <Hero variant={heroVariant} />
      <SocialFeatured onOpen={onOpen} />
      <Ranking onOpen={onOpen} />
      <NewArrivals onOpen={onOpen} />
      {/* TikTok PICK UP：2026-10-28 TOPページでは非表示（データ・管理機能・商品ページの動画は維持）。
          再表示するときは SHOW_TOP_TIKTOK_PICKUP を true に戻す */}
      {SHOW_TOP_TIKTOK_PICKUP && window.TikTokSection ? React.createElement(window.TikTokSection, {onOpen}) : null}
      <GiftSection onOpen={onOpen} />
      <QuoteBand />
      <Features onOpen={onOpen} />
    </main>);

}

Object.assign(window, { TopPage, Hero });