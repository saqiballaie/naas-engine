export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // --- AJAX: AUTOCOMPLETE HANDLER ---
    if (url.searchParams.has("ajax_search")) {
      const term = url.searchParams.get("ajax_search");
      const { results } = await env.DB.prepare(`
        SELECT main_display_name as Name_of_the_Journal, issn_original as ISSN 
        FROM journal_variants v
        JOIN journal_master m ON v.master_id = m.master_id
        WHERE m.main_display_name LIKE ? OR v.issn_clean LIKE ?
        LIMIT 10
      `).bind(`%${term}%`, `%${term.replace(/-/g, '')}%`).all();
      return new Response(JSON.stringify(results), { headers: { "Content-Type": "application/json" } });
    }

    // --- PAGE: JOURNAL TRENDS (Metric View) ---
    if (url.pathname === "/journalmetrics.php") {
      const issn = url.searchParams.get("issn");
      // Redirect to our journal detail path
      const journal = await env.DB.prepare("SELECT master_id FROM journal_variants WHERE issn_original = ?").bind(issn).first();
      if (journal) return Response.redirect(`${url.origin}/journal?id=${journal.master_id}`, 301);
    }

    // --- LOGIC: MAIN SEARCH & FILTERS ---
    let results = [];
    const searchTerm = url.searchParams.get("search") || "";
    const minRating = url.searchParams.get("min_rating") || "";
    const maxRating = url.searchParams.get("max_rating") || "";
    const isSearchSubmitted = url.searchParams.has("search") || minRating || maxRating;

    // 1. Get the Latest Year available in DB
    const latestYearRow = await env.DB.prepare("SELECT MAX(year) as yr FROM naas_ratings").first();
    const latestYear = latestYearRow ? latestYearRow.yr : new Date().getFullYear();

    if (isSearchSubmitted) {
      // 2. Complex Query: Get Latest Score AND 10-Year Average in one go
      const query = `
        SELECT 
          m.main_display_name as Name_of_the_Journal,
          v.issn_original as ISSN,
          v.master_id,
          MAX(CASE WHEN r.year = ? THEN r.rating END) as latest_score,
          AVG(r.rating) as calculated_avg,
          COUNT(r.rating) as valid_years
        FROM journal_master m
        JOIN journal_variants v ON m.master_id = v.master_id
        LEFT JOIN naas_ratings r ON v.issn_clean = r.issn_clean
        WHERE (m.main_display_name LIKE ? OR v.issn_clean LIKE ?)
        GROUP BY m.master_id
        HAVING (latest_score >= ? OR ? = '') AND (latest_score <= ? OR ? = '')
        ORDER BY latest_score DESC, calculated_avg DESC, Name_of_the_Journal ASC
        LIMIT 100
      `;
      
      const searchBind = `%${searchTerm}%`;
      const issnBind = `%${searchTerm.replace(/-/g, '')}%`;
      
      const dbResponse = await env.DB.prepare(query)
        .bind(latestYear, searchBind, issnBind, minRating, minRating, maxRating, maxRating)
        .all();
      results = dbResponse.results;
    }

    return new Response(renderFullPage(searchTerm, minRating, maxRating, latestYear, results, isSearchSubmitted), {
      headers: { "Content-Type": "text/html" }
    });
  }
};

