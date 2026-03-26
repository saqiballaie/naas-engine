import { layout } from './ui/base-layout.js';
import * as db from './database.js';

// Import Page Renderers
import { renderSearchPage } from './pages/search-page.js';
import { renderAnalyticsPage } from './pages/analytics-page.js';
import { renderComparePage } from './pages/compare-page.js';
import { renderStatisticsPage } from './pages/statistics-page.js';

export default {
  // Added 'ctx' (context) parameter which is required for Cloudflare Caching
  async fetch(request, env, ctx) {
    if (!env.DB) return new Response("Error: Database Binding Missing.", { status: 500 });
    
    const url = new URL(request.url);
    const path = url.pathname;
    
    // Initialize Cloudflare's Edge Cache
    const cache = caches.default;

    try {
      // -------------------------------------------------------------
      // 1. AJAX Autocomplete (With Cloudflare Edge Caching)
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
                    "Cache-Control": "public, max-age=86400" // Cache for 24 hours
                } 
            });
            // Store the response in the cache without blocking the user
            ctx.waitUntil(cache.put(cacheKey, response.clone()));
        }
        return response;
      }

      // -------------------------------------------------------------
      // 2. Global Statistics Page (With Cloudflare Edge Caching)
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
                    "Cache-Control": "public, max-age=86400" // Statistics only change yearly
                } 
            });
            ctx.waitUntil(cache.put(cacheKey, response.clone()));
        }
        return response;
      }

      // -------------------------------------------------------------
      // 3. Individual Journal Analytics (With Strict Input Validation)
      // -------------------------------------------------------------
      if (path === "/journal") {
        const rawId = url.searchParams.get("id");
        const mid = parseInt(rawId, 10);
        
        // Strict Validation: Ensure ID is an actual number before hitting the DB
        if (isNaN(mid)) {
            const invalidUI = `<div class='card' style='text-align:center; padding:50px;'><h2 style='color:#dc2626;'>Invalid Journal ID</h2><p>The identifier provided is corrupted or invalid.</p><a href='/' class='btn'>Return Home</a></div>`;
            return new Response(layout("Invalid Request", invalidUI, path), { status: 400, headers: { "Content-Type": "text/html" } });
        }

        const data = await db.getJournalMetrics(env.DB, mid);
        data.master_id = mid;
        
        const content = renderAnalyticsPage(data);
        return new Response(layout(data.name, content, path), { headers: { "Content-Type": "text/html" } });
      }

      // -------------------------------------------------------------
      // 4. Comparison Page (With Strict Input Validation)
      // -------------------------------------------------------------
      if (path === "/compare") {
        // Collect, parse, and strictly validate up to 5 journal IDs
        const ids = [
            url.searchParams.get("id1"), url.searchParams.get("id2"), 
            url.searchParams.get("id3"), url.searchParams.get("id4"),
            url.searchParams.get("id5")
        ].filter(Boolean)
         .map(id => parseInt(id, 10))
         .filter(id => !isNaN(id));

        let journals = [];
        for (let id of ids) {
            const journalData = await db.getJournalMetrics(env.DB, id);
            journalData.master_id = id;
            journals.push(journalData);
        }
        
        const content = renderComparePage(journals);
        return new Response(layout("Compare Journals", content, path), { headers: { "Content-Type": "text/html" } });
      }

      // -------------------------------------------------------------
      // 5. Search Portal (Exact Match & Sanitized Values)
      // -------------------------------------------------------------
      if (path === "/" || path === "/index.php") {
        const latestYear = await db.getLatestYear(env.DB);
        const search = url.searchParams.get("search") || "";
        
        // Strict Validation: Constrain min/max inputs to realistic NAAS limits (0 to 20)
        const rawMin = url.searchParams.get("min_rating");
        const rawMax = url.searchParams.get("max_rating");
        const min = rawMin && !isNaN(parseFloat(rawMin)) ? Math.max(0, Math.min(20, parseFloat(rawMin))).toString() : "";
        const max = rawMax && !isNaN(parseFloat(rawMax)) ? Math.max(0, Math.min(20, parseFloat(rawMax))).toString() : "";
        
        const isSubmitted = !!(search || min || max);
        const results = isSubmitted ? await db.searchJournals(env.DB, latestYear, search, min, max) : [];

        const content = renderSearchPage(search, min, max, results, isSubmitted);
        return new Response(layout("Search Journals", content, path), { headers: { "Content-Type": "text/html" } });
      }

      // -------------------------------------------------------------
      // 6. Graceful 404 Catch-All Page
      // -------------------------------------------------------------
      // If the code reaches here, the path didn't match /, /journal, /compare, or /statistics
      const notFoundContent = `
        <div class="card" style="text-align: center; padding: 50px;">
            <h2 style="font-size: 40px; margin: 0;">🗺️</h2>
            <h2 style="color: var(--primary);">Page Not Found</h2>
            <p style="color: #64748b;">The journal or system page you are looking for does not exist.</p>
            <a href="/" class="btn" style="margin-top: 15px;">Return to Search Portal</a>
        </div>
      `;
      return new Response(layout("404 Not Found", notFoundContent, path), { 
          status: 404, 
          headers: { "Content-Type": "text/html" } 
      });

    } catch (e) { 
      // -------------------------------------------------------------
      // 7. Graceful 500 System Error UI
      // -------------------------------------------------------------
      // Logs the real error securely to your Cloudflare Dashboard, but hides it from public users
      console.error("System Error:", e.message, e.stack); 
      
      const errorContent = `
        <div class="card" style="text-align: center; padding: 50px; border-top: 5px solid #dc2626;">
            <h2 style="font-size: 40px; margin: 0;">⚠️</h2>
            <h2 style="color: #dc2626;">System Interface Error</h2>
            <p style="color: #64748b;">The engine encountered an unexpected database issue while fetching the data. Please try again in a few moments.</p>
            <a href="/" class="btn" style="background: #475569; margin-top: 15px;">Return Home</a>
        </div>
      `;
      return new Response(layout("System Error", errorContent, path), { 
          status: 500, 
          headers: { "Content-Type": "text/html" } 
      }); 
    }
  }
};
