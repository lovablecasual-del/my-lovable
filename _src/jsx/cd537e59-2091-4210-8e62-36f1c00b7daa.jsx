/* ============================================================
   LOVABLE — Category & Saved pages
   ============================================================ */

function FilterBar({ subs, active, onPick }) {
  return (
    <div className="filterbar">
      <div className="filterbar__pills">
        <button className={"pill"+(active===null?" pill--active":"")} onClick={()=>onPick(null)}>{T("catalog.filterAll")}</button>
        {subs.map(s => (
          <button key={s} className={"pill"+(active===s?" pill--active":"")} onClick={()=>onPick(s)}>{s}</button>
        ))}
      </div>
    </div>
  );
}

function CategoryPage({ catKey, onOpen }) {
  const cat = LB.CATEGORIES.find(c => c.key === catKey);
  useEffect(() => {
    if (!cat) window.LBnav("/");   // hidden or unknown category — never render, send home
  }, [catKey, cat]);
  const [sub, setSub] = useState(null);
  useReveal([catKey, sub]);
  useEffect(() => { window.scrollTo({top:0}); setSub(null); }, [catKey]);
  if (!cat) return null;

  let list = LB.byCat(cat.key);
  if (sub) list = list.filter(p => p.sub === sub);

  const catImg = cat.img || (() => { try { return localStorage.getItem("LB_catimg_" + cat.key) || ""; } catch(e) { return ""; } })();
  return (
    <main>
      <header className="cathero">
        <div className="cathero__inner wrap-wide">
          <Breadcrumb items={[{label:T("catalog.breadcrumbHome"),href:"/"},{label:cat.en}]} />
          <div className="cathero__body">
            <span className="eyebrow cathero__eyebrow">{T("catalog.categoryEyebrow")}</span>
            <h1 className="cathero__title display">{cat.en}</h1>
            {cat.blurb && <p className="cathero__sub">{cat.blurb}</p>}
          </div>
        </div>
        <div className="cathero__rule"></div>
      </header>

      <section className="wrap-wide sect">
        <FilterBar subs={cat.subs} active={sub} onPick={setSub} />
        <div className="catcount">{list.length}{T("catalog.itemCountSuffix")}</div>
        <div className="prodgrid prodgrid--4">
          {list.map((p,i) => <ProductCard key={p.id} p={p} index={i} onOpen={onOpen} showRank={false} />)}
        </div>
        {list.length === 0 && <p className="empty">{T("catalog.emptyMessage")}</p>}
      </section>
    </main>
  );
}

/* ---------- All items (genre-agnostic flat list) ---------- */
function AllPage({ onOpen }) {
  useReveal([]);
  useEffect(() => { window.scrollTo({ top: 0 }); }, []);

  const list = LB.PRODUCTS;

  return (
    <main className="wrap-wide sect">
      <div className="allhead reveal in">
        <span className="eyebrow">{T("all.eyebrowPrefix")} · {LB.PRODUCTS.length}</span>
        <h1 className="section-title">{T("all.title")}</h1>
        <p className="allhead__sub">{T("all.sub")}</p>
      </div>

      <div className="allbar">
        <div className="catcount">{list.length}{T("catalog.itemCountSuffix")}</div>
      </div>

      <div className="prodgrid prodgrid--4">
        {list.map((p,i) => <ProductCard key={p.id} p={p} index={i} onOpen={onOpen} />)}
      </div>
    </main>
  );
}

function SavedPage({ onOpen }) {
  const fav = useFav();
  useReveal([fav.favs.join(",")]);
  const list = LB.PRODUCTS.filter(p => fav.favs.includes(p.id));
  return (
    <main className="wrap-wide sect">
      <div className="savedhead reveal in">
        <span className="eyebrow">{T("saved.eyebrow")}</span>
        <h1 className="section-title">{T("saved.title")}</h1>
        <p className="savedhead__sub">{T("saved.sub")}{list.length > 0 && ` — ${list.length}点`}</p>
      </div>
      {list.length === 0 ? (
        <div className="saved-empty reveal in">
          <Ph grad={LB.GRAD.pearl} ratio="3 / 2" label={T("saved.emptyTitle")} labelSize={18} className="saved-empty__img" />
          <p>{T("saved.emptyBody")}</p>
          <button className="btn btn--dark" onClick={()=>window.LBnav("/all")}>{T("saved.emptyCta")}</button>
        </div>
      ) : (
        <div className="prodgrid prodgrid--4">
          {list.map((p,i) => <ProductCard key={p.id} p={p} index={i} onOpen={onOpen} />)}
        </div>
      )}
    </main>
  );
}


