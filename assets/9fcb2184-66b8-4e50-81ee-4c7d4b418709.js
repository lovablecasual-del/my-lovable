/* ============================================================
   LOVABLE — Product detail page
   ============================================================ */

function Breadcrumb({ items }) {
  return (
    <nav className="crumb">
      {items.map((it, i) => (
        <span key={i}>
          {it.href
            ? <a href={"#"+it.href} onClick={(e)=>{e.preventDefault(); window.LBnav(it.href);}}>{it.label}</a>
            : <span>{it.label}</span>}
          {i < items.length-1 && <span className="crumb__sep">/</span>}
        </span>
      ))}
    </nav>
  );
}

/* ---------- Gallery ---------- */
// Thumbnails: only for photos that actually exist. A registered image URL
// that 404s (product photo not really there) is verified in the background
// and silently dropped instead of showing an empty placeholder square.
function Gallery({ p }) {
  const hasImg = p.imgs && p.imgs.length;
  const mainTints = hasImg ? p.imgs : [p.grad, LB.GRAD.pearl, LB.GRAD.sand, p.grad];
  const [active, setActive] = useState(0);
  const [thumbSrcs, setThumbSrcs] = useState([]);

  useEffect(() => {
    setActive(0);
    setThumbSrcs([]);
    if (!hasImg || p.imgs.length < 2) return;
    let cancelled = false;
    Promise.all(p.imgs.map((src) => new Promise((resolve) => {
      const im = new Image();
      im.onload = () => resolve(src);
      im.onerror = () => resolve(null);
      im.src = src;
    }))).then((results) => { if (!cancelled) setThumbSrcs(results.filter(Boolean)); });
    return () => { cancelled = true; };
  }, [p.id]);

  const activeSrc = hasImg ? mainTints[active] : null;
  const activeGrad = hasImg ? null : mainTints[active];

  return (
    <div className="gallery" style={thumbSrcs.length ? undefined : { gridTemplateColumns: "1fr" }}>
      <div className="gallery__main">
        <Ph grad={activeGrad} img={activeSrc} label={p.name} ratio="4 / 5" labelSize={18} />
        <div className="gallery__heart"><Heart id={p.id} /></div>
      </div>
      {thumbSrcs.length > 0 && (
        <div className="gallery__thumbs">
          {thumbSrcs.map((src) => (
            <button key={src} className={"gallery__thumb"+(mainTints[active]===src?" is-active":"")} onClick={()=>setActive(mainTints.indexOf(src))}>
              <Ph img={src} ratio="1 / 1" labelSize={0} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Reviews (real per-product reviews only — no fabricated data) ---------- */
function Reviews({ p }) {
  const list = (p.userReviews && p.userReviews.length) ? p.userReviews : [];
  return (
    <div className="reviews">
      {p.reviews > 0 && (
        <div className="reviews__summary">
          <div className="reviews__score">
            <span className="reviews__num serif">{p.rating.toFixed(1)}</span>
            <Stars value={p.rating} size={17} />
            <span className="reviews__count">{p.reviews.toLocaleString()}件のレビュー</span>
          </div>
        </div>
      )}
      {!list.length && <p style={{fontSize:13,color:"var(--fg-muted)"}}>レビューはまだありません。</p>}
      <div className="reviews__list">
        {list.map((r,i) => (
          <article key={i} className="review">
            <div className="review__head">
              <div className="review__ava" style={{background:Object.values(LB.GRAD)[i+1]}}></div>
              <div>
                <b>@{r.name}</b>
                <span>{r.meta}</span>
              </div>
              <Stars value={r.rating} />
            </div>
            <p className="review__body">{r.body}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

/* ---------- Share ---------- */
function ShareRow({ p }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    const url = window.location.href;
    const done = () => { setCopied(true); setTimeout(()=>setCopied(false), 1600); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(done).catch(done);
    else done();
  };
  return (
    <div className="share">
      <span className="share__label">{T("pdp.shareLabel")}</span>
      <div className="share__btns">
        <button className="share__btn share__btn--copy" onClick={copy}>{copied ? T("pdp.shareCopied") : T("pdp.shareCopy")}</button>
      </div>
    </div>
  );
}

/* ---------- Product spec / item detail ---------- */
function ProductSpec({ p }) {
  const s = p.spec;
  return (
    <section className="pdp__section reveal">
      <div className="pdp__sechead"><span className="eyebrow">{T("pdp.specEyebrow")}</span><h2 className="section-title">{T("pdp.specTitle")}</h2></div>
      <div className="spec">
        <div className="spec__main">
          {s.description && <p className="spec__desc">{s.description}</p>}
          {s.colors && s.colors.length > 0 && (
            <div className="spec__colors">
              <span className="spec__label">カラー</span>
              <div className="spec__swatches">
                {s.colors.map(c => (
                  <span key={c.name} className="spec__swatch">
                    <i style={{ background: c.hex }}></i>{c.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="spec__tables">
          {s.detail && (
            <table className="spec__table">
              <tbody>
                {s.detail.map(([k,v]) => (
                  <tr key={k}><th>{k}</th><td>{v}</td></tr>
                ))}
              </tbody>
            </table>
          )}
          {s.sizes && (
            <table className="spec__table">
              <thead>
                <tr>{s.sizes.head.map(h => <th key={h}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {s.sizes.rows.map((row,i) => (
                  <tr key={i}>{row.map((cell,j) => j===0 ? <th key={j}>{cell}</th> : <td key={j}>{cell}</td>)}</tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      {s.source && <p className="spec__source">出典：{s.source}</p>}
    </section>
  );
}

/* ---------- Product page ---------- */
function ProductPage({ id, onOpen }) {
  const p = LB.get(id);
  useReveal([id]);
  useEffect(() => { window.scrollTo({ top: 0, behavior: "auto" }); }, [id]);
  if (!p) return <main className="wrap sect"><p>{T("pdp.notFound")}</p></main>;

  const cat = LB.CATEGORIES.find(c => c.key === p.cat);
  // Ikkun's own one-line take + personal star rating for this item (optional,
  // set from the admin "おすすめポイント" card — stored in spec so it needs
  // no schema change). Shown compactly above the points list.
  const ikkunRating = Math.max(0, Math.min(5, Number(p.spec && p.spec.ikkunRating) || 0));
  const ikkunComment = (p.spec && p.spec.ikkunComment) || "";
  const related = LB.byCat(p.cat).filter(x => x.id !== p.id).slice(0,4);
  const relatedFill = LB.PRODUCTS.filter(x => x.id !== p.id && !related.some(r => r.id === x.id));
  const rel = (related.length>=4?related:[...related,...relatedFill].slice(0,4));

  return (
    <main className="pdp">
      <div className="wrap-wide">
        <Breadcrumb items={[{label:"Home",href:"/"},{label:cat.en,href:"/category/"+p.cat},{label:p.name}]} />
        <div className="pdp__top">
          <div className="pdp__media reveal in"><Gallery p={p} /></div>
          <div className="pdp__info">
            <Badges p={p} className="pdp__badges reveal in" />
            <h1 className="pdp__title serif reveal in">{p.name}</h1>
            <p className="pdp__copy reveal in">{p.copy}</p>
            <div className="pdp__price reveal in">
              ¥{p.price.toLocaleString()}<span className="card__taxnote">税込 / 各ストア目安</span>
            </div>

            <div className="pdp__buybox reveal in">
              <div className="pdp__buyhead">
                <span>{T("pdp.buyboxLabel")}</span>
                <Heart id={p.id} />
              </div>
              <ShopButtons p={p} layout="grid" />
              <p className="pdp__affnote">{T("pdp.affNote")}</p>
            </div>

          </div>
        </div>

        {/* Points */}
        <section className="pdp__section reveal">
          <div className="pdp__sechead"><span className="eyebrow">{T("pdp.pointsEyebrow")}</span><h2 className="section-title">{T("pdp.pointsTitle")}</h2></div>
          {(ikkunComment || ikkunRating > 0) && (
            <div className="ikkunnote">
              {ikkunRating > 0 && <Stars value={ikkunRating} size={15} />}
              {ikkunComment && <p className="ikkunnote__text">{ikkunComment}</p>}
            </div>
          )}
          <div className="points">
            {p.points.map((pt,i) => (
              <div key={i} className="point">
                <span className="point__no serif">{String(i+1).padStart(2,"0")}</span>
                <p>{pt}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Spec / item detail */}
        {p.spec && <ProductSpec p={p} />}
      </div>

      {/* Related */}
      <section className="sect sect--sink">
        <div className="wrap-wide">
          <div className="section-head reveal">
            <div><span className="eyebrow">{T("pdp.relatedEyebrow")}</span><h2 className="section-title">{T("pdp.relatedTitle")}</h2></div>
          </div>
          <div className="prodgrid prodgrid--4">
            {rel.map((rp,i) => <ProductCard key={rp.id} p={rp} index={i} onOpen={onOpen} />)}
          </div>
        </div>
      </section>

      {/* sticky mobile CTA */}
      <div className="pdp__sticky">
        <div className="pdp__sticky-info">
          <b>¥{p.price.toLocaleString()}</b>
          <span>{p.name}</span>
        </div>
        <button className="btn btn--dark pdp__sticky-cta" onClick={()=>{ document.querySelector('.pdp__buybox').scrollIntoView({block:'center'}); }}>{T("pdp.stickyCta")}</button>
      </div>
    </main>
  );
}

Object.assign(window, { ProductPage });