import { layout } from './layout.js';
import * as db from './database.js';
import { renderSearchBody, renderAnalyticsBody, renderCompareBody } from './views.js'; // Added renderCompareBody

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
          SELECT m.main_display_name as Name, MAX(v.issn_original) as ISSN 
          FROM journal_variants v JOIN journal_master m ON v.master_id = m.master_id 
          WHERE m.main_display_name LIKE ? OR v.issn_clean LIKE ? 
          GROUP BY m.master_id LIMIT 8
        `).bind(`%${term}%`, `%${term.replace(/-/g, '')}%`).all();
        return new Response(JSON.stringify(results.results || []), { headers: { "Content-Type": "application/json" } });
      }

      // 2. ANALYTICS PAGE
      if (path === "/journal" || path === "/journalmetrics.php") {
        let mid = url.searchParams.get("id") || url.searchParams.get("master_id");
        const issn = url.searchParams.get("issn");

        if (issn && !mid) {
          const variant = await env.DB.prepare("SELECT master_id FROM journal_variants WHERE issn_original = ? OR issn_clean = ?").bind(issn, issn.replace(/-/g, '')).first();
          if (variant) mid = variant.master_id;
        }

        if (!mid) return new Response(layout("Error", "<div class='card'><h3>Journal Not Found</h3></div>", path, "N/A"), { headers: { "Content-Type": "text/html" } });

        const data = await db.getJournalMetrics(env.DB, mid);
        data.master_id = mid; // Attach ID for the compare button
        return new Response(layout(data.name, renderAnalyticsBody(data), path, "N/A"), { headers: { "Content-Type": "text/html" } });
      }

      // 3. COMPARE PAGE
      if (path === "/compare" || path === "/compare.php") {
        const id1 = url.searchParams.get("id1");
        const id2 = url.searchParams.get("id2");
        const search2 = url.searchParams.get("search2");

        if (!id1) {
            return new Response(layout("Compare Journals", "<div class='card' style='text-align:center; padding:40px;'><h3>Please select a journal to compare first.</h3><br><a href='/' class='btn'>Go to Search</a></div>", path, "N/A"), { headers: { "Content-Type": "text/html" } });
        }

        // If user searched for Journal 2 by text, find its ID and redirect cleanly
        if (search2 && !id2) {
            const cleanSearch = search2.replace(/-/g, '').toUpperCase();
            const j2 = await env.DB.prepare(`
                SELECT m.master_id FROM journal_master m 
                JOIN journal_variants v ON m.master_id = v.master_id 
                WHERE m.main_display_name LIKE ? OR v.issn_clean LIKE ? LIMIT 1
            `).bind(`%${search2}%`, `%${cleanSearch}%`).first();
            
            if (j2) {
                return Response.redirect(`${url.origin}/compare?id1=${id1}&id2=${j2.master_id}`, 302);
            }
        }

        const data1 = await db.getJournalMetrics(env.DB, id1);
        let data2 = null;
        if (id2) data2 = await db.getJournalMetrics(env.DB, id2);

        return new Response(layout("Compare | " + data1.name, renderCompareBody(data1, data2, id1, search2), path, "N/A"), { headers: { "Content-Type": "text/html" } });
      }

      // 4. HOME / SEARCH PORTAL
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
