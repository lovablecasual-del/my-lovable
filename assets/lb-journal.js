/* ============================================================
   LOVABLE — Journal (article detail page)
   ============================================================ */

/* tiny, safe markdown -> HTML: escapes first, then whitelists a small tag set. */
function mdToHtml(src) {
  if (!src) return "";
  let h = String(src)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  h = h.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">');
  h = h.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer nofollow">$1</a>');
  h = h.replace(/^### (.*)$/gm, "<h3>$1</h3>").replace(/^## (.*)$/gm, "<h2>$1</h2>").replace(/^# (.*)$/gm, "<h2>$1</h2>");
  h = h.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>").replace(/\*([^*]+)\*/g, "<em>$1</em>");
  h = h.replace(/(?:^- .*(?:\n|$))+/gm, (m) => "<ul>" + m.trim().split("\n").map((l) => "<li>" + l.replace(/^- /, "") + "</li>").join("") + "</ul>");
  h = h.split(/\n{2,}/).map((b) => (/^\s*<(h\d|ul|img)/.test(b.trim()) ? b : (b.trim() ? "<p>" + b.trim().replace(/\n/g, "<br>") + "</p>" : ""))).join("\n");
  return h;
}

function ArticlePage({ id, onOpen }) {
  const a = window.LBStore && window.LBStore.getArticle(id);
  useReveal([id]);
  useEffect(() => { window.scrollTo({ top: 0, behavior: "auto" }); }, [id]);

  // Defensive: only ever render a published article, even if the anon
  // read ever returns drafts — never let an unpublished article leak.
  if (!a || a.status !== "published") {
    return (
      <main className="wrap sect" style={{ textAlign: "center" }}>
        <p>{T("journal.notFound")}</p>
        <button className="btn btn--dark" style={{ marginTop: 18 }} onClick={() => window.LBnav("/")}>{T("error.cta")}</button>
      </main>
    );
  }

  const items = (a.items || []).map((pid) => LB.get(pid)).filter(Boolean);

  return (
    <main className="pdp">
      <div className="wrap-wide">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: T("journal.crumbLabel"), href: "/#features" }, { label: a.title }]} />
        <article className="journal">
          <div className="journal__cover reveal in">
            <Ph grad={a.cover ? null : a.coverGrad} img={a.cover} label={a.title} ratio="16 / 9" labelSize={0} />
          </div>
          <div className="journal__head reveal in">
            {(a.kicker || a.read) && <span className="eyebrow">{a.kicker}{a.kicker && a.read ? " · " : ""}{a.read}</span>}
            <h1 className="journal__title serif">{a.title}</h1>
            {a.excerpt && <p className="journal__excerpt">{a.excerpt}</p>}
          </div>
          <div className="journal__body reveal in" dangerouslySetInnerHTML={{ __html: mdToHtml(a.body) }}></div>
        </article>

        {items.length > 0 &&
        <section className="pdp__section reveal">
          <div className="pdp__sechead"><span className="eyebrow">{T("journal.itemsEyebrow")}</span><h2 className="section-title">{T("journal.itemsTitle")}</h2></div>
          <div className="prodgrid prodgrid--4">
            {items.map((p, i) => <ProductCard key={p.id} p={p} index={i} onOpen={onOpen} />)}
          </div>
        </section>}
      </div>
    </main>);
}

Object.assign(window, { ArticlePage });
