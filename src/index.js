import { layout } from './layout.js';
import * as db from './database.js';
import { renderSearchBody, renderAnalyticsBody, renderCompareBody, renderStatisticsBody } from './views.js'; 

export default {
  async fetch(request, env) {
    if (!env.DB) return new Response("Error: Database Binding Missing.", { status: 500 });
    const url = new URL(request.url);
    const path = url.pathname;

    try {
      if (url.searchParams.has("ajax_search")) {
        const term = url.searchParams.get("ajax_search");
        const results = await env.DB.prepare(`
          SELECT m.main_display_name as Name, MAX(v.issn_original) as ISSN, m.master_id 
          FROM journal_variants v JOIN journal_master m ON v.master_id = m.master_id 
          WHERE m.main_display_name LIKE ? OR v.issn_clean LIKE ? 
          GROUP BY m.master_id LIMIT 8
        `).bind(`%${term}%`, `%${term.replace(/-/g, '')}%`).all();
        return new Response(JSON.stringify(results.results || []), { headers: { "Content-Type": "application/json" } });
      }

      if (path === "/statistics") {
        const stats = await db.getGlobalStats(env.DB);
        return new Response(layout("Statistics Dashboard", renderStatisticsBody(stats), path, stats.latestYear), { headers: { "Content-Type": "text/html" } });
      }

      if (path === "/journal") {
        const mid = url.searchParams.get("id");
        if (!mid) return new Response("Missing ID", { status: 400 });
        const data = await db.getJournalMetrics(env.DB, mid);
        data.master_id = mid;
        return new Response(layout(data.name, renderAnalyticsBody(data), path, "N/A"), { headers: { "Content-Type": "text/html" } });
      }

      if (path === "/compare") {
        const ids = [url.searchParams.get("id1"), url.searchParams.get("id2"), url.searchParams.get("id3"), url.searchParams.get("id4")].filter(Boolean);
        let journals = [];
        for (let id of ids) {
            const jData = await db.getJournalMetrics(env.DB, id);
            jData.master_id = id;
            journals.push(jData);
        }
        return new Response(layout("Comparison Engine", renderCompareBody(journals), path, "N/A"), { headers: { "Content-Type": "text/html" } });
      }

      const latestYear = await db.getLatestYear(env.DB);
      const s = url.searchParams.get("search") || "";
      const min = url.searchParams.get("min_rating") || "";
      const max = url.searchParams.get("max_rating") || "";
      const results = (s || min || max) ? await db.searchJournals(env.DB, latestYear, s, min, max) : [];
      return new Response(layout("Search", renderSearchBody(s, min, max, latestYear, results, (s || min || max)), path, latestYear), { headers: { "Content-Type": "text/html" } });
    } catch (e) { return new Response(`Worker Error: ${e.message}`, { status: 500 }); }
  }
};
