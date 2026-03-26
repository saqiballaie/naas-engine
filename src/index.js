import { layout } from './layout.js';
import * as db from './database.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // 1. API: Autocomplete
    if (url.searchParams.has("ajax_search")) {
      const term = url.searchParams.get("ajax_search");
      const { results } = await env.DB.prepare(`
        SELECT m.main_display_name as Name, v.issn_original as ISSN 
        FROM journal_variants v JOIN journal_master m ON v.master_id = m.master_id
        WHERE m.main_display_name LIKE ? OR v.issn_clean LIKE ? LIMIT 8
      `).bind(`%${term}%`, `%${term.replace(/-/g, '')}%`).all();
      return new Response(JSON.stringify(results));
    }

    // 2. Route: Journal Metrics
    if (path === "/journalmetrics.php" || path === "/journal") {
      const mid = url.searchParams.get("id") || url.searchParams.get("master_id");
      const data = await db.getJournalMetrics(env.DB, mid);
      const content = renderAnalyticsBody(data);
      return new Response(layout(data.name, content, path), { headers: {"Content-Type": "text/html"} });
    }

    // 3. Route: Home / Search
    const latestYear = await db.getLatestYear(env.DB);
    const searchTerm = url.searchParams.get("search") || "";
    const min = url.searchParams.get("min_rating") || "";
    const max = url.searchParams.get("max_rating") || "";
    
    let results = [];
    if (url.searchParams.has("search")) {
      const searchRes = await db.searchJournals(env.DB, latestYear, searchTerm, min, max);
      results = searchRes.results;
    }

    const content = renderSearchBody(searchTerm, min, max, latestYear, results);
    return new Response(layout("Search Portal", content, path), { headers: {"Content-Type": "text/html"} });
  }
};

// Insert your specific View Render functions (renderSearchBody, etc.) below...
