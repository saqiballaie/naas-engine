import { layout } from './layout.js';
import * as db from './database.js';
import { renderSearchBody, renderAnalyticsBody } from './views.js';

export default {
  async fetch(request, env) {
    if (!env.DB) return new Response("Error: Database Binding 'DB' Missing in Cloudflare Settings.", { status: 500 });
    
    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // 1. AUTOCOMPLETE
      if (url.searchParams.has("ajax_search")) {
        const term = url.searchParams.get("ajax_search");
        const results = await env.DB.prepare(`
          SELECT m.main_display_name as Name, MAX(v.issn_original) as ISSN 
          FROM journal_variants v JOIN journal_master m ON v.master_id = m.master_id 
          WHERE m.main_display_name LIKE ? OR v.issn_clean LIKE ? 
          GROUP BY m.master_id LIMIT 8
        `).bind(`%${term}%`, `%${term.replace(/-/g, '')}%`).all();
        return new Response(JSON.stringify(results.results || []), { headers: { "Content-Type": "application/json" } });
      }

      // 2. ANALYTICS
      if (path === "/journal" || path === "/journalmetrics.php") {
        let mid = url.searchParams.get("id") || url.searchParams.get("master_id");
        const issn = url.searchParams.get("issn");

        if (issn && !mid) {
          const variant = await env.DB.prepare("SELECT master_id FROM journal_variants WHERE issn_original = ? OR issn_clean = ?").bind(issn, issn.replace(/-/g, '')).first();
          if (variant) mid = variant.master_id;
        }

        if (!mid) return new Response(layout("Error", "<div class='card'><h3>Journal Not Found</h3></div>", path, "N/A"), { headers: { "Content-Type": "text/html" } });

        const data = await db.getJournalMetrics(env.DB, mid);
        return new Response(layout(data.name, renderAnalyticsBody(data), path, "N/A"), { headers: { "Content-Type": "text/html" } });
      }

      // 3. HOME / SEARCH PORTAL
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
