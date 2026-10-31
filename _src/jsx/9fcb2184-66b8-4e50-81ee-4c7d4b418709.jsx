/* ============================================================
   LOVABLE — Product detail page (redesigned v3)
   - 有効URLのショップのみ表示（未設定は完全非表示）
   - 購入先セクションを1か所に統合（CompareTable廃止）
   - レイアウト: ブランド→商品名→バッジ→価格→説明→WHERE TO BUY
   - WHY WE LOVE IT復活（1件時コンパクト表示）
   - シェアボタンをポイント下に移動
   - エレガントな編集者バッジデザイン
   ============================================================ */

/* CSS injection */
(function(){
  if (document.getElementById('lb-pdp-v3')) return;
  var s = document.createElement('style');
  s.id = 'lb-pdp-v3';
  s.textContent = [
    /* WHERE TO BUY header */
    '.pdp__buy-head{margin-bottom:16px}',
    '.pdp__buy-eyebrow{display:block;font-size:10px;font-weight:600;letter-spacing:.12em;color:var(--fg-soft);text-transform:uppercase;margin-bottom:5px}',
    '.pdp__buy-title{display:block;font-size:16px;font-weight:700;color:var(--fg);letter-spacing:.01em}',
    /* Shop buttons */
    '.pdp__shoplist{display:flex;flex-direction:column;gap:10px}',
    '.pdp__shopbtn{display:flex;align-items:center;justify-content:space-between;width:100%;padding:0 20px;height:52px;background:#5C3D2E;color:#fff;text-decoration:none;border-radius:10px;font-size:14px;font-weight:600;letter-spacing:.03em;box-sizing:border-box;transition:opacity .15s,transform .1s;-webkit-tap-highlight-color:transparent;cursor:pointer}',
    '.pdp__shopbtn:hover{opacity:.85}',
    '.pdp__shopbtn:active{transform:scale(.98)}',
    '.pdp__shopbtn span:first-child{flex:1;text-align:left}',
    '.pdp__shopbtn-icon{font-size:14px;flex-shrink:0;margin-left:8px;opacity:.7}',
    /* Elegant editorial badge */
    '.pdp__editorial{background:#FDF6F0!important;color:#8B6B5E!important;border:1px solid #E8D5C4!important;font-size:11px!important;padding:3px 12px!important;border-radius:20px!important;font-weight:500!important;letter-spacing:.05em!important;display:inline-block}',
    /* Meta row after name */
    '.pdp__meta{margin:6px 0 8px}',
    /* Price tight */
    '.pdp__price{margin:8px 0 10px}',
    /* Points compact (1件) */
    '.points--single{gap:0}',
    '.points--single .point{flex-direction:row;align-items:center;padding:14px 18px;gap:16px}',
    '.points--single .point__no{font-size:20px;min-width:28px;margin-bottom:0;flex-shrink:0}',
    '.points--single .point p{font-size:14px;margin:0;line-height:1.55}',
    /* Share below points */
    '.pdp__share-wrap{padding:16px 0 8px;margin-top:4px}',
    /* Affnote compact */
    '.pdp__affnote{font-size:11px;color:var(--fg-soft);margin-top:14px;line-height:1.55;text-align:left;padding-top:12px;border-top:1px solid rgba(0,0,0,.06)}',
    /* Empty shop msg */
    '.pdp__no-shop{color:var(--fg-soft);font-size:13px;padding:12px 0;text-align:center}',
    /* Personal Review card */
    '.pr-card{background:#FDF6F0;border:1px solid #E8D5C4;border-radius:14px;padding:24px;max-width:680px;margin:0 auto}',
    '.pr-card__profile{display:flex;align-items:center;gap:12px;margin-bottom:16px;padding-bottom:14px;border-bottom:1px solid #E8D5C4}',
    '.pr-card__ava{width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,#C9A882,#8B6B5E);flex-shrink:0;overflow:hidden}',
    '.pr-card__meta{display:flex;flex-direction:column;gap:3px}',
    '.pr-card__name{font-size:14px;font-weight:700;color:#5C3D2E;letter-spacing:.03em}',
    '.pr-card__info{font-size:12px;color:var(--fg-soft);letter-spacing:.01em}',
    '.pr-card__body{font-size:15px;line-height:1.9;color:var(--fg);margin:0;text-align:left;word-break:break-word}',
    '.pr-card__pfallback{display:flex;flex-direction:column;gap:14px}',
    '.pr-card__pfallback-item{display:flex;gap:12px;align-items:flex-start}',
    '.pr-card__pfallback-text{font-size:14px;line-height:1.7;color:var(--fg);margin:0;padding-top:2px}',
    '@media(max-width:767px){.pr-card{padding:20px;border-radius:12px}.pr-card__profile{margin-bottom:14px;padding-bottom:12px}.pr-card__body{font-size:15px;line-height:1.9}.pr-card__ava{width:40px;height:40px}}',
    /* PDPレビュー本文: 改行を自然に表示 */
    '.pr-card__body{white-space:pre-line}',
    /* PDPカテゴリーCTA */
    '.pdp__reco-more{text-align:center;margin-top:clamp(24px,3vw,36px);padding-top:clamp(20px,2.5vw,30px);border-top:1px solid var(--border)}',
    '.pdp__reco-more a{display:inline-flex;align-items:center;gap:10px;font-size:13px;letter-spacing:.1em;color:var(--gold-deep);border-bottom:1px solid currentColor;padding-bottom:3px;transition:gap .3s var(--ease),color .3s var(--ease);text-decoration:none}',
    '.pdp__reco-more a:hover{gap:16px;color:var(--gold)}',
    '.pdp__reco-arrow{font-size:15px;transition:transform .3s var(--ease)}',
    '.pdp__reco-more a:hover .pdp__reco-arrow{transform:translateX(4px)}',
    /* 購入ショートカット (SP専用) */
    '.pdp__shoplink{display:none}',
    '@media(max-width:767px){.pdp__shoplink{display:flex;align-items:center;gap:7px;font-size:12px;font-weight:600;letter-spacing:.08em;color:var(--gold-deep);margin:6px 0 12px;text-decoration:none;-webkit-tap-highlight-color:transparent}.pdp__shoplink:active{opacity:.7}.pdp__shoplink-arrow{font-size:14px;animation:bounce-dn 1.6s ease infinite}.pdp__shoplink span:first-child{border-bottom:1px solid currentColor;padding-bottom:1px}}',
    '@keyframes bounce-dn{0%,100%{transform:translateY(0)}50%{transform:translateY(3px)}}',
  ].join('');
  document.head.appendChild(s);
})();

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

