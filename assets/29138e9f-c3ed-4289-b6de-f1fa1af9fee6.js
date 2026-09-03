/* ============================================================
   LOVABLE — TOP page
   ============================================================ */

/* ---------- HERO (3 variants via tweak) ---------- */
function Hero({ variant }) {
  const site = (window.LB.site && window.LB.site.hero) || {};
  const headlineRaw = site.copy || "暮らしを整える、小さな贅沢。";
  const headline = <>{String(headlineRaw).split("\n").map((l, i) => <React.Fragment key={i}>{i > 0 && <br />}{l}</React.Fragment>)}</>;
  const titleSize = Number(site.copySize) || 70;
  const sub = site.sub
    ? <>{site.sub.split("\n").map((l, i) => <React.Fragment key={i}>{i > 0 && <br />}{l}</React.Fragment>)}</>
    : <>毎日のちょっとしたご褒美に。<br />コスメも、服も、暮らしの道具も。</>;
  const heroImg = site.image || null;
  const tiles = Array.isArray(site.images) ? site.images : [];
  // Tiles can be either a plain data-URL string (legacy) or a
  // { u, x, y, z } crop record (u = image, x/y = focal point %, z = zoom)
  // saved by the admin's "TOP画像" cropper — unwrap either shape here.
  const tileVal = (t) => (t && typeof t === "object") ? { u: t.u || null, x: t.x ?? 50, y: t.y ?? 50, z: t.z ?? 1 } : { u: t || null, x: 50, y: 50, z: 1 };
  const tileStyle = (t) => ({ objectPosition: t.x + "% " + t.y + "%", transform: "scale(" + t.z + ")" });

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
          <Ph grad={LB.GRAD.blush} img={heroImg} label="Editorial Hero" ratio="3 / 4" labelSize={18} className="hero__img hero__img--a" />
          <Ph grad={LB.GRAD.cocoa} label="Closet Story" ratio="3 / 4" labelSize={15} className="hero__img hero__img--b" />
        </div>
      </section>);

  }

  if (variant === "editorial") {
    return (
      <section className="hero hero--editorial">
        <Ph grad={LB.GRAD.taupe} img={heroImg} ratio="16 / 9" className="hero__bleed" labelSize={0}>
          <div className="hero__veil"></div>
          <div className="hero__editorial-inner wrap-wide">
            <span className="eyebrow reveal in" style={{ color: "#fff" }}>{T("top.hero.eyebrow.editorial")}</span>
            <h1 className="hero__title display reveal in" style={{ color: "#fff" }}>{headline}</h1>
            <p className="hero__sub reveal in" style={{ color: "rgba(255,255,255,.86)" }}>{sub}</p>
            <button className="btn reveal in" style={{ background: "#fff", color: "#1a1a1a" }} onClick={() => window.LBnav("/#features")}>{T("top.hero.ctaEditorial")}</button>
          </div>
        </Ph>
      </section>);

  }

  // default: "stack" — centered, magazine cover feel
  return (
    <section className="hero hero--stack">
      <div className="hero__stack-head wrap">
        <span className="eyebrow reveal in">{T("top.hero.eyebrow.stack")}</span>
        <div className="hero__divider reveal in" aria-hidden="true">
          <span className="hero__divider-line"></span>
          <span className="hero__divider-dot"></span>
          <span className="hero__divider-line"></span>
        </div>
        <h1 className="hero__title display reveal in" style={{ fontSize: "clamp(25px, 7vw, " + Math.min(titleSize, 92) + "px)", color: "#7b5544" }}>{headline}</h1>
        <p className="hero__sub reveal in">{sub}</p>
      </div>
      <nav className="hero__cats reveal in">
        {LB.CATEGORIES.map((c) =>
        <a key={c.key} className="hero__cat" href={"#/category/" + c.key}
        onClick={(e) => {e.preventDefault();window.LBnav("/category/" + c.key);}}>
            <span className="hero__cat-jp">{c.jp}</span>
            <span className="hero__cat-en">{c.en}</span>
          </a>
        )}
      </nav>
      <div className="hero__strip reveal in">
        {[0, 1, 2, 3].map((i) => {
          const t = tileVal(tiles[i]);
          const grad = [LB.GRAD.blush, LB.GRAD.taupe, LB.GRAD.mist, LB.GRAD.cocoa][i];
          return <Ph key={i} grad={grad} img={t.u || (i === 0 ? heroImg : null)} imgStyle={tileStyle(t)} label={T("top.hero.tile" + (i + 1))} ratio="1 / 1" />;
        })}
      </div>
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
  // Editor's Picks: explicitly curated items (p.rank set in admin) come
  // first in the given order; remaining slots are filled by the
  // highest-reviewed items so the section never looks sparse when only a
  // few products have been curated yet.
  const explicit = LB.PRODUCTS.filter((p) => p.rank).sort((a, b) => a.rank - b.rank);
  const fillers = [...LB.PRODUCTS].filter((p) => !p.rank).sort((a, b) => (b.reviews || 0) - (a.reviews || 0));
  const ranked = [...explicit, ...fillers].slice(0, 5);
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
          <a className="link-more" href="#" onClick={(e) => {e.preventDefault();}}>{T("top.ranking.more")}<span className="arrow"></span></a>
        </div>
        <div className="rankgrid">
          <article className="rankhero reveal" onClick={() => onOpen(hero.id)}>
            <div className="rankhero__media">
              <Ph grad={hero.imgs ? null : hero.grad} img={hero.imgs && hero.imgs[0]} label={hero.name} ratio="1 / 1" labelSize={20} />
              <span className="rankhero__no serif">01</span>
              <div className="card__heart" style={{ opacity: 1, transform: "none" }}><Heart id={hero.id} /></div>
            </div>
            <div className="rankhero__body">
              {hero.badge && <span className="pill pill--active">{hero.badge}</span>}
              <div className="card__brand">{hero.brand}</div>
              <h3 className="rankhero__name serif">{hero.name}</h3>
              <p className="rankhero__copy">{hero.copy}</p>
              <div className="card__meta"><Stars value={hero.rating} size={15} /><span className="card__rev">{hero.rating} ・ {hero.reviews.toLocaleString()}件のレビュー</span></div>
              <div className="rankhero__foot">
                <span className="card__price">¥{hero.price.toLocaleString()}</span>
                <button className="btn btn--dark" onClick={(e) => {e.stopPropagation();onOpen(hero.id);}}>{T("top.ranking.cta")}</button>
              </div>
            </div>
          </article>
          <div className="ranklist">
            {rest.map((p, ri) =>
            <article key={p.id} className="rankrow reveal" onClick={() => onOpen(p.id)}>
                <span className="rankrow__no serif">{String(p.rank || ri + 2).padStart(2, "0")}</span>
                <Ph grad={p.imgs ? null : p.grad} img={p.imgs && p.imgs[0]} ratio="1 / 1" className="rankrow__img" labelSize={0} />
                <div className="rankrow__body">
                  <div className="card__brand">{p.brand}</div>
                  <h4 className="rankrow__name">{p.name}</h4>
                  <div className="card__meta"><Stars value={p.rating} /><span className="card__rev">({p.reviews.toLocaleString()})</span></div>
                </div>
                <div className="rankrow__right">
                  <span className="card__price">¥{p.price.toLocaleString()}</span>
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
        <a className="link-more" href="#" onClick={(e) => {e.preventDefault();}}>{T("top.new.more")}<span className="arrow"></span></a>
      </div>
      <div className="prodgrid prodgrid--4">
        {show.map((p, i) => <ProductCard key={p.id} p={p} index={i} onOpen={onOpen} />)}
      </div>
    </section>);

}

/* ---------- Features (Journal teaser) ---------- */
function Features({ onOpen }) {
  // Hidden until at least one article is published — an empty "Journal"
  // header with no cards below it reads as broken, not "coming soon".
  if (!LB.FEATURES.length) return null;
  return (
    <section className="sect sect--sink" id="features">
      <div className="wrap-wide">
        <div className="section-head reveal">
          <div>
            <span className="eyebrow">{T("top.features.eyebrow")}</span>
            <h2 className="section-title">{T("top.features.title")}</h2>
          </div>
          <a className="link-more" href="#/journal" onClick={(e) => {e.preventDefault();window.LBnav("/journal");}}>{T("top.features.more")}<span className="arrow"></span></a>
        </div>
        <div className="featgrid">
          {LB.FEATURES.map((f, i) => {
            return (
          <article key={f.key} className={"featcard reveal" + (i === 0 ? " featcard--lead" : "")}
          style={{ transitionDelay: i * 60 + "ms" }}
          onClick={() => window.LBnav("/article/" + f.key)}>
              <Ph grad={f.cover ? null : f.grad} img={f.cover} ratio={i === 0 ? "16 / 10" : "3 / 2"} className="featcard__img" labelSize={0}>
                <div className="featcard__veil"></div>
                <div className="featcard__overlay">
                  <span className="featcard__kicker">{f.kicker} · {f.read}</span>
                  <h3 className="featcard__title serif">{f.title}</h3>
                  {i === 0 && <p className="featcard__excerpt">{f.excerpt}</p>}
                </div>
              </Ph>
            </article>
            );
          })}
        </div>
      </div>
    </section>);

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

/* ---------- TOP page composition ---------- */
function TopPage({ heroVariant, onOpen }) {
  useReveal([heroVariant]);
  return (
    <main>
      <Hero variant={heroVariant} />
      <Ranking onOpen={onOpen} />
      <NewArrivals onOpen={onOpen} />
      <CategoryGrid onOpen={onOpen} />
      <QuoteBand />
      <Features onOpen={onOpen} />
    </main>);

}

Object.assign(window, { TopPage, Hero });