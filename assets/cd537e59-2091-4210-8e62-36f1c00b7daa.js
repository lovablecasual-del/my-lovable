/* ============================================================
   LOVABLE — Category & Saved pages
   ============================================================ */

function FilterBar({ subs, active, onPick, sort, onSort }) {
  return (
    <div className="filterbar">
      <div className="filterbar__pills">
        <button className={"pill"+(active===null?" pill--active":"")} onClick={()=>onPick(null)}>{T("catalog.filterAll")}</button>
        {subs.map(s => (
          <button key={s} className={"pill"+(active===s?" pill--active":"")} onClick={()=>onPick(s)}>{s}</button>
        ))}
      </div>
      <div className="filterbar__sort">
        <label>{T("catalog.sortLabel")}</label>
        <select value={sort} onChange={(e)=>onSort(e.target.value)}>
          <option value="pop">{T("catalog.sort.pop")}</option>
          <option value="new">{T("catalog.sort.new")}</option>
          <option value="low">{T("catalog.sort.low")}</option>
          <option value="high">{T("catalog.sort.high")}</option>
          <option value="rate">{T("catalog.sort.rate")}</option>
        </select>
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
  const [sort, setSort] = useState("pop");
  useReveal([catKey, sub, sort]);
  useEffect(() => { window.scrollTo({top:0}); setSub(null); }, [catKey]);
  if (!cat) return null;

  let list = LB.byCat(cat.key);
  if (sub) list = list.filter(p => p.sub === sub);
  list = [...list].sort((a,b) => {
    if (sort === "low") return a.price - b.price;
    if (sort === "high") return b.price - a.price;
    if (sort === "rate") return b.rating - a.rating;
    if (sort === "new") return (b.tag==="新着") - (a.tag==="新着");
    return b.reviews - a.reviews;
  });

  return (
    <main>
      <section className="cathero">
        <Ph grad={cat.grad} ratio="21 / 9" className="cathero__bg" labelSize={0}>
          <div className="cathero__veil"></div>
        </Ph>
        <div className="cathero__inner wrap-wide">
          <Breadcrumb items={[{label:T("catalog.breadcrumbHome"),href:"/"},{label:cat.en}]} />
          <span className="eyebrow" style={{color:"#fff"}}>{T("catalog.categoryEyebrow")}</span>
          <h1 className="cathero__title display">{cat.en}</h1>
          <p className="cathero__sub">{cat.blurb}</p>
        </div>
      </section>

      <section className="wrap-wide sect">
        <FilterBar subs={cat.subs} active={sub} onPick={setSub} sort={sort} onSort={setSort} />
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
  const [sort, setSort] = useState("pop");
  useReveal([sort]);
  useEffect(() => { window.scrollTo({ top: 0 }); }, []);

  const list = [...LB.PRODUCTS].sort((a,b) => {
    if (sort === "low") return a.price - b.price;
    if (sort === "high") return b.price - a.price;
    if (sort === "rate") return b.rating - a.rating;
    if (sort === "new") return (b.tag==="新着") - (a.tag==="新着");
    return b.reviews - a.reviews;
  });

  return (
    <main className="wrap-wide sect">
      <div className="allhead reveal in">
        <span className="eyebrow">{T("all.eyebrowPrefix")} · {LB.PRODUCTS.length}</span>
        <h1 className="section-title">{T("all.title")}</h1>
        <p className="allhead__sub">{T("all.sub")}</p>
      </div>

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
          <button className="btn btn--dark" onClick={()=>window.LBnav("/")}>{T("saved.emptyCta")}</button>
        </div>
      ) : (
        <div className="prodgrid prodgrid--4">
          {list.map((p,i) => <ProductCard key={p.id} p={p} index={i} onOpen={onOpen} />)}
        </div>
      )}
    </main>
  );
}

Object.assign(window, { CategoryPage, SavedPage, AllPage });
