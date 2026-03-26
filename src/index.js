import { layout } from './layout.js';
import * as db from './database.js';
import { renderSearchBody, renderAnalyticsBody, renderCompareBody, renderStatisticsBody } from './views.js'; 

export default {
  async fetch(request, env) {
    if (!env.DB) return new Response("Error: Database Binding 'DB' Missing in Cloudflare Settings.", { status: 500 });
    
    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // 1. AUTOCOMPLETE API
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

      // 2. STATISTICS PAGE (New Analysis Section)
      if (path === "/statistics") {
        const stats = await db.getGlobalStats(env.DB);
        return new Response(layout("Global Statistics", renderStatisticsBody(stats), path, stats.latestYear), { 
          headers: { "Content-Type": "text/html" } 
        });
      }

      // 3. ANALYTICS PAGE
      if (path === "/journal" || path === "/journalmetrics.php") {
        let mid = url.searchParams.get("id") || url.searchParams.get("master_id");
        const issn = url.searchParams.get("issn");

        if (issn && !mid) {
          const variant = await env.DB.prepare("SELECT master_id FROM journal_variants WHERE issn_original = ? OR issn_clean = ?").bind(issn, issn.replace(/-/g, '')).first();
          if (variant) mid = variant.master_id;
        }

        if (!mid) return new Response(layout("Error", "<div class='card'><h3>Journal Not Found</h3></div>", path, "N/A"), { headers: { "Content-Type": "text/html" } });

        const data = await db.getJournalMetrics(env.DB, mid);
        data.master_id = mid; 
        return new Response(layout(data.name, renderAnalyticsBody(data), path, "N/A"), { headers: { "Content-Type": "text/html" } });
      }

      // 4. COMPARE PAGE
      if (path === "/compare" || path === "/compare.php") {
        const ids = [
            url.searchParams.get("id1"),
            url.searchParams.get("id2"),
            url.searchParams.get("id3"),
            url.searchParams.get("id4")
        ].filter(id => id !== null);

        let journals = [];
        for (let id of ids) {
            const data = await db.getJournalMetrics(env.DB, id);
            data.master_id = id;
            journals.push(data);
        }

        return new Response(layout("Compare Journals", renderCompareBody(journals), path, "N/A"), { headers: { "Content-Type": "text/html" } });
      }

      // 5. HOME / SEARCH PORTAL
      const latestYear = await db.getLatestYear(env.DB);
      const search = url.searchParams.get("search") || "";
      const min = url.searchParams.get("min_rating") || "";
      const max = url.searchParams.get("max_rating") || "";
      
      const isSearchSubmitted = url.searchParams.has("search") || url.searchParams.has("min_rating") || url.searchParams.has("max_rating");
      
      let results = [];
      if (isSearchSubmitted) {
        results = await db.searchJournals(env.DB, latestYear, search, min, max);
      }

      return new Response(layout("Search Portal", renderSearchBody(search, min, max, latestYear, results, isSearchSubmitted), path, latestYear), { 
        headers: { "Content-Type": "text/html" } 
      });

    } catch (e) { 
      return new Response(`Worker Error: ${e.message}\n${e.stack}`, { status: 500 }); 
    }
  }
};
