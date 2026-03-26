export function renderSearchBody(searchTerm, min, max, latestYear, results) {
  const submitted = searchTerm || min || max;
  return `
    <div class="card" style="text-align: center; border-top: 5px solid var(--primary);">
        <h2>NAAS Insights Engine</h2>
        <form action="/" method="GET" style="text-align: left; position: relative; max-width: 800px; margin: auto;">
            <label style="font-size: 12px; font-weight: bold; color: #666;">JOURNAL NAME OR ISSN</label>
            <input type="text" id="main-search" name="search" value="${searchTerm}" autocomplete="off" placeholder="Type Journal Name...">
            <div id="search-dropdown" class="autocomplete-dropdown"></div>
            <div style="display: grid; grid-template-columns: 1fr 1fr auto; gap: 15px; margin-top: 15px; align-items: end;">
                <div><label>Min Rating</label><input type="number" step="0.01" name="min_rating" value="${min}"></div>
                <div><label>Max Rating</label><input type="number" step="0.01" name="max_rating" value="${max}"></div>
                <button type="submit" class="btn">Search</button>
            </div>
        </form>
    </div>
    ${submitted ? `
        <div class="card" style="padding: 0; overflow: hidden;">
            <div style="overflow-x: auto;">
                <table>
                    <thead><tr><th>ISSN</th><th>Journal Title</th><th style="text-align:center">Latest</th><th style="text-align:center">Avg</th><th style="text-align:center">Trend</th><th style="text-align:center">Action</th></tr></thead>
                    <tbody>${results.map(r => {
                        const diff = (r.latest_score || 0) - (r.calculated_avg || 0);
                        const trendColor = diff > 0.05 ? 'var(--success)' : (diff < -0.05 ? 'var(--danger)' : '#666');
                        return `<tr>
                            <td style="font-family: monospace;">${r.ISSN}</td>
                            <td><b>${r.Name}</b></td>
                            <td style="text-align:center"><span class="rating-badge">${r.latest_score ? r.latest_score.toFixed(2) : 'N/A'}</span></td>
                            <td style="text-align:center">${r.calculated_avg ? r.calculated_avg.toFixed(2) : 'N/A'}</td>
                            <td style="text-align:center; color:${trendColor}; font-weight:bold;">${diff > 0.05 ? '↑' : (diff < -0.05 ? '↓' : '−')}</td>
                            <td style="text-align:center;">
                                <a href="/journal?id=${r.master_id}" class="btn" style="padding:5px 10px; font-size:11px; background:var(--success)">📊 Metrics</a>
                                <a href="https://google.com/search?q=ISSN+${r.ISSN}" target="_blank" class="btn" style="padding:5px 10px; font-size:11px; background:#4285F4">🔍 Google</a>
                            </td>
                        </tr>`;
                    }).join('')}</tbody>
                </table>
            </div>
        </div>` : ''}`;
}

export function renderAnalyticsBody(data) {
  const ratings = data.ratings || [];
  const latest = ratings.length > 0 ? ratings[ratings.length - 1] : { rating: 0, year: 'N/A' };
  return `
    <div class="card"><h2>${data.name}</h2><p>ISSN: <b>${data.issn}</b></p></div>
    <div class="card"><canvas id="naasChart" style="height:350px;"></canvas></div>
    <script>
        new Chart(document.getElementById('naasChart').getContext('2d'), {
            type: 'line',
            data: { 
                labels: ${JSON.stringify(ratings.map(r => r.year))}, 
                datasets: [{ label: 'NAAS Rating', data: ${JSON.stringify(ratings.map(r => r.rating))}, borderColor: '#0056b3', fill: true, backgroundColor: 'rgba(0,86,179,0.05)', tension: 0.3 }] 
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    </script>`;
}