/* ---------- Gallery (swipe + counter) ---------- */
function Gallery({ p }) {
  const hasImg = p.imgs && p.imgs.length;
  const tints = hasImg ? p.imgs.filter(Boolean) : [p.grad, LB.GRAD.pearl, LB.GRAD.sand, p.grad];
  const [active, setActive] = useState(0);
  const touchX = useRef(null);
  const thumbsRef = useRef(null);
  useEffect(() => { setActive(0); }, [p.id]);
  /* 2026-10-31 スワイプで画像が変わったとき、選択中のサムネイルが見える位置までサムネイル列を移動（アニメーションなし） */
  useEffect(() => {
    const row = thumbsRef.current; if (!row) return;
    const el = row.children[active]; if (!el) return;
    if (row.scrollWidth > row.clientWidth + 1) {
      const l = el.offsetLeft - row.offsetLeft, r = l + el.offsetWidth;
      if (l < row.scrollLeft) row.scrollLeft = l;
      else if (r > row.scrollLeft + row.clientWidth) row.scrollLeft = r - row.clientWidth;
    }
    if (row.scrollHeight > row.clientHeight + 1) {
      const tp = el.offsetTop - row.offsetTop, bt = tp + el.offsetHeight;
      if (tp < row.scrollTop) row.scrollTop = tp;
      else if (bt > row.scrollTop + row.clientHeight) row.scrollTop = bt - row.clientHeight;
    }
  }, [active]);
  const total = tints.length;

  const prev = () => setActive(a => Math.max(a - 1, 0));
  const next = () => setActive(a => Math.min(a + 1, total - 1));

  const onTouchStart = (e) => { touchX.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    touchX.current = null;
    if (Math.abs(dx) < 40) return;
    if (dx < 0) next(); else prev();
  };

  return (
    <div className="gallery">
      <div className="gallery__main" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <Ph eager key={hasImg ? (tints[active]||active) : active} grad={hasImg ? null : tints[active]} img={hasImg ? (tints[active]||null) : null} label={p.name} ratio="4 / 5" labelSize={18} />
        {p.tag && <span className="card__tag" style={{top:14,left:14}}>{p.tag}</span>}
        <div className="gallery__heart"><Heart id={p.id} /></div>
        {total > 1 && <div className="gallery__counter">{active + 1} / {total}</div>}
      </div>
      {total > 1 && (
        <div className="gallery__thumbs" ref={thumbsRef}>
          {tints.slice(0, total).map((g, i) => (
            <button key={i} className={"gallery__thumb"+(i===active?" is-active":"")} onClick={()=>setActive(i)} aria-label={"画像"+(i+1)+"を見る"} aria-current={i===active?"true":undefined}>
              <Ph grad={hasImg ? null : g} img={hasImg ? g : null} ratio="1 / 1" labelSize={0} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- 商品名の改行（2026-10-31） ----------
   スペースで区切った短い語（10文字以内：「SNIDEL」「ワンピース・ドレス」など）は途中で改行しない。
   長い語（スペースのない長いカタカナ名など）は従来どおり行の端で折り返す。商品名のデータ・文字列は変えない */
function titleWithKeptWords(name) {
  const s = String(name || "");
  const parts = s.split(/(\s+)/);
  return parts.map((w, i) => (!w || /^\s+$/.test(w) || Array.from(w).length > 10)
    ? w
    : <span key={i} style={{ whiteSpace: "nowrap" }}>{w}</span>);
}

/* ---------- Truncatable product copy ---------- */
function TruncatedCopy({ text, lines = 3 }) {
  const [expanded, setExpanded] = useState(false);
  if (!text) return null;
  const isLong = text.length > lines * 28;
  return (
    <div className="pdp__copy-wrap">
      <p className="pdp__copy reveal in"
         style={!expanded && isLong ? {
           display: '-webkit-box',
           WebkitBoxOrient: 'vertical',
           WebkitLineClamp: lines,
           overflow: 'hidden',
         } : {}}>
        {text}
      </p>
      {isLong && (
        <button className="readmore" onClick={() => setExpanded(e => !e)}>
          {expanded ? '閉じる ↑' : 'もっと見る ↓'}
        </button>
      )}
    </div>
  );
}

/* ---------- Shop list (valid URLs only) ---------- */
function ShopList({ p }) {
  const validShops = (p.shops || []).filter(function(s) {
    var url = p.links && p.links[s];
    return url && typeof url === 'string' && url.trim().length > 8 && url.trim().startsWith('http');
  });
  const otherUrl = p.links && p.links.other && p.links.other.trim().length > 8 && p.links.other.trim().startsWith('http') ? p.links.other.trim() : null;
  const hasAny = validShops.length > 0 || otherUrl;

  if (!hasAny) return (
    <p className="pdp__no-shop">購入先は準備中です</p>
  );

  return (
    <div className="pdp__shoplist">
      {validShops.map(function(s) {
        var shop = (LB.SHOPS && LB.SHOPS[s]) || {name: s};
        var url = p.links[s];
        return (
          <a key={s}
             href={url}
             target="_blank"
             rel="sponsored noopener noreferrer"
             className="pdp__shopbtn">
            <span>{shop.name}で商品を見る</span>
            <span className="pdp__shopbtn-icon">↗</span>
          </a>
        );
      })}
      {otherUrl && (
        <a href={otherUrl}
           target="_blank"
           rel="noopener noreferrer"
           className="pdp__shopbtn">
          <span>公式サイト・その他で見る</span>
          <span className="pdp__shopbtn-icon">↗</span>
        </a>
      )}
      {validShops.length > 0 && <p className="pdp__affnote">※ 各リンクはアフィリエイトリンクです。価格・在庫は遷移先でご確認ください。</p>}
    </div>
  );
}

/* ---------- Share ---------- */
function ShareRow({ p }) {
  return (
    <div className="share">
      <div className="share__btns">
        {p.social && p.social.ig && (
          <a href={p.social.ig} target="_blank" rel="noopener noreferrer"
             className="share__btn" style={{textDecoration:"none"}}>Instagram投稿を見る ↗</a>
        )}
      </div>
    </div>
  );
}

/* ---------- Personal Review (MY PERSONAL REVIEW) ---------- */
/* 星評価・レビュー件数・評価グラフは一切表示しない。
   データ (p.rating, p.reviews, p.userReviews[].rating) は保持するが、フロントエンドでは使用しない。
   優先度: userReviews[0].body > points フォールバック > セクション非表示 */
function PersonalReview({ p }) {
  const firstReview = p.userReviews && p.userReviews.length ? p.userReviews[0] : null;
  const hasBody = firstReview && firstReview.body && firstReview.body.trim().length > 0;
  const hasPoints = p.points && p.points.length > 0;
  if (!hasBody && !hasPoints) return null;

  return (
    <section className="pdp__section reveal">
      <div className="pdp__sechead">
        <span className="eyebrow">MY PERSONAL REVIEW</span>
        <h2 className="section-title">使用レビュー</h2>
      </div>
      <div className="pr-card">
        {/* プロフィール */}
        <div className="pr-card__profile">
          <img className="pr-card__ava" src="/my-lovable/assets/ikkun-avatar.jpg" alt="@iam___iku" style={{width:44,height:44,borderRadius:"50%",objectFit:"cover"}} />
          <div className="pr-card__meta">
            <span className="pr-card__name">@iam___iku</span>
            {firstReview && firstReview.meta && (
              <span className="pr-card__info">{firstReview.meta}</span>
            )}
          </div>
        </div>
        {/* レビュー本文（優先）またはおすすめポイントのフォールバック */}
        {hasBody ? (
          <p className="pr-card__body">{firstReview.body}</p>
        ) : (
          <div className="pr-card__pfallback">
            {p.points.map((pt, i) => (
              <div key={i} className="pr-card__pfallback-item">
                <p className="pr-card__pfallback-text">{pt}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ---------- Product spec ---------- */
function ProductSpec({ p }) {
  const s = p.spec;
  if (!s || (!s.description && !s.detail && !s.sizes && (!s.colors || !s.colors.length))) return null;
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
              <thead><tr>{s.sizes.head.map(h => <th key={h}>{h}</th>)}</tr></thead>
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

/* ---------- Product page (v3 layout) ---------- */
function ProductPage({ id, onOpen }) {
  const p = LB.get(id);
  useReveal([id]);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
    if (!p) return;
    const prev = document.title;
    document.title = (p.displayName || p.name) + (p.brand ? ' | ' + p.brand : '') + ' | LOVABLE';
    let md = document.querySelector('meta[name="description"]');
    if (!md) { md = document.createElement('meta'); md.setAttribute('name','description'); document.head.appendChild(md); }
    md.setAttribute('content', p.copy ? p.copy.slice(0,120) + '…' : p.brand + 'の' + (p.displayName || p.name) + 'をLOVABLEでチェック。');
    return () => { document.title = prev; };
  }, [id]);
  if (!p) return <main className="wrap sect"><p>{T("pdp.notFound")}</p></main>;

  const cat = LB.CATEGORIES.find(c => c.key === p.cat);
  const related = LB.byCat(p.cat).filter(x => x.id !== p.id).slice(0,4);
  const relatedFill = LB.PRODUCTS.filter(x=>x.id!==p.id).slice(0,4);
  const rel = (related.length>=4?related:[...related,...relatedFill].slice(0,4));

  /* Valid shops: only those with a real URL */
  const validShops = (p.shops || []).filter(function(s) {
    var url = p.links && p.links[s];
    return url && typeof url === 'string' && url.trim().length > 8 && url.trim().startsWith('http');
  });
  const hasLinks = validShops.length > 0;

  return (
    <main className="pdp">
      <div className="wrap-wide">
        <Breadcrumb items={[{label:"Home",href:"/"},{label:cat ? cat.en : p.cat,href:"/category/"+p.cat},{label:p.displayName || p.name}]} />

        <div className="pdp__top">
          <div className="pdp__media reveal in"><Gallery p={p} /></div>

          <div className="pdp__info">
            {/* ① Brand */}
            <div className="card__brand reveal in">{p.brand}</div>

            {/* ② Product name */}
            <h1 className="pdp__title serif reveal in">{titleWithKeptWords(p.displayName || p.name)}</h1>

            {/* ③ Editorial badge (after name) */}
            {p.badge && (
              <div className="pdp__meta reveal in">
                <span className="card__editorial pdp__editorial">{p.badge}</span>
              </div>
            )}

            {/* ④ Other badges */}
            

            {/* ⑤ Price */}
            {p.price > 0 && <div className="pdp__price reveal in">
              ¥{p.price.toLocaleString()}<span className="card__taxnote">税込 / 各ストア目安</span>
            </div>}

            {/* ⑥ Short copy (2 lines) */}
            {/* 2026-10-30「購入できるショップを見る」リンクは、すぐ下の購入先カードと重複するため削除 */}
            <TruncatedCopy text={p.copy} lines={2} />

            {/* ⑦ WHERE TO BUY — 唯一の購入先セクション */}
            <div id="pdp-shoplist" className="pdp__primary-cta reveal in">
              {hasLinks && (
                <div className="pdp__buy-head">
                  <span className="pdp__buy-eyebrow">WHERE TO BUY</span>
                  <span className="pdp__buy-title">購入できるショップ</span>
                </div>
              )}
              <ShopList p={p} />
            </div>
          </div>
        </div>

        {/* ⑧ MY PERSONAL REVIEW（WHY WE LOVE IT + REAL VOICES を統合・星評価廃止）*/}
        <PersonalReview p={p} />

        {/* ⑨ Share */}
        <div className="pdp__share-wrap">
          <ShareRow p={p} />
        </div>

        {/* ⑩ Spec */}
        <ProductSpec p={p} />

        {/* ※ CompareTable（旧ストア比較表）は廃止 — 購入先は上部に統合 */}
      </div>

      {/* TikTok */}
      {window.TikTokForProduct ? React.createElement(window.TikTokForProduct, {productId:id, onOpen}) : null}

      {/* Related */}
      <section className="sect sect--sink">
        <div className="wrap-wide">
          <div className="section-head reveal">
            <div><span className="eyebrow">{T("pdp.relatedEyebrow")}</span><h2 className="section-title">{T("pdp.relatedTitle")}</h2></div>
          </div>
          <div className="prodgrid prodgrid--4">
            {rel.map((rp,i) => <ProductCard key={rp.id} p={rp} index={i} onOpen={(pid) => {
              try { if (window.LBTrack) window.LBTrack({ t: "rp", from: p.id, to: pid }); } catch {}
              if (onOpen) onOpen(pid);
            }} />)}
          </div>
          {cat && (
            <div className="pdp__reco-more reveal in">
              <a href={"#/category/"+p.cat}
                 onClick={(e)=>{e.preventDefault(); window.LBnav && window.LBnav("/category/"+p.cat);}}>
                <span>{cat.jp || cat.en}のアイテムをすべて見る</span>
                <span className="pdp__reco-arrow" aria-hidden="true">→</span>
              </a>
            </div>
          )}
        </div>
      </section>

    </main>
  );
}

Object.assign(window, { ProductPage });
