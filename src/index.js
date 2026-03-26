import { layout } from './ui/base-layout.js';
import * as db from './database.js';

// Import Page Renderers
import { renderSearchPage } from './pages/search-page.js';
import { renderAnalyticsPage } from './pages/analytics-page.js';
import { renderComparePage } from './pages/compare-page.js';
import { renderStatisticsPage } from './pages/statistics-page.js';

export default {
  async fetch(request, env) {
    // Ensure the D1 database binding exists
    if (!env.DB) return new Response("Error: Database Binding Missing.", { status: 500 });
    
    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // 1. AJAX Autocomplete (Handled directly for speed)
      if (url.searchParams.has("ajax_search")) {
        const term = url.searchParams.get("ajax_search");
        const results = await env.DB.prepare(`
          SELECT m.main_display_name as Name, MAX(v.issn_original) as ISSN, m.master_id 
          FROM journal_variants v JOIN journal_master m ON v.master_id = m.master_id 
          WHERE m.main_display_name LIKE ? OR v.issn_clean LIKE ? 
          GROUP BY m.master_id LIMIT 8
        `).bind(`%${term}%`, `%${term.replace(/-/g, '')}%`).all();
        return new Response(JSON.stringify(results.results || []), { 
            headers: { "Content-Type": "application/json" } 
        });
      }

      // 2. Global Statistics Page
      if (path === "/statistics") {
        const stats = await db.getGlobalStats(env.DB); //
        const content = renderStatisticsPage(stats);
        return new Response(layout("Global Statistics", content, path), { 
            headers: { "Content-Type": "text/html" } 
        });
      }

      // 3. Individual Journal Analytics Page
      if (path === "/journal") {
        const mid = url.searchParams.get("id");
        if (!mid) return new Response("Missing Journal ID", { status: 400 });
        
        const data = await db.getJournalMetrics(env.DB, mid); //
        data.master_id = mid;
        
        const content = renderAnalyticsPage(data);
        return new Response(layout(data.name, content, path), { 
            headers: { "Content-Type": "text/html" } 
        });
      }

      // 4. Comparison Page
      if (path === "/compare") {
        const ids = [
            url.searchParams.get("id1"), url.searchParams.get("id2"), 
            url.searchParams.get("id3"), url.searchParams.get("id4")
        ].filter(Boolean);

        let journals = [];
        for (let id of ids) {
            const journalData = await db.getJournalMetrics(env.DB, id);
            journalData.master_id = id;
            journals.push(journalData);
        }
        
        const content = renderComparePage(journals);
        return new Response(layout("Compare Journals", content, path), { 
            headers: { "Content-Type": "text/html" } 
        });
      }

      // 5. Search Portal (Default Landing Page)
      const latestYear = await db.getLatestYear(env.DB);
      const search = url.searchParams.get("search") || "";
      const min = url.searchParams.get("min_rating") || "";
      const max = url.searchParams.get("max_rating") || "";
      
      const isSubmitted = !!(search || min || max);
      const results = isSubmitted ? await db.searchJournals(env.DB, latestYear, search, min, max) : [];

      const content = renderSearchPage(search, min, max, results, isSubmitted);
      return new Response(layout("Search Journals", content, path), { 
          headers: { "Content-Type": "text/html" } 
      });

    } catch (e) { 
      // Error handling to prevent total site crashes
      return new Response(`Engine Error: ${e.message}`, { status: 500 }); 
    }
  }
};
