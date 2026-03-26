import { layout } from './ui/base-layout.js';
import * as db from './database.js';

// Page Renderers
import { renderSearchPage } from './pages/search-page.js';
import { renderAnalyticsPage } from './pages/analytics-page.js';
import { renderComparePage } from './pages/compare-page.js';
import { renderStatisticsPage } from './pages/statistics-page.js';
import { renderDisclaimer, renderTerms } from './pages/legal-pages.js';
import { renderAboutPage } from './pages/about-page.js';

export default {
  /**
   * Main Fetch Handler
   * @param {Request} request 
   * @param {Env} env - Contains D1 Database binding 'DB'
   * @param {ExecutionContext} ctx - Used for cache operations
   */
  async fetch(request, env, ctx) {
    if (!env.DB) return new Response("Error: D1 Database Binding (DB) is missing.", { status: 500 });
    
    const url = new URL(request.url);
    const path = url.pathname;
    const cache = caches.default;

    try {
      // 1. AJAX Autocomplete (Optimized with Edge Caching)
      // -------------------------------------------------------------
      if (url.searchParams.has("ajax_search")) {
        const cacheKey = new Request(url.toString(), request);
        let response = await cache.match(cacheKey);

        if (!response) {
            const term = url.searchParams.get("ajax_search");
            const results = await env.DB.prepare(`
              SELECT m.main_display_name as Name, MAX(v.issn_original) as ISSN, m.master_id 
              FROM journal_variants v JOIN journal_master m ON v.master_id = m.master_id 
              WHERE m.main_display_name LIKE ? OR v.issn_clean LIKE ? 
              GROUP BY m.master_id LIMIT 8
            `).bind(`%${term}%`, `%${term.replace(/-/g, '')}%`).all();
            
            response = new Response(JSON.stringify(results.results || []), { 
                headers: { 
                  "Content-Type": "application/json", 
                  "Cache-Control": "public, max-age=86400" 
                } 
            });
            ctx.waitUntil(cache.put(cacheKey, response.clone()));
        }
        return response;
      }

      // 2. Global Statistics (Long-term Caching)
      // -------------------------------------------------------------
      if (path === "/statistics") {
        const cacheKey = new Request(url.toString(), request);
        let response = await cache.match(cacheKey);

        if (!response) {
            const stats = await db.getGlobalStats(env.DB);
            const content = renderStatisticsPage(stats);
            response = new Response(layout("Global Statistics", content, path), { 
                headers: { 
                  "Content-Type": "text/html", 
                  "Cache-Control": "public, max-age=86400" 
                } 
            });
            ctx.waitUntil(cache.put(cacheKey, response.clone()));
        }
        return response;
      }

      // 3. Journal Analytics (Validated Input)
      // -------------------------------------------------------------
      if (path === "/journal") {
        const rawId = url.searchParams.get("id");
        if (!rawId) return Response.redirect(url.origin + "/", 302);

        const data = await db.getJournalMetrics(env.DB, rawId);
        data.master_id = rawId;
        
        return new Response(layout(data.name, renderAnalyticsPage(data), path), { 
            headers: { "Content-Type": "text/html" } 
        });
      }

      // 4. Comparison Engine (Multi-ID Parsing)
      // -------------------------------------------------------------
      if (path === "/compare") {
        const ids = [
            url.searchParams.get("id1"), url.searchParams.get("id2"), 
            url.searchParams.get("id3"), url.searchParams.get("id4"),
            url.searchParams.get("id5")
        ].filter(Boolean);

        let journals = [];
        for (let id of ids) {
            const journalData = await db.getJournalMetrics(env.DB, id);
            journalData.master_id = id;
            journals.push(journalData);
        }
        
        return new Response(layout("Compare Journals", renderComparePage(journals), path), { 
            headers: { "Content-Type": "text/html" } 
        });
      }

      if (path === "/about") {
    return new Response(layout("About the Project", renderAboutPage(), path), { 
        headers: { "Content-Type": "text/html" } 
    });
}

      // 5. Legal Routes (For Indian Copyright Compliance)
      // -------------------------------------------------------------
      if (path === "/disclaimer") {
          return new Response(layout("Legal Disclaimer", renderDisclaimer(), path), { 
              headers: { "Content-Type": "text/html" } 
          });
      }

      if (path === "/terms") {
          return new Response(layout("Terms of Use", renderTerms(), path), { 
              headers: { "Content-Type": "text/html" } 
          });
      }

      // 6. Search Portal (Root Path)
      // -------------------------------------------------------------
      if (path === "/" || path === "/index.php") {
        const latestYear = await db.getLatestYear(env.DB);
        const search = url.searchParams.get("search") || "";
        
        // NEW: Get the page number from URL
        const page = parseInt(url.searchParams.get("page") || "1");
        
        const rawMin = url.searchParams.get("min_rating");
        const rawMax = url.searchParams.get("max_rating");
        const min = rawMin && !isNaN(parseFloat(rawMin)) ? parseFloat(rawMin).toString() : "";
        const max = rawMax && !isNaN(parseFloat(rawMax)) ? parseFloat(rawMax).toString() : "";
        
        const isSubmitted = !!(search || min || max);
        
        // UPDATED: Pass 'page' to the search function
        const results = isSubmitted ? await db.searchJournals(env.DB, latestYear, search, min, max, page) : [];

        // UPDATED: Pass 'page' to the renderer
        return new Response(layout("Search Journals", renderSearchPage(search, min, max, results, isSubmitted, page), path), { 
            headers: { "Content-Type": "text/html" } 
        });
      }

      // 7. Graceful 404 Catch-All
      // -------------------------------------------------------------
      const notFoundUI = `
        <div class="card" style="text-align: center; padding: 50px;">
            <h2 style="font-size: 40px; margin: 0;">🗺️</h2>
            <h2 style="color: var(--primary);">Page Not Found</h2>
            <p style="color: #64748b;">The journal or page you are looking for does not exist.</p>
            <a href="/" class="btn" style="margin-top: 15px;">Return to Search</a>
        </div>
      `;
      return new Response(layout("404 Not Found", notFoundUI, path), { 
          status: 404, 
          headers: { "Content-Type": "text/html" } 
      });

    } catch (e) { 
      // 8. Error Logging & Secure 500 Response
      // -------------------------------------------------------------
      console.error("Critical System Error:", e.message, e.stack); 
      
      const errorUI = `
        <div class="card" style="text-align: center; padding: 50px; border-top: 5px solid #dc2626;">
            <h2 style="font-size: 40px; margin: 0;">⚠️</h2>
            <h2 style="color: #dc2626;">System Interface Error</h2>
            <p style="color: #64748b;">The engine encountered an unexpected error. This has been logged for the developers. Please try again shortly.</p>
            <a href="/" class="btn" style="background: #475569; margin-top: 15px;">Return Home</a>
        </div>
      `;
      return new Response(layout("System Error", errorUI, path), { 
          status: 500, 
          headers: { "Content-Type": "text/html" } 
      }); 
    }
  }
};
