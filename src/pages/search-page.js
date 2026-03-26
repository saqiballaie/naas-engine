export function renderSearchPage(searchTerm, min, max, results, isSearchSubmitted) {
    return `
    <div class="card" style="text-align: center; border-top: 5px solid var(--primary);">
        <h2 style="color: var(--primary); margin-top: 0;">NAAS Insights Engine</h2>
        <form action="/" method="GET" id="search-form" style="max-width: 900px; margin: 0 auto; text-align: left;">
            <div style="margin-bottom: 20px; position: relative;">
                <label style="font-size: 11px; font-weight: 800; color: #666; text-transform: uppercase;">Journal Name or ISSN</label>
                <input type="text" id="main-search" name="search" autocomplete="off" value="${searchTerm}" placeholder="Search across journals..." style="width: 100%; padding: 16px; border: 2px solid var(--border); border-radius: 8px;">
                <div class="autocomplete-dropdown" id="search-dropdown"></div>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; align-items: end;">
                <div>
                    <label style="font-size: 11px; font-weight: bold;">Min Rating</label>
                    <input type="number" step="0.01" name="min_rating" value="${min}" style="width: 100%; padding: 12px; border: 1px solid var(--border); border-radius: 6px;">
                </div>
                <div>
                    <label style="font-size: 11px; font-weight: bold;">Max Rating</label>
                    <input type="number" step="0.01" name="max_rating" value="${max}" style="width: 100%; padding: 12px; border: 1px solid var(--border); border-radius: 6px;">
                </div>
                <button type="submit" class="btn" style="height: 45px;">SEARCH</button>
            </div>
        </form>
    </div>
    ${isSearchSubmitted ? `
    <div class="card" style="padding: 0;">
        <div class="table-responsive">
            <table>
                <thead>
                    <tr style="background: #f8f9fa;">
                        <th>ISSN</th><th>Journal Title</th><th>Latest</th><th>Avg</th><th>Trend</th><th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${results.map(row => `
                    <tr>
                        <td style="font-family: monospace;">${row.ISSN}</td>
                        <td><strong>${row.Name}</strong></td>
                        <td>${row.latest_score ? row.latest_score.toFixed(2) : 'N/A'}</td>
                        <td>${row.calculated_avg ? row.calculated_avg.toFixed(2) : 'N/A'}</td>
                        <td>${(row.latest_score - row.calculated_avg) > 0 ? '↑' : '↓'}</td>
                        <td><a href="/journal?id=${row.master_id}" class="btn" style="padding:5px 10px; font-size:11px;">📊 Metrics</a></td>
                    </tr>`).join('')}
                </tbody>
            </table>
        </div>
    </div>` : ''}
    <script>
      const inp = document.getElementById('main-search');
      const dd = document.getElementById('search-dropdown');
      if(inp) {
        inp.addEventListener('input', async () => {
          const val = inp.value.trim();
          if(val.length < 2) { dd.style.display = 'none'; return; }
          try {
            const res = await fetch('/?ajax_search=' + encodeURIComponent(val));
            const data = await res.json();
            if(data.length > 0) {
              dd.innerHTML = data.map(item => {
                 const safeName = item.Name.replace(/'/g, "\\\\'");
                 return \`<div class="autocomplete-item" onclick="window.selectJournal('\${safeName}')"><span style="display:block; font-weight:bold; color:var(--primary);">\${item.Name}</span><small style="color:#666;">ISSN: \${item.ISSN}</small></div>\`;
              }).join('');
              dd.style.display = 'block';
            } else { dd.style.display = 'none'; }
          } catch (err) { console.error(err); }
        });
        window.selectJournal = function(val) { inp.value = val; dd.style.display = 'none'; };
        document.addEventListener('click', (e) => { if (e.target !== inp && e.target !== dd) dd.style.display = 'none'; });
      }
    </script>
    `;
}
