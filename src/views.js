export function renderSearchBody(searchTerm, min, max, latestYear, results, isSearchSubmitted) {
  return `
    <div class="card" style="text-align: center; border-top: 5px solid var(--primary); padding-bottom: 35px;">
        <h2 style="color: var(--primary); margin-top: 0; font-size: 26px;">NAAS Insights Engine</h2>
        <form action="/" method="GET" style="max-width: 900px; margin: 0 auto; text-align: left;">
            <div style="margin-bottom: 20px; position: relative;">
                <label style="font-size: 11px; font-weight: 800; color: #666; text-transform: uppercase;">Journal Name or ISSN</label>
                <input type="text" id="main-search" name="search" autocomplete="off" value="${searchTerm}" 
                       placeholder="Enter journal name or ISSN..." 
                       style="width: 100%; padding: 14px; border: 2px solid var(--border); border-radius: 8px; font-size: 16px; margin-top: 5px;">
                <div class="autocomplete-dropdown" id="search-dropdown"></div>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; align-items: end;">
                <div class="form-group">
                    <label style="font-size: 11px; font-weight: 800; color: #666; text-transform: uppercase;">Min Rating (${latestYear})</label>
                    <input type="number" step="0.01" name="min_rating" value="${min}" placeholder="e.g. 5.0" style="width: 100%; padding: 12px; border: 1px solid var(--border); border-radius: 6px;">
                </div>
                <div class="form-group">
                    <label style="font-size: 11px; font-weight: 800; color: #666; text-transform: uppercase;">Max Rating (${latestYear})</label>
                    <input type="number" step="0.01" name="max_rating" value="${max}" placeholder="e.g. 10.0" style="width: 100%; padding: 12px; border: 1px solid var(--border); border-radius: 6px;">
                </div>
                <button type="submit" class="btn" style="height: 44px; justify-content: center;">SEARCH DATABASE</button>
            </div>
            ${isSearchSubmitted ? `<div style="text-align: right; margin-top: 15px;"><a href="/" style="font-size: 12px; color: #888; text-decoration: none;">Clear Filters</a></div>` : ''}
        </form>
    </div>

    ${isSearchSubmitted ? `
        <div class="card" style="padding: 0; overflow: hidden;">
            <div style="padding: 15px 20px; border-bottom: 1px solid #eee; background: #fafafa; display: flex; justify-content: space-between;">
                <h3 style="margin: 0; font-size: 16px;">Search Results (${results.length})</h3>
                <span style="font-size: 12px; color: #888;">Sorted by Latest Rating</span>
            </div>
            <div style="overflow-x: auto;">
                <table style="min-width: 950px; width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr>
                            <th style="padding: 12px; background: #f8f9fa; text-align: left; width: 120px;">ISSN</th>
                            <th style="padding: 12px; background: #f8f9fa; text-align: left;">Journal Title</th>
                            <th style="padding: 12px; background: #f8f9fa; text-align: center; width: 110px;">Latest (${latestYear})</th>
                            <th style="padding: 12px; background: #f8f9fa; text-align: center; width: 110px;">10-Yr Avg</th>
                            <th style="padding: 12px; background: #f8f9fa; text-align: center; width: 140px;">Trend</th>
                            <th style="padding: 12px; background: #f8f9fa; text-align: center; width: 170px;">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${results.length === 0 ? `<tr><td colspan="6" style="text-align:center; padding: 30px; color: #888;">No journals found matching your criteria.</td></tr>` : 
                        results.map(row => {
                            const latest = row.latest_score !== null ? Number(row.latest_score) : null;
                            const avg = row.calculated_avg !== null ? Number(row.calculated_avg) : null;
                            
                            let trendIcon = "−"; let trendText = "Stable"; let trendClass = "#6c757d";
                            let diffDisplay = "N/A";

                            if (latest !== null && avg !== null) {
                                const diff = latest - avg;
                                diffDisplay = (diff >= 0 ? '+' : '') + diff.toFixed(2);
                                if (diff > 0.05) { trendIcon = "↑"; trendText = "Increasing"; trendClass = "var(--success)"; } 
                                else if (diff < -0.05) { trendIcon = "↓"; trendText = "Decreasing"; trendClass = "var(--danger)"; }
                            }

                            return `
                            <tr style="border-bottom: 1px solid #eee;">
                                <td style="padding: 12px; font-family: monospace; color: #666; font-size: 13px;">${row.ISSN}</td>
                                <td style="padding: 12px;"><strong style="color: #222;">${row.Name}</strong></td>
                                <td style="padding: 12px; text-align: center;">
                                    ${latest !== null ? `<span style="background: var(--primary); color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;">${latest.toFixed(2)}</span>` : '<span style="color:#ccc">N/A</span>'}
                                </td>
                                <td style="padding: 12px; text-align: center; font-weight: bold; color: #444;">
                                    ${avg !== null ? avg.toFixed(2) : 'N/A'}
                                    <div style="font-size: 10px; font-weight: normal; color: #999;">${row.valid_years} data points</div>
                                </td>
                                <td style="padding: 12px; text-align: center; color: ${trendClass}; font-weight: bold; font-size: 13px;">
                                    ${latest !== null && avg !== null ? `${trendIcon} ${trendText}<div style="font-size: 10px; font-weight: normal; opacity: 0.8;">(${diffDisplay} vs Avg)</div>` : '-'}
                                </td>
                                <td style="padding: 12px; text-align: center;">
                                    <div style="display: flex; gap: 6px; justify-content: center;">
                                        <a href="/journal?id=${row.master_id}" class="btn" style="padding: 6px 10px; font-size: 11px; background: var(--success);"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:3px; vertical-align:-2px;"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg> Analytics</a>
                                        <a href="https://www.google.com/search?q=ISSN+${row.ISSN}" target="_blank" class="btn" style="padding: 6px 10px; font-size: 11px; background: #4285F4;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:3px; vertical-align:-2px;"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg> Search</a>
                                    </div>
                                </td>
                            </tr>`;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    ` : ''}`;
}

export function renderAnalyticsBody(data) {
  if (!data || !data.ratings || data.ratings.length === 0) {
    return `<div class="card" style="text-align:center; padding: 40px;"><h3>No Rating History Found</h3><p>We do not have historical data for <b>${data.name}</b>.</p><a href="/" class="btn">Back to Search</a></div>`;
  }
  const ratings = data.ratings;
  const latest = ratings[ratings.length - 1];
  const sum = ratings.reduce((acc, curr) => acc + curr.rating, 0);
  const avgScore = sum / ratings.length;

  return `
    <div class="card">
        <h2 style="color: var(--primary); margin: 0;">${data.name}</h2>
        <div style="margin-top: 10px; display: inline-block; background: #f1f3f4; padding: 4px 10px; border-radius: 4px; border: 1px solid #ddd; font-family: monospace; color: #555;">ISSN: <b>${data.issn}</b></div>
    </div>
    
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 25px;">
        <div class="card" style="text-align: center; border-left: 5px solid var(--success); margin: 0;">
            <small style="text-transform: uppercase; color: #999; font-size: 10px; font-weight: bold;">10-Year Average</small>
            <div style="font-size: 32px; font-weight: bold; color: var(--success);">${avgScore.toFixed(2)}</div>
        </div>
        <div class="card" style="text-align: center; border-left: 5px solid var(--primary); margin: 0;">
            <small style="text-transform: uppercase; color: #999; font-size: 10px; font-weight: bold;">Latest Rating (${latest.year})</small>
            <div style="font-size: 32px; font-weight: bold; color: var(--primary);">${latest.rating.toFixed(2)}</div>
        </div>
    </div>

    <div class="card">
        <h3 style="margin-top: 0; border-bottom: 2px solid #eee; padding-bottom: 10px;">Performance Trends</h3>
        <div style="height: 350px; width: 100%;"><canvas id="naasChart"></canvas></div>
    </div>
    
    <script>
        setTimeout(() => {
            new Chart(document.getElementById('naasChart').getContext('2d'), {
                type: 'line',
                data: {
                    labels: ${JSON.stringify(ratings.map(r => r.year))},
                    datasets: [{ label: 'NAAS Rating', data: ${JSON.stringify(ratings.map(r => r.rating))}, borderColor: '#0056b3', backgroundColor: 'rgba(0, 86, 179, 0.05)', fill: true, tension: 0.3, pointRadius: 5 }]
                },
                options: { responsive: true, maintainAspectRatio: false }
            });
        }, 100);
    </script>
  `;
}
