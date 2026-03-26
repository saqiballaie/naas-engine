/**
 * Renders the Beautiful Search Results Body
 */
export function renderSearchBody(searchTerm, min, max, latestYear, results) {
  const isSearchSubmitted = searchTerm || min || max;

  return `
    <div class="card" style="text-align: center; border-top: 5px solid var(--primary); padding-bottom: 40px;">
        <h2 style="color: var(--primary); margin-top: 0; font-size: 28px;">NAAS Insights Engine</h2>
        <p style="color: var(--text-muted); font-size: 15px; margin-bottom: 30px;">
            Search agricultural and scientific journals by Name, ISSN, or Rating Range.
        </p>

        <form action="/" method="GET" style="max-width: 900px; margin: 0 auto; text-align: left;">
            <div style="margin-bottom: 20px; position: relative;">
                <label style="font-size: 11px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Journal Name or ISSN</label>
                <input type="text" id="main-search" name="search" autocomplete="off" value="${searchTerm}" 
                       placeholder="Enter journal name or ISSN..." 
                       style="width: 100%; padding: 16px; border: 2px solid var(--border); border-radius: 10px; font-size: 16px; margin-top:6px; box-shadow: inset 0 1px 2px rgba(0,0,0,0.05);">
                <div class="autocomplete-dropdown" id="search-dropdown"></div>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; align-items: end;">
                <div class="form-group">
                    <label>Min Rating (${latestYear})</label>
                    <input type="number" step="0.01" name="min_rating" value="${min}" placeholder="5.0">
                </div>
                <div class="form-group">
                    <label>Max Rating (${latestYear})</label>
                    <input type="number" step="0.01" name="max_rating" value="${max}" placeholder="10.0">
                </div>
                <button type="submit" class="btn" style="height: 48px; font-size: 15px; letter-spacing: 0.5px;">SEARCH DATABASE</button>
            </div>
        </form>
    </div>

    ${isSearchSubmitted ? `
        <div class="card" style="padding: 0; overflow: hidden;">
            <div style="padding: 20px 25px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; background: #fafafa;">
                <h3 style="margin: 0; font-size: 18px; color: #444;">Search Results (${results.length})</h3>
                <span style="font-size: 12px; color: #888; font-style: italic;">Sorted by Latest Rating</span>
            </div>
            
            <div class="table-wrapper" style="overflow-x: auto; -webkit-overflow-scrolling: touch;">
                <table style="min-width: 1000px;">
                    <thead>
                        <tr>
                            <th style="width: 130px;">ISSN</th>
                            <th>Journal Title</th>
                            <th style="text-align: center; width: 120px;">Latest (${latestYear})</th>
                            <th style="text-align: center; width: 120px;">10-Yr Avg</th>
                            <th style="text-align: center; width: 160px;">Trend</th>
                            <th style="text-align: center; width: 180px;">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${results.map(row => {
                            const latest = row.latest_score || 0;
                            const avg = row.calculated_avg || 0;
                            const diff = latest - avg;
                            
                            let trendIcon = "−";
                            let trendText = "Stable";
                            let trendClass = "#6c757d"; // Gray
                            
                            if (diff > 0.05) { 
                                trendIcon = "↑"; trendText = "Increasing"; trendClass = "var(--success)"; 
                            } else if (diff < -0.05) { 
                                trendIcon = "↓"; trendText = "Decreasing"; trendClass = "var(--danger)"; 
                            }

                            return `
                            <tr>
                                <td style="font-family: 'Roboto Mono', monospace; font-size: 13px; color: #666;">${row.ISSN}</td>
                                <td><strong style="color: #222;">${row.Name}</strong></td>
                                <td style="text-align: center;">
                                    <span class="rating-badge" style="background: var(--primary); color: #fff; padding: 5px 10px; min-width: 45px; display: inline-block;">
                                        ${latest ? latest.toFixed(2) : 'N/A'}
                                    </span>
                                </td>
                                <td style="text-align: center; font-weight: 600; color: #444;">
                                    ${avg ? avg.toFixed(2) : 'N/A'}
                                    <small style="display:block; font-weight: 400; color: #999; font-size: 10px;">${row.valid_years} data points</small>
                                </td>
                                <td style="text-align: center;">
                                    <div style="color: ${trendClass}; font-weight: bold; font-size: 13px;">
                                        ${trendIcon} ${trendText}
                                        <div style="font-size: 10px; font-weight: 400; opacity: 0.8;">
                                            (${diff >= 0 ? '+' : ''}${diff.toFixed(2)} vs Avg)
                                        </div>
                                    </div>
                                </td>
                                <td style="text-align: center;">
                                    <div style="display: flex; gap: 8px; justify-content: center;">
                                        <a href="/journal?id=${row.master_id}" class="btn" style="padding: 7px 12px; font-size: 11px; background: var(--success);" title="View Analytics">
                                            📊 Analytics
                                        </a>
                                        <a href="https://www.google.com/search?q=ISSN+${row.ISSN}" target="_blank" class="btn" style="padding: 7px 12px; font-size: 11px; background: #4285F4;" title="Search Google">
                                            🔍 Google
                                        </a>
                                    </div>
                                </td>
                            </tr>`;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    ` : ''}
  `;
}

/**
 * Renders the Analytics Dashboard Body (Reference)
 */
export function renderAnalyticsBody(data) {
    // [Keep your existing renderAnalyticsBody code here]
}
