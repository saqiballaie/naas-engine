/**
 * Renders the Home/Search Page Body
 */
export function renderSearchBody(searchTerm, min, max, latestYear, results) {
  const isSearchSubmitted = searchTerm || min || max;

  return `
    <div class="card" style="text-align: center; border-top: 5px solid var(--primary);">
        <h2 style="color: var(--primary); margin-top: 0; font-size: 28px;">NAAS Insights Engine</h2>
        <p style="color: var(--text-muted); font-size: 16px; margin-bottom: 30px;">
            Search the comprehensive database of agricultural journals by Name, ISSN, or Rating Range.
        </p>

        <form action="/" method="GET" style="max-width: 800px; margin: 0 auto; text-align: left;">
            <div style="margin-bottom: 15px; position: relative;">
                <label style="font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Journal Name or ISSN</label>
                <input type="text" id="main-search" name="search" autocomplete="off" value="${searchTerm}" 
                       placeholder="Type Journal Name or ISSN..." style="width: 100%; padding: 15px; border: 1px solid var(--border); border-radius: 8px; font-size: 16px; margin-top:5px;">
                <div class="autocomplete-dropdown" id="search-dropdown"></div>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; align-items: end;">
                <div class="form-group">
                    <label>Min Rating (${latestYear})</label>
                    <input type="number" step="0.01" name="min_rating" value="${min}" placeholder="e.g. 5.0">
                </div>
                <div class="form-group">
                    <label>Max Rating (${latestYear})</label>
                    <input type="number" step="0.01" name="max_rating" value="${max}" placeholder="e.g. 10.0">
                </div>
                <button type="submit" class="btn" style="height: 46px;">Search Database</button>
            </div>
            
            ${isSearchSubmitted ? `<div style="text-align: right; margin-top: 15px;"><a href="/" style="font-size: 12px; color: var(--text-muted);">Clear All Filters</a></div>` : ''}
        </form>
    </div>

    ${isSearchSubmitted ? `
        <div class="card">
            <h3 style="margin-top: 0; border-bottom: 2px solid #eee; padding-bottom: 10px;">Search Results</h3>
            <div style="margin-bottom: 15px; font-size: 14px; color: var(--text-muted);">
                Showing <strong>${results.length}</strong> result(s). Sorted by Latest Rating.
            </div>
            <div class="table-wrapper" style="overflow-x: auto;">
                <table>
                    <thead>
                        <tr>
                            <th>Journal Name</th>
                            <th>ISSN</th>
                            <th style="text-align: center; background-color: #f0fdf4;">10-Yr Avg</th>
                            <th style="text-align: center;">Rating (${latestYear})</th>
                            <th style="text-align: center;">Analytics</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${results.map(row => `
                            <tr>
                                <td><strong>${row.Name}</strong></td>
                                <td style="font-family: monospace; color: var(--text-muted);">${row.ISSN}</td>
                                <td style="text-align: center; font-weight: bold; color: var(--success); background-color: #fcfdfc;">
                                    ${row.calculated_avg ? row.calculated_avg.toFixed(2) : 'N/A'}
                                    <span style="font-size: 10px; color: #999; display: block; font-weight: normal;">(${row.valid_years} yrs)</span>
                                </td>
                                <td style="text-align: center;">
                                    ${row.latest_score ? `<span class="rating-badge">${row.latest_score.toFixed(2)}</span>` : '<span style="color:#ccc">N/A</span>'}
                                </td>
                                <td style="text-align: center;">
                                    <a href="/journal?id=${row.master_id}" class="btn" style="padding: 6px 12px; font-size: 12px; background-color: var(--accent);">View Trends</a>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    ` : ''}
  `;
}

/**
 * Renders the Analytics Dashboard Body
 */
export function renderAnalyticsBody(data) {
  const ratings = data.ratings;
  const sum = ratings.reduce((acc, curr) => acc + curr.rating, 0);
  const avgScore = ratings.length > 0 ? (sum / ratings.length) : 0;
  const latestRating = ratings.length > 0 ? ratings[ratings.length - 1].rating : null;
  const latestYear = ratings.length > 0 ? ratings[ratings.length - 1].year : 'N/A';

  // Calculate Trend
  let trend = "Stable", trendColor = "var(--primary)";
  if (latestRating > avgScore) { trend = "↑ Above Average"; trendColor = "var(--success)"; }
  else if (latestRating < avgScore) { trend = "↓ Below Average"; trendColor = "var(--danger)"; }

  const chartYears = JSON.stringify(ratings.map(r => r.year));
  const chartValues = JSON.stringify(ratings.map(r => r.rating));

  return `
    <div class="card">
        <h2 style="color: var(--primary); margin: 0;">${data.name}</h2>
        <div style="display: flex; gap: 10px; margin-top: 15px;">
            <span style="font-family: monospace; background: #f8f9fa; padding: 5px 10px; border: 1px solid #ddd; border-radius: 4px;">ISSN: ${data.issn}</span>
        </div>
    </div>

    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 25px;">
        <div class="card" style="text-align: center; border-left: 5px solid var(--success); margin: 0;">
            <small style="text-transform: uppercase; color: #666; font-size: 10px; font-weight: bold;">10-Year Average</small>
            <div style="font-size: 28px; font-weight: bold; color: var(--success);">${avgScore.toFixed(2)}</div>
        </div>
        <div class="card" style="text-align: center; border-left: 5px solid var(--primary); margin: 0;">
            <small style="text-transform: uppercase; color: #666; font-size: 10px; font-weight: bold;">Latest Rating (${latestYear})</small>
            <div style="font-size: 28px; font-weight: bold; color: var(--primary);">${latestRating ? latestRating.toFixed(2) : 'N/A'}</div>
        </div>
        <div class="card" style="text-align: center; border-left: 5px solid ${trendColor}; margin: 0;">
            <small style="text-transform: uppercase; color: #666; font-size: 10px; font-weight: bold;">Trajectory</small>
            <div style="font-size: 18px; font-weight: bold; color: ${trendColor}; margin-top: 8px;">${trend}</div>
        </div>
    </div>

    <div class="card">
        <h3 style="margin-top: 0; border-bottom: 2px solid #eee; padding-bottom: 10px;">Performance Trends</h3>
        <div style="height: 350px;"><canvas id="naasChart"></canvas></div>
    </div>

    <div class="card">
        <h3 style="margin-top: 0; border-bottom: 2px solid #eee; padding-bottom: 10px;">Data Matrix</h3>
        <table>
            <thead><tr><th>Year</th><th style="text-align: center;">NAAS Score</th><th style="text-align: center;">Deviation</th></tr></thead>
            <tbody>
                ${[...ratings].reverse().map(r => {
                    const diff = r.rating - avgScore;
                    return `
                    <tr>
                        <td><strong>${r.year}</strong></td>
                        <td style="text-align: center;"><span class="rating-badge">${r.rating.toFixed(2)}</span></td>
                        <td style="text-align: center; font-weight: bold; color: ${diff >= 0 ? 'var(--success)' : 'var(--danger)'}">
                            ${diff >= 0 ? '+' : ''}${diff.toFixed(2)}
                        </td>
                    </tr>`;
                }).join('')}
            </tbody>
        </table>
    </div>

    <script>
        const ctx = document.getElementById('naasChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ${chartYears},
                datasets: [{
                    label: 'Annual Rating',
                    data: ${chartValues},
                    borderColor: '#0056b3',
                    backgroundColor: 'rgba(0, 86, 179, 0.05)',
                    fill: true,
                    tension: 0.3,
                    pointRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: { y: { beginAtZero: false, title: { display: true, text: 'Rating' } } }
            }
        });
    </script>
  `;
}
