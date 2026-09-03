/* ============================================================
   LOVABLE — generic static pages (About / Contact / Privacy / Operator)
   Content lives in the CMS content-registry (page: "pages"), so it can
   be edited from the admin panel like any other copy on the site.
   ============================================================ */

const PAGES = {
  about:    { titleKey: "pages.about.title",    bodyKey: "pages.about.body" },
  contact:  { titleKey: "pages.contact.title",  bodyKey: "pages.contact.body" },
  privacy:  { titleKey: "pages.privacy.title",  bodyKey: "pages.privacy.body" },
  operator: { titleKey: "pages.operator.title", bodyKey: "pages.operator.body" },
};

function StaticPage({ slug }) {
  useEffect(() => { window.scrollTo({ top: 0, behavior: "auto" }); }, [slug]);
  const def = PAGES[slug];

  if (!def) {
    return (
      <main className="wrap sect" style={{ textAlign: "center" }}>
        <p>{T("pages.notFound")}</p>
        <button className="btn btn--dark" style={{ marginTop: 18 }} onClick={() => window.LBnav("/")}>{T("error.cta")}</button>
      </main>
    );
  }

  const title = T(def.titleKey);
  const body = T(def.bodyKey);

  return (
    <main className="pdp">
      <div className="wrap-wide">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: title }]} />
        <article className="journal">
          <div className="journal__head reveal in" style={{ marginTop: 8 }}>
            <h1 className="journal__title serif">{title}</h1>
          </div>
          <div className="journal__body reveal in" dangerouslySetInnerHTML={{ __html: mdToHtml(body) }}></div>
        </article>
      </div>
    </main>);
}

Object.assign(window, { StaticPage, PAGES });