// --- UI: FULL HTML TEMPLATE (Merging your PHP styles) ---
function renderFullPage(searchTerm, minRating, maxRating, latestYear, results, isSearchSubmitted) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Journal Search Portal | NAAS Insights</title>
    <style>
        :root {
            --primary: #1a73e8; --primary-light: #e8f0fe; --white: #ffffff;
            --border: #dadce0; --text-muted: #5f6368; --success: #1e8e3e; --accent: #ff9800;
        }
        body { font-family: 'Segoe UI', Tahoma, sans-serif; background: #f8f9fa; margin: 0; color: #3c4043; }
        .card { background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.12); margin-bottom: 20px; padding: 20px; }
        .main-wrapper { width: 95%; max-width: 1200px; margin: 30px auto; padding: 0 10px; }
        .autocomplete-wrapper { position: relative; }
        .autocomplete-dropdown {
            position: absolute; top: 100%; left: 0; right: 0; background: white;
            border: 1px solid var(--border); border-radius: 0 0 8px 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1); display: none; z-index: 1000;
        }
        .autocomplete-item { padding: 12px; cursor: pointer; border-bottom: 1px solid #eee; }
        .autocomplete-item:hover { background: var(--primary-light); }
        .search-grid { display: grid; grid-template-columns: 1fr 1fr auto; gap: 15px; align-items: end; margin-top: 15px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { padding: 12px; border-bottom: 1px solid #eee; text-align: left; }
        th { background: #f1f3f4; font-size: 14px; }
        .rating-badge { background: var(--primary); color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold; }
        .btn { background: var(--primary); color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; text-decoration: none; font-size: 14px; }
        @media (max-width: 768px) { .search-grid { grid-template-columns: 1fr; } }
    </style>
</head>
<body>
    <div class="main-wrapper">
        <div class="card" style="text-align:center; border-top: 5px solid var(--primary);">
            <h2 style="color: var(--primary);">NAAS Insights Engine</h2>
            <form action="/" method="GET" style="max-width: 800px; margin: 0 auto; text-align: left;">
                <div class="autocomplete-wrapper">
                    <input type="text" id="main-search" name="search" value="${searchTerm}" placeholder="Type Journal Name or ISSN..." style="width:100%; padding:12px; border:1px solid var(--border); border-radius:8px; box-sizing:border-box;">
                    <div id="search-dropdown" class="autocomplete-dropdown"></div>
                </div>
                <div class="search-grid">
                    <div><label>Min Rating (${latestYear})</label><br><input type="number" step="0.01" name="min_rating" value="${minRating}" style="width:100%; padding:10px; border:1px solid var(--border); border-radius:4px;"></div>
                    <div><label>Max Rating (${latestYear})</label><br><input type="number" step="0.01" name="max_rating" value="${maxRating}" style="width:100%; padding:10px; border:1px solid var(--border); border-radius:4px;"></div>
                    <button type="submit" class="btn">Search Database</button>
                </div>
            </form>
        </div>

        ${isSearchSubmitted ? `
        <div class="card">
            <h3>Search Results (${results.length})</h3>
            <div style="overflow-x:auto;">
                <table>
                    <thead>
                        <tr>
                            <th>Journal Name</th>
                            <th>ISSN</th>
                            <th>10-Yr Avg</th>
                            <th>Rating (${latestYear})</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${results.map(row => `
                            <tr>
                                <td><b>${row.Name_of_the_Journal}</b></td>
                                <td style="font-family:monospace;">${row.ISSN}</td>
                                <td style="color:var(--success); font-weight:bold;">${row.calculated_avg ? row.calculated_avg.toFixed(2) : 'N/A'}</td>
                                <td><span class="rating-badge">${row.latest_score || 'N/A'}</span></td>
                                <td><a href="/journal?id=${row.master_id}" class="btn" style="background:var(--accent)">Trends</a></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>` : ''}
    </div>

    <script>
        const input = document.getElementById('main-search');
        const dropdown = document.getElementById('search-dropdown');
        input.addEventListener('input', async () => {
            if (input.value.length < 2) { dropdown.style.display = 'none'; return; }
            const res = await fetch('/?ajax_search=' + encodeURIComponent(input.value));
            const data = await res.json();
            dropdown.innerHTML = data.map(item => \`
                <div class="autocomplete-item" onclick="select('\${item.Name_of_the_Journal}')">
                    <b>\${item.Name_of_the_Journal}</b><br><small>ISSN: \${item.ISSN}</small>
                </div>\`).join('');
            dropdown.style.display = 'block';
        });
        function select(val) { input.value = val; dropdown.style.display = 'none'; }
    </script>
</body>
</html>`;
}