/* ---------- Search Results Page ---------- */
function SearchPage({ q, onOpen }) {
  const [sort, setSort] = useState("pop");
  const norm = q ? (q.replace(/[Ａ-Ｚａ-ｚ０-９]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xFEE0)).toLowerCase().trim()) : "";
  useReveal([q, sort]);
  useEffect(() => { window.scrollTo({ top: 0 }); }, [q]);

  const matched = norm
    ? LB.PRODUCTS.filter(p => {
        const hay = (p.displayName||p.name||"") + " " + (p.name||"") + " " + (p.brand||"") + " " + (p.sub||"") + " " + (p.cat||"") + " " + (p.tag||"") + " " + (p.tags||[]).join(" ");
        return norm.split(/\s+/).every(w => hay.replace(/[Ａ-Ｚａ-ｚ０-９]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xFEE0)).toLowerCase().includes(w));
      })
    : [];

  const list = [...matched].sort((a,b) => {
    if (sort === "low")  { if (!a.price && b.price) return 1; if (a.price && !b.price) return -1; return a.price - b.price; }
    if (sort === "high") { if (!a.price && b.price) return 1; if (a.price && !b.price) return -1; return b.price - a.price; }
    if (sort === "rate") return b.rating - a.rating;
    if (sort === "new")  return (b.createdAt||"") > (a.createdAt||"") ? 1 : (b.createdAt||"") < (a.createdAt||"") ? -1 : 0;
    return b.reviews - a.reviews;
  });

  return (
    <main className="wrap-wide sect">
      <div className="searchpage__head reveal in">
        <span className="eyebrow">Search results</span>
        <h1 className="section-title">「{q}」の検索結果</h1>
        <p className="searchpage__count">{list.length}件のアイテム</p>
      </div>

      {list.length > 0 ? (
        <>
          <div className="allbar">
            <div className="filterbar__sort">
              <label>{T("catalog.sortLabel")}</label>
              <select value={sort} onChange={(e)=>setSort(e.target.value)}>
                <option value="pop">{T("catalog.sort.pop")}</option>
                <option value="new">{T("catalog.sort.new")}</option>
                <option value="low">{T("catalog.sort.low")}</option>
                <option value="high">{T("catalog.sort.high")}</option>
                <option value="rate">{T("catalog.sort.rate")}</option>
              </select>
            </div>
          </div>
          <div className="prodgrid prodgrid--4">
            {list.map((p, i) => <ProductCard key={p.id} p={p} index={i} onOpen={onOpen} showRank={false} />)}
          </div>
        </>
      ) : (
        <div className="searchpage__empty">
          <p className="searchpage__empty-title">該当するアイテムが見つかりませんでした</p>
          <p className="searchpage__empty-sub">キーワードを変えてもう一度検索してみてください</p>
          <div className="searchpage__empty-links">
            <a className="link-more" href="#/all" onClick={(e)=>{e.preventDefault();window.LBnav("/all");}}>すべてのアイテムを見る<span className="arrow"></span></a>
            <div className="filterbar__pills" style={{marginTop:"16px"}}>
              {LB.CATEGORIES.map(c => (
                <a key={c.key} className="pill" href={"#/category/"+c.key}
                  onClick={(e)=>{e.preventDefault();window.LBnav("/category/"+c.key);}}>
                  {c.en}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}


/* ============================================================
   LOVABLE — Feature / Journal Article Page
   ============================================================ */

/* Lightweight Markdown renderer (mirrors admin md())
   2026-10-31：
   - 画像の大きさ・位置 ![説明](URL){size=small|standard|large|full align=left|center|right}（指定なし＝標準・中央＝従来どおり）
   - リンク・画像のURLは http(s)/mailto/tel/サイト内（# や /）だけを許可（javascript: などは無効化）
   - 外部リンクは新しいタブ（rel=noopener noreferrer、楽天・Amazon・Qoo10などは sponsored も付与）。URL自体は変更しない */
function artSafeUrl(u) {
  const s = String(u || "").trim();
  if (/^(https?:\/\/|mailto:|tel:|#|\/(?!\/)|\.\/)/i.test(s)) return s.replace(/"/g, "&quot;");
  return "";
}
function artLink(text, url) {
  const href = artSafeUrl(url);
  if (!href) return text;
  if (/^https?:\/\//i.test(href)) {
    const aff = /(rakuten|amazon|amzn|qoo10|a\.r10\.to|hb\.afl|moshimo|valuecommerce|a8\.net|tiktok\.com\/view\/product|shop\.tiktok)/i.test(href);
    return '<a href="' + href + '" target="_blank" rel="' + (aff ? "sponsored " : "") + 'noopener noreferrer">' + text + '</a>';
  }
  return '<a href="' + href + '">' + text + '</a>';
}
function artImage(alt, url, attrs) {
  const src = artSafeUrl(url);
  if (!src) return "";
  const o = {}; String(attrs || "").replace(/(\w+)=([\w-]+)/g, (m, k, v) => { o[k] = v; return m; });
  const size = /^(small|standard|large|full)$/.test(o.size) ? o.size : "standard";
  const align = /^(left|center|right)$/.test(o.align) ? o.align : "center";
  return '<figure class="art__fig art__fig--' + size + ' art__fig--' + align + '"><img src="' + src + '" alt="' + alt + '" class="art__img" loading="lazy"></figure>';
}
/* 2026-10-31 記事内のアップロード画像が GitHub Pages 反映前で読めなかったときは、GitHub の原本（raw）で1回だけ再試行 */
if (!window.__artImgFallback) {
  window.__artImgFallback = true;
  document.addEventListener("error", (e) => {
    const el = e.target;
    if (!el || el.tagName !== "IMG" || !el.classList.contains("art__img") || el.dataset.rawTried) return;
    const m = /^https:\/\/lovablecasual-del\.github\.io\/my-lovable\/(assets\/uploads\/.+)$/.exec(el.getAttribute("src") || "");
    if (!m) return;
    el.dataset.rawTried = "1";
    el.src = "https://raw.githubusercontent.com/lovablecasual-del/my-lovable/main/" + m[1];
  }, true);
}
function mdRender(src) {
  if (!src) return "";
  let h = src
    .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
  h = h.replace(/!\[([^\]]*)\]\(([^)\s]+)\)(?:\{([^}]*)\})?/g, (m, alt, url, attrs) => artImage(alt, url, attrs));
  h = h.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, text, url) => artLink(text, url));
  h = h.replace(/^### (.*)$/gm,"<h3>$1</h3>").replace(/^## (.*)$/gm,"<h2>$1</h2>").replace(/^# (.*)$/gm,"<h2>$1</h2>");
  h = h.replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>").replace(/\*([^*]+)\*/g,"<em>$1</em>");
  h = h.replace(/(?:^- .*(?:\n|$))+/gm, function(m){ return "<ul>"+m.trim().split("\n").map(function(l){return "<li>"+l.replace(/^- /,"")+"</li>";}).join("")+"</ul>"; });
  h = h.split(/\n{2,}/).map(function(b){ return /^\s*<(h\d|ul|img|blockquote|figure)/.test(b.trim()) ? b : (b.trim()?"<p>"+b.trim().replace(/\n/g,"<br>")+"</p>":""); }).join("\n");
  return h;
}

/* Parse body into segments: text | product-token */
function parseArticleBody(body) {
  const parts = [];
  const re = /::product:([^:\s]+)::/g;
  let last = 0, m;
  while ((m = re.exec(body || "")) !== null) {
    if (m.index > last) parts.push({ type: "text", content: body.slice(last, m.index) });
    parts.push({ type: "product", id: m[1] });
    last = m.index + m[0].length;
  }
  if (last < (body || "").length) parts.push({ type: "text", content: (body || "").slice(last) });
  return parts;
}

/* Compact horizontal product card for in-article use */
function ArticleProductCard({ pid, onOpen }) {
  const p = window.LB.get(pid);
  if (!p) return null;
  return (
    <div className="artcard" role="link" tabIndex={0}
      onClick={() => onOpen(p.id)}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen(p.id); } }}>
      <div className="artcard__img">
        <Ph grad={p.imgs && p.imgs[0] ? null : p.grad} img={p.imgs && p.imgs[0] || null} ratio="3 / 4" labelSize={0} />
      </div>
      <div className="artcard__body">
        {p.brand && <div className="artcard__brand">{p.brand}</div>}
        <div className="artcard__name">{p.displayName || p.name}</div>
        {p.price > 0 && <div className="artcard__price">¥{p.price.toLocaleString()}</div>}
        <div className="artcard__cta">詳しく見る →</div>
      </div>
    </div>
  );
}

