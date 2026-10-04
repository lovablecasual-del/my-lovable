/* ============================================================
   LOVABLE — lightweight visit analytics (page views + sessions)
   No PII is collected: no IP, no user agent, no cookies — only a
   per-tab session id (sessionStorage) and the hash-route path.
   ============================================================ */
(function () {
  var sb = window.LBSupabase;
  if (!sb) return;

  var SID_KEY = "lovable.analytics.sid";
  var sid = null;
  try { sid = sessionStorage.getItem(SID_KEY); } catch (e) {}
  var isNewSession = false;
  if (!sid) {
    sid = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : ("s-" + Date.now() + "-" + Math.random().toString(36).slice(2));
    isNewSession = true;
    try { sessionStorage.setItem(SID_KEY, sid); } catch (e) {}
  }

  function currentPath() {
    var h = (window.location.hash || "").replace(/^#/, "");
    if (!h || h === "/") return "/";
    var path = h.split("#")[0];
    var parts = path.split("/").filter(Boolean);
    if (!parts.length) return "/";
    if (parts[0] === "category") return "/category/" + (parts[1] || "");
    if (parts[0] === "product")  return "/product/" + (parts[1] || "");
    if (parts[0] === "all")      return "/all";
    if (parts[0] === "saved")    return "/saved";
    return "/" + parts.join("/");
  }

  var lastPath = null;
  function noop() {}
  function track() {
    var path = currentPath();
    if (path === lastPath) return; // skip duplicate fires (e.g. in-page anchor jumps)
    lastPath = path;
    var now = new Date().toISOString();

    if (isNewSession) {
      isNewSession = false;
      sb.from("analytics_sessions").insert({ id: sid, first_seen: now, last_seen: now, entry_path: path }).then(noop, noop);
    } else {
      sb.from("analytics_sessions").update({ last_seen: now }).eq("id", sid).then(noop, noop);
    }
    sb.from("analytics_pageviews").insert({ session_id: sid, path: path, created_at: now }).then(noop, noop);
  }

  if (document.readyState === "complete" || document.readyState === "interactive") track();
  else document.addEventListener("DOMContentLoaded", track);
  window.addEventListener("hashchange", track);

  // heartbeat: keep last_seen fresh while the tab is open and visible, so
  // "stay time" reflects actual dwell time, not just navigation events
  setInterval(function () {
    if (sid == null || document.visibilityState !== "visible") return;
    sb.from("analytics_sessions").update({ last_seen: new Date().toISOString() }).eq("id", sid).then(noop, noop);
  }, 60000);
})();
