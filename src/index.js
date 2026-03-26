import { layout } from './layout.js';
import * as db from './database.js';
import { renderSearchBody, renderAnalyticsBody } from './views.js';

export default {
  async fetch(request, env) {
    if (!env.DB) return new Response("Database Binding Missing", { status: 500 });
    const url = new URL(request.url);
    const path = url.pathname;

    try {
      if (url.searchParams.has("ajax_search")) {
        const term = url.searchParams.get("ajax_search");
        const results = await env.DB.prepare("SELECT m.main_display_name as Name, v.issn_original as ISSN FROM journal_variants v JOIN journal_master m ON v.master_id = m.master_id WHERE m.main_display_name LIKE ? LIMIT 8").bind(\`%\${term}%\`).all();
        return new Response(JSON.stringify(results.results), { headers: { "Content-Type": "application/json" } });
      }

      if (path === "/journal") {
        const mid = url.searchParams.get("id");
        const data = await db.getJournalMetrics(env.DB, mid);
        return new Response(layout(data.name, renderAnalyticsBody(data), path, ""), { headers: { "Content-Type": "text/html" } });
      }

      const latestYear = await db.getLatestYear(env.DB);
      const search = url.searchParams.get("search") || "";
      const min = url.searchParams.get("min_rating") || "";
      const max = url.searchParams.get("max_rating") || "";
      let results = [];
      if (search || min || max) results = await db.searchJournals(env.DB, latestYear, search, min, max);

      return new Response(layout("Search", renderSearchBody(search, min, max, latestYear, results), path, latestYear), { headers: { "Content-Type": "text/html" } });

    } catch (e) { return new Response(e.message, { status: 500 }); }
  }
};
