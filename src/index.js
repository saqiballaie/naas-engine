/**
 * NAAS Insights Engine - Main Entry Point (index.js)
 * High-performance router for Cloudflare Workers
 */

import { layout } from './layout.js';
import * as db from './database.js';
import { renderSearchBody, renderAnalyticsBody } from './views.js';

export default {
  async fetch(request, env) {
    // 1. SECURE DATABASE CONNECTION
    // If the binding is missing in Cloudflare settings, this prevents a silent crash.
    if (!env.DB) {
      return new Response("❌ DATABASE_BINDING_ERROR: Ensure your D1 database is named 'DB' in Cloudflare Settings.", { status: 500 });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // --- ROUTE 1: AJAX AUTOCOMPLETE (index.php?ajax_search=...) ---
      if (url.searchParams.has("ajax_search")) {
        const term = url.searchParams.get("ajax_search");
        const { results } = await env.DB.prepare(`
          SELECT m.main_display_name as Name, v.issn_original as ISSN 
          FROM journal_variants v 
          JOIN journal_master m ON v.master_id = m.master_id
          WHERE m.main_display_name LIKE ? OR v.issn_clean LIKE ? 
          LIMIT 8
        `).bind(`%${term}%`, `%${term.replace(/-/g, '')}%`).all();
        
        return new Response(JSON.stringify(results), { 
          headers: { "Content-Type": "application/json" } 
        });
      }

      // --- ROUTE 2: ANALYTICS PAGE (journalmetrics.php or /journal) ---
      if (path === "/journalmetrics.php" || path === "/journal") {
        const issn = url.searchParams.get("issn");
        let mid = url.searchParams.get("id") || url.searchParams.get("master_id");

        // If user accessed via ISSN (from your PHP legacy links), find the Master ID
        if (issn && !mid) {
          const variant = await env.DB.prepare("SELECT master_id FROM journal_variants WHERE issn_original = ? OR issn_clean = ?")
            .bind(issn, issn.replace(/-/g, '')).first();
          if (variant) mid = variant.master_id;
        }

        if (!mid) {
          return new Response(layout("Error", "<h3>Journal Not Found</h3><p>Please return to the search page.</p>", path, "N/A"), { 
            headers: { "Content-Type": "text/html" } 
          });
        }

        const data = await db.getJournalMetrics(env.DB, mid);
        const body = renderAnalyticsBody(data);
        return new Response(layout(data.name + " | Metrics", body, path, "N/A"), { 
          headers: { "Content-Type": "text/html" } 
        });
      }

      // --- ROUTE 3: HOME / SEARCH PORTAL (index.php or /) ---
      const latestYear = await db.getLatestYear(env.DB);
      const searchTerm = url.searchParams.get("search") || "";
      const min = url.searchParams.get("min_rating") || "";
      const max = url.searchParams.get("max_rating") || "";
      const isSearchSubmitted = url.searchParams.has("search") || min || max;

      let results = [];
      if (isSearchSubmitted) {
        const searchRes = await db.searchJournals(env.DB, latestYear, searchTerm, min, max);
        results = searchRes.results || [];
      }

      const body = renderSearchBody(searchTerm, min, max, latestYear, results);
      return new Response(layout("Journal Search Portal", body, path, latestYear), { 
        headers: { "Content-Type": "text/html" } 
      });

    } catch (err) {
      // ⚠️ CRASH PROTECTION: If anything fails, show the exact error instead of a blank page
      return new Response(`⚠️ SYSTEM ERROR\n\nMessage: ${err.message}\n\nStack: ${err.stack}`, { 
        status: 500,
        headers: { "Content-Type": "text/plain" }
      });
    }
  }
};