/* JOURNAL article detail page */
function FeaturePage({ featureKey, onOpen }) {
  useEffect(() => { window.scrollTo({ top: 0 }); }, [featureKey]);

  // Get full article from store (has body field), fall back to window.LB.FEATURES
  const article = (window.LBStore && window.LBStore.getArticle && window.LBStore.getArticle(featureKey))
    || (window.LB.FEATURES || []).find(f => f.key === featureKey);

  // SEO（2026-10-31：記事が見つからない場合の早期 return より前に置く。React のフック順のずれでエラーになっていたため）
  useEffect(() => {
    if (!article) return;
    const title = (article.seo && article.seo.title) || article.title;
    if (title) document.title = title + " | LOVABLE";
    let meta = document.querySelector('meta[name="description"]');
    const desc = (article.seo && article.seo.desc) || article.excerpt || "";
    if (!meta) { meta = document.createElement("meta"); meta.setAttribute("name","description"); document.head.appendChild(meta); }
    if (desc) meta.setAttribute("content", desc);
  }, [featureKey, article]);

  if (!article) {
    return (
      <main className="wrap-wide sect">
        <div className="feat-404">
          <p>記事が見つかりませんでした。</p>
          <a className="link-more" href="#/" onClick={(e)=>{e.preventDefault();window.LBnav("/");}}>トップに戻る<span className="arrow"></span></a>
        </div>
      </main>
    );
  }

  // Retrieve the body (LBStore article has 'body'; FEATURES fallback uses excerpt)
  const bodyText = article.body || ("## " + article.title + "\n\n" + (article.excerpt || ""));
  const segments = parseArticleBody(bodyText);

  // Product IDs already inserted inline
  const inlineIds = new Set(segments.filter(s => s.type === "product").map(s => s.id));

  // Items for the "featured in this article" section at end (exclude inline duplicates)
  const items = (article.items || []);
  const tailItems = items.filter(id => !inlineIds.has(id));

  // Related articles (other published, exclude self, up to 3)
  const relatedFeatures = (window.LB.FEATURES || [])
    .filter(f => f.key !== featureKey)
    .slice(0, 3);

  // Cover image / gradient
  const coverImg = article.cover || null;
  const coverGrad = article.coverGrad || (window.LB.GRAD && window.LB.GRAD.blush) || "";


  return (
    <main className="article-page">
      {/* Hero cover */}
      <div className="article-hero">
        <Ph eager grad={coverImg ? null : coverGrad} img={coverImg} ratio="16 / 7" labelSize={0} className="article-hero__ph">
          <div className="article-hero__veil"></div>
        </Ph>
        <div className="article-hero__inner wrap-wide">
          <Breadcrumb items={[{label:"Home",href:"/"},{label:"Journal",href:"/journal"},{label:article.title}]} />
          <span className="eyebrow" style={{color:"#fff"}}>{article.kicker || article.type || "The Journal"}</span>
          <h1 className="article-hero__title serif">{article.title}</h1>
          <div className="article-hero__meta">
            {article.read && <span>{article.read}</span>}
            {article.publishedAt && <span>{new Date(article.publishedAt).toLocaleDateString("ja-JP",{year:"numeric",month:"long",day:"numeric"})}</span>}
          </div>
        </div>
      </div>

      {/* Article body */}
      <div className="wrap-article sect">
        {article.excerpt && (
          <p className="article-lead serif">{article.excerpt}</p>
        )}

        <div className="article-body">
          {segments.map((seg, i) =>
            seg.type === "product"
              ? <ArticleProductCard key={seg.id + i} pid={seg.id} onOpen={onOpen} />
              : <div key={i} className="art__prose" dangerouslySetInnerHTML={{ __html: mdRender(seg.content) }} />
          )}
        </div>

        {/* Related products at end */}
        {tailItems.length > 0 && (
          <section className="article-related-items">
            <h2 className="article-section-title">この記事で紹介したアイテム</h2>
            <div className="article-items-grid">
              {tailItems.map(pid => {
                const p = window.LB.get(pid);
                if (!p) return null;
                return <ArticleProductCard key={pid} pid={pid} onOpen={onOpen} />;
              })}
            </div>
          </section>
        )}

        {/* Related articles */}
        {relatedFeatures.length > 0 && (
          <section className="article-related-posts sect--sink">
            <div className="section-head reveal">
              <div>
                <span className="eyebrow">More from Journal</span>
                <h2 className="section-title">関連記事</h2>
              </div>
            </div>
            <div className="featgrid">
              {relatedFeatures.map((f, i) => (
                <article key={f.key} className="featcard reveal"
                  style={{ transitionDelay: i * 60 + "ms" }}
                  role="link" tabIndex={0}
                  onClick={() => window.LBnav("/feature/" + f.key)}
                  onKeyDown={(e) => { if (e.key==="Enter"||e.key===" ") { e.preventDefault(); window.LBnav("/feature/"+f.key); } }}>
                  <Ph grad={f.cover ? null : f.grad} img={f.cover || null} ratio="3 / 2" className="featcard__img" labelSize={0}>
                    <div className="featcard__veil"></div>
                    <div className="featcard__overlay">
                      <span className="featcard__kicker">{f.kicker} · {f.read}</span>
                      <h3 className="featcard__title serif">{f.title}</h3>
                    </div>
                  </Ph>
                  <div className="featcard__sub">
                    <span className="featcard__kicker">{f.kicker}</span>
                    <h4 className="featcard__name">{f.title}</h4>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

Object.assign(window, { CategoryPage, SavedPage, AllPage, SearchPage, FeaturePage, ArticleProductCard });
