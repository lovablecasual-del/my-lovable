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
function Gallery({ p }) {
  const hasImg = p.imgs && p.imgs.length;
  const tints = hasImg ? p.imgs : [p.grad, LB.GRAD.pearl, LB.GRAD.sand, p.grad];
  const labels = ["Main", "Detail", "On model", "Flatlay"];
  const [active, setActive] = useState(0);
  return (
    <div className="gallery">
      <div className="gallery__main">
        <Ph grad={hasImg ? null : tints[active]} img={hasImg ? tints[active] : null} label={p.name} ratio="4 / 5" labelSize={18} />
        <span className="card__tag" style={{top:14,left:14}}>{p.tag}</span>
        <div className="gallery__heart"><Heart id={p.id} /></div>
      </div>
      <div className="gallery__thumbs">
        {tints.map((g,i) => (
          <button key={i} className={"gallery__thumb"+(i===active?" is-active":"")} onClick={()=>setActive(i)}>
            <Ph grad={hasImg ? null : g} img={hasImg ? g : null} ratio="1 / 1" labelSize={0} />
            {!hasImg && <span className="gallery__thumblabel">{labels[i]}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------- Comparison table ---------- */
function CompareTable({ p }) {
  const order = ["tiktok", ...p.shops.filter(s=>s!=="tiktok")];
  const rows = [
    { label: "参考価格", val: (s) => "¥" + (p.price + ({tiktok:-300,qoo10:-150,rakuten:0,amazon:120})[s]).toLocaleString() },
    { label: "ポイント", val: (s) => ({tiktok:"LIVE割クーポン",rakuten:"楽天ポイント最大10%",amazon:"プライム翌日",qoo10:"メガ割対象"})[s] },
    { label: "配送目安", val: (s) => ({tiktok:"3–5日",rakuten:"1–3日",amazon:"翌日",qoo10:"5–9日"})[s] },
    { label: "こんな人に", val: (s) => ({tiktok:"動画で見たい",rakuten:"ポイ活派",amazon:"今すぐ欲しい",qoo10:"韓国コスメ狙い"})[s] },
  ];
  return (
    <div className="compare">
      <div className="compare__scroll">
        <table>
          <thead>
            <tr>
              <th></th>
              {order.map(s => (
                <th key={s} className={s==="tiktok"?"compare__feat":""}>
                  <span className="compare__shop" style={{"--sa":LB.SHOPS[s].accent}}>{LB.SHOPS[s].name}</span>
                  {s==="tiktok" && <span className="compare__badge">話題</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.label}>
                <td className="compare__rowlabel">{r.label}</td>
                {order.map(s => <td key={s} className={s==="tiktok"?"compare__feat":""}>{r.val(s)}</td>)}
              </tr>
            ))}
            <tr>
              <td></td>
              {order.map(s => {
                const url = (p.links && p.links[s]) ? p.links[s] : "";
                return (
                  <td key={s} className={s==="tiktok"?"compare__feat":""}>
                    <a href={url || "#"}
                       target={url ? "_blank" : undefined}
                       rel={url ? "sponsored noopener noreferrer" : undefined}
                       onClick={url ? undefined : (e)=>e.preventDefault()}
                       className={"compare__go"+(s==="tiktok"?" compare__go--feat":"")}>{url ? "見る ↗" : "未設定"}</a>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------- Reviews ---------- */
function Reviews({ p }) {
  const dist = [72, 21, 5, 1, 1];
  const list = (p.userReviews && p.userReviews.length) ? p.userReviews : LB.REVIEWS;
  return (
    <div className="reviews">
      <div className="reviews__summary">
        <div className="reviews__score">
          <span className="reviews__num serif">{p.rating.toFixed(1)}</span>
          <Stars value={p.rating} size={17} />
          <span className="reviews__count">{p.reviews.toLocaleString()}件のレビュー</span>
        </div>
        <div className="reviews__bars">
          {dist.map((v,i) => (
            <div key={i} className="reviews__bar">
              <span>{5-i}</span>
              <div className="reviews__track"><div style={{width:v+"%"}}></div></div>
              <em>{v}%</em>
            </div>
          ))}
        </div>
      </div>
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

/* ---------- Recommended-for ---------- */
function RecoFor() {
  const tags = ["骨格ウェーブ", "152cm前後", "Quiet Luxury好き", "通勤にも休日にも", "肌をきれいに見せたい"];
  return (
    <div className="recofor">
      <span className="eyebrow">{T("pdp.recoForLabel")}</span>
      <div className="recofor__tags">{tags.map(t => <span key={t} className="pill">{t}</span>)}</div>
    </div>
  );
}

/* ---------- Share ---------- */
function ShareRow({ p }) {
  const [copied, setCopied] = useState(false);
  const copy = () => { setCopied(true); setTimeout(()=>setCopied(false), 1600); };
  return (
    <div className="share">
      <span className="share__label">{T("pdp.shareLabel")}</span>
      <div className="share__btns">
        {["Instagram","TikTok","Pinterest","LINE"].map(s => (
          <button key={s} className="share__btn" onClick={(e)=>e.preventDefault()}>{s}</button>
        ))}
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
  const related = LB.byCat(p.cat).filter(x => x.id !== p.id).slice(0,4);
  const relatedFill = LB.PRODUCTS.filter(x=>x.id!==p.id).slice(0,4);
  const rel = (related.length>=4?related:[...related,...relatedFill].slice(0,4));

  return (
    <main className="pdp">
      <div className="wrap-wide">
        <Breadcrumb items={[{label:"Home",href:"/"},{label:cat.en,href:"/category/"+p.cat},{label:p.name}]} />
        <div className="pdp__top">
          <div className="pdp__media reveal in"><Gallery p={p} /></div>
          <div className="pdp__info">
            <div className="card__brand reveal in">{p.brand}</div>
            <Badges p={p} className="pdp__badges reveal in" />
            <h1 className="pdp__title serif reveal in">{p.name}</h1>
            <div className="pdp__meta reveal in">
              <Stars value={p.rating} size={15} />
              <span>{p.rating} ・ {p.reviews.toLocaleString()}件</span>
              <span className="pdp__dot">·</span>
              <span>保存 {1240 + p.reviews}</span>
            </div>
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

            <RecoFor />
            <ShareRow p={p} />
          </div>
        </div>

        {/* Points */}
        <section className="pdp__section reveal">
          <div className="pdp__sechead"><span className="eyebrow">{T("pdp.pointsEyebrow")}</span><h2 className="section-title">{T("pdp.pointsTitle")}</h2></div>
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

        {/* Comparison */}
        <section className="pdp__section reveal">
          <div className="pdp__sechead"><span className="eyebrow">{T("pdp.compareEyebrow")}</span><h2 className="section-title">{T("pdp.compareTitle")}</h2></div>
          <CompareTable p={p} />
        </section>
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