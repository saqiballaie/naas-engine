export function renderSearchBody(searchTerm, min, max, latestYear, results, isSearchSubmitted) {
  const safeResults = JSON.stringify(results || []).replace(/</g, '\\u003c').replace(/`/g, '\\`');

  return `
    <style>
        .quick-filters { display: flex; gap: 10px; margin-top: 20px; flex-wrap: wrap; justify-content: center; }
        .filter-chip { background: var(--primary-light); color: var(--primary); padding: 8px 16px; border-radius: 20px; font-size: 13px; font-weight: 600; cursor: pointer; border: 1px solid rgba(0, 86, 179, 0.2); transition: all 0.2s ease; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
        .filter-chip:hover { background: var(--primary); color: white; border-color: var(--primary); transform: translateY(-1px); box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .trust-badge { display: inline-flex; align-items: center; gap: 6px; background: #e8f5e9; color: var(--success); padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; margin-bottom: 20px; border: 1px solid #c3e6cb; }
    </style>

    <div class="card" style="text-align: center; border-top: 5px solid var(--primary); padding-bottom: 35px;">
        <h2 style="color: var(--primary); margin-top: 0; font-size: 28px; margin-bottom: 10px;">NAAS Insights Engine</h2>
        <div class="trust-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            Database Updated: Latest ${latestYear} NAAS Ratings
        </div>

        <form action="/" method="GET" id="search-form" style="max-width: 900px; margin: 0 auto; text-align: left;">
            <div style="margin-bottom: 20px; position: relative;">
                <label style="font-size: 11px; font-weight: 800; color: #666; text-transform: uppercase;">Journal Name or ISSN</label>
                <input type="text" id="main-search" name="search" autocomplete="off" value="${searchTerm}" 
                       placeholder="Search across 3,500+ agricultural & scientific journals..." 
                       style="width: 100%; padding: 16px; border: 2px solid var(--border); border-radius: 8px; font-size: 16px; margin-top: 5px; box-shadow: inset 0 1px 3px rgba(0,0,0,0.03);">
                <div class="autocomplete-dropdown" id="search-dropdown"></div>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; align-items: end;">
                <div class="form-group">
                    <label style="font-size: 11px; font-weight: 800; color: #666; text-transform: uppercase;">Min Rating (${latestYear})</label>
                    <input type="number" step="0.01" name="min_rating" value="${min}" placeholder="e.g. 5.0" style="width: 100%; padding: 14px; border: 1px solid var(--border); border-radius: 6px;">
                </div>
                <div class="form-group">
                    <label style="font-size: 11px; font-weight: 800; color: #666; text-transform: uppercase;">Max Rating (${latestYear})</label>
                    <input type="number" step="0.01" name="max_rating" value="${max}" placeholder="e.g. 10.0" style="width: 100%; padding: 14px; border: 1px solid var(--border); border-radius: 6px;">
                </div>
                <button type="submit" class="btn" style="height: 48px; font-size: 15px; letter-spacing: 0.5px;">SEARCH DATABASE</button>
            </div>

            <div class="quick-filters">
                <span class="filter-chip" onclick="applyQuickFilter(9.0, 20.0)">🔥 Top Tier (9.0+)</span>
                <span class="filter-chip" onclick="applyQuickFilter(8.0, 8.99)">⭐ Gold Standard (8.0 - 8.9)</span>
                <span class="filter-chip" onclick="applyQuickFilter(6.0, 7.99)">📈 Solid Performers (6.0 - 7.9)</span>
            </div>

            ${isSearchSubmitted ? `<div style="text-align: center; margin-top: 20px;"><a href="/" style="font-size: 13px; color: var(--danger); text-decoration: none; font-weight: bold; background: #fff5f5; padding: 6px 12px; border-radius: 4px; border: 1px solid #ffdcdc;">Reset All Filters ✖</a></div>` : ''}
        </form>
    </div>

    <script>
        function applyQuickFilter(minVal, maxVal) {
            document.querySelector('input[name="min_rating"]').value = minVal;
            document.querySelector('input[name="max_rating"]').value = maxVal;
            document.querySelector('input[name="search"]').value = '';
            document.getElementById('search-form').submit();
        }
    </script>

    ${!isSearchSubmitted ? `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-top: 25px;">
            <div class="card" style="margin: 0; border-top: 4px solid var(--success);">
                <h3 style="margin-top: 0; font-size: 18px; color: #333; display: flex; align-items: center; gap: 8px;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--success)" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                    What is this platform?
                </h3>
                <p style="font-size: 14px; color: #555; line-height: 1.6;">
                    The <strong>NAAS Insights Engine</strong> is an advanced analytical tool designed for agricultural researchers, students, and scientists. It goes beyond simple static lists by providing a 10-year longitudinal analysis of National Academy of Agricultural Sciences (NAAS) journal ratings. 
                </p>
                <p style="font-size: 14px; color: #555; line-height: 1.6; margin-bottom: 0;">
                    Our statistical engine calculates momentum, standard deviation, and historical baselines to algorithmically recommend the most stable and impactful venues for your research.
                </p>
            </div>
            <div class="card" style="margin: 0; border-top: 4px solid var(--accent);">
                <h3 style="margin-top: 0; font-size: 18px; color: #333; display: flex; align-items: center; gap: 8px;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                    How to use the engine
                </h3>
                <ul style="font-size: 14px; color: #555; line-height: 1.6; padding-left: 20px; margin-bottom: 0;">
                    <li style="margin-bottom: 10px;"><strong>Search:</strong> Use the smart search bar to find journals by their exact Name or standard ISSN.</li>
                    <li style="margin-bottom: 10px;"><strong>Analyze:</strong> Click the <span style="background: var(--success); color: white; padding: 2px 6px; border-radius: 4px; font-size: 11px;">📊 Analytics</span> button on any result to view its 10-year trajectory, volatility metrics, and publishing recommendations.</li>
                    <li><strong>Compare:</strong> Use the "Compare" tab in the top navigation to pit up to 4 journals against each other to identify the best long-term performer.</li>
                </ul>
            </div>
        </div>
    ` : `
        <div class="card" style="padding: 0; overflow: hidden;">
            <div style="padding: 15px 20px; border-bottom: 1px solid #eee; background: #fafafa; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                <div>
                    <h3 style="margin: 0 0 4px 0; font-size: 18px; color: #333;">Search Results (${results.length})</h3>
                    <div style="font-size: 12px; color: #888;">Sorted by Latest Rating & Momentum</div>
                </div>
                <button onclick="downloadCSV()" class="btn" style="padding: 8px 15px; font-size: 13px; background: var(--success); display: flex; align-items: center; gap: 6px; box-shadow: 0 2px 4px rgba(40,167,69,0.2);">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                    Export Data (CSV)
                </button>
            </div>
            
            <div class="table-responsive">
                <table>
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
                        ${results.length === 0 ? `<tr><td colspan="6" style="text-align:center; padding: 40px; color: #888; font-size: 15px;">No journals found matching your specific criteria. Try broadening your search or resetting the filters.</td></tr>` : 
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
            
            ${results.length >= 150 ? `
            <div style="padding: 15px 20px; background: #fffdf8; border-top: 1px solid #ffecd9; text-align: center; font-size: 13px; color: #d9534f; font-weight: 600;">
                ⚠️ Showing the top 150 matching results. Please use the search bar or filters above to narrow down your selection.
            </div>` : ''}
        </div>
        
        <script>
            function downloadCSV() {
                const data = ${safeResults};
                if (!data || data.length === 0) { alert("No data available to export."); return; }
                
                let csvContent = "ISSN,Journal Title,Latest Score,10-Yr Avg,Data Points\\n";
                data.forEach(row => {
                    const issn = row.ISSN ? row.ISSN.replace(/"/g, '""') : "N/A";
                    const title = row.Name ? '"' + row.Name.replace(/"/g, '""') + '"' : "Unknown";
                    const latest = row.latest_score !== null ? row.latest_score.toFixed(2) : "N/A";
                    const avg = row.calculated_avg !== null ? row.calculated_avg.toFixed(2) : "N/A";
                    const years = row.valid_years || 0;
                    csvContent += \`\${issn},\${title},\${latest},\${avg},\${years}\\n\`;
                });
                
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.setAttribute("href", url);
                link.setAttribute("download", "NAAS_Insights_Export.csv");
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        </script>
    `}
  `;
}

export function renderAnalyticsBody(data) {
  if (!data || !data.ratings || data.ratings.length === 0) {
    return `<div class="card" style="text-align:center; padding: 40px;"><h3>No Rating History Found</h3><p>We do not have historical data for <b>${data.name}</b>.</p><a href="/" class="btn">Back to Search</a></div>`;
  }
  
  const ratings = data.ratings;
  const n = ratings.length;
  const scores = ratings.map(r => r.rating);
  const latestObj = ratings[n - 1];
  const previousObj = n > 1 ? ratings[n - 2] : null;
  const latestVal = latestObj.rating;
  const previousVal = previousObj ? previousObj.rating : null;

  const sum = scores.reduce((a, b) => a + b, 0);
  const avgScore = sum / n;
  const variance = scores.reduce((a, b) => a + Math.pow(b - avgScore, 2), 0) / n;
  const stdDev = Math.sqrt(variance);

  let recentAvg = latestVal;
  let historicalAvg = avgScore;
  if (n >= 4) {
      recentAvg = (scores[n-1] + scores[n-2] + scores[n-3]) / 3;
      const histScores = scores.slice(0, n-3);
      historicalAvg = histScores.reduce((a, b) => a + b, 0) / histScores.length;
  } else if (n === 3) {
      recentAvg = (scores[1] + scores[2]) / 2;
      historicalAvg = scores[0];
  }
  const yoyChange = previousVal !== null ? latestVal - previousVal : 0;

  // TIER-AWARE RECOMMENDATION ENGINE (FIXED)
  let recStatus = "Recommended"; let recColor = "var(--success)"; let recReason = "";
  const isSevereCrash = previousVal !== null && yoyChange < -Math.max(stdDev, 0.5); // Must be a real drop, not just a micro-fluctuation
  const isUnderperforming = recentAvg < avgScore && latestVal < avgScore;

  if (latestVal >= 10.0) {
      // Elite Tier
      if (isSevereCrash) {
          recStatus = "Proceed with Caution"; recColor = "var(--accent)";
          recReason = `Elite-tier journal (NAAS > 10.0), but experienced a severe recent drop in rating. Assess recent quality.`;
      } else {
          recStatus = "Highly Recommended"; recColor = "var(--primary)"; // Primary Blue
          recReason = `Top-tier journal with an exceptional NAAS rating. Excellent and prestigious publishing venue.`;
      }
  } else if (latestVal >= 6.0) {
      // Strong Tier
      if (isSevereCrash || (isUnderperforming && yoyChange < 0)) {
          recStatus = "Proceed with Caution"; recColor = "var(--accent)";
          recReason = `High-quality journal, but statistical trends show recent negative momentum. Monitor trajectory.`;
      } else {
          recStatus = "Recommended"; recColor = "var(--success)";
          recReason = `Strong, high-quality journal maintaining solid ratings and baseline stability.`;
      }
  } else {
      // Standard Tier (Rely heavily on statistics)
      if (isSevereCrash || isUnderperforming) {
          recStatus = "Not Recommended"; recColor = "var(--danger)";
          recReason = `Lower-tier journal exhibiting persistent downward momentum or high volatility. Seek better alternatives.`;
      } else if (recentAvg > avgScore && yoyChange > 0) {
          recStatus = "Recommended"; recColor = "var(--success)";
          recReason = `Developing journal showing strong positive momentum above its historical baseline.`;
      } else {
          recStatus = "Proceed with Caution"; recColor = "var(--accent)";
          recReason = `Journal performance is fluctuating at a lower rating tier. Evaluate carefully before submitting.`;
      }
  }

  const topDeviation = latestVal - avgScore;
  const topDevColor = topDeviation >= 0 ? "var(--success)" : "var(--danger)";
  const topDevSign = topDeviation >= 0 ? "+" : "";

  const chartYears = JSON.stringify(ratings.map(r => r.year));
  const chartValues = JSON.stringify(ratings.map(r => r.rating));
  const avgValues = JSON.stringify(ratings.map(() => avgScore.toFixed(2))); 

  let tableRowsHtml = "";
  for (let i = n - 1; i >= 0; i--) {
      const current = ratings[i]; const prev = i > 0 ? ratings[i - 1] : null;
      const diffFromAvg = current.rating - avgScore; const yoy = prev ? current.rating - prev.rating : 0;
      const avgColor = diffFromAvg >= 0 ? "var(--success)" : "var(--danger)";
      const yoyColor = yoy > 0 ? "var(--success)" : (yoy < 0 ? "var(--danger)" : "#666");

      tableRowsHtml += `
        <tr style="border-bottom: 1px solid #eee; background: ${i === n-1 ? '#fcfdfc' : 'transparent'};">
            <td style="padding: 12px;"><strong>${current.year}</strong> ${i === n-1 ? '<span style="font-size:10px; color:var(--primary); margin-left:5px;">(Latest)</span>' : ''}</td>
            <td style="padding: 12px; text-align: center;"><span style="background: var(--primary); color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;">${current.rating.toFixed(2)}</span></td>
            <td style="padding: 12px; text-align: center; color: ${yoyColor}; font-weight: bold;">${prev ? (yoy > 0 ? '+' : '') + yoy.toFixed(2) : '-'}</td>
            <td style="padding: 12px; text-align: center; color: ${avgColor}; font-weight: bold;">${(diffFromAvg > 0 ? '+' : '') + diffFromAvg.toFixed(2)}</td>
        </tr>`;
  }

  const statusBadge = (condition) => condition ? `<span style="background:var(--success); color:white; padding:2px 6px; border-radius:4px; font-size:11px;">PASS</span>` : `<span style="background:var(--danger); color:white; padding:2px 6px; border-radius:4px; font-size:11px;">FAIL/WARN</span>`;

  return `
    <style>
        .tooltip-icon { display: inline-flex; align-items: center; justify-content: center; width: 14px; height: 14px; border-radius: 50%; background: #e2e8f0; color: #64748b; font-size: 10px; font-weight: bold; cursor: help; margin-left: 4px; border: 1px solid #cbd5e1; }
        .tooltip-container { position: relative; display: inline-flex; align-items: center; }
        .tooltip-container:hover::after { 
            content: attr(data-tooltip); position: absolute; bottom: 120%; left: 50%; transform: translateX(-50%); 
            background: #1e293b; color: #fff; padding: 8px 12px; border-radius: 6px; font-size: 12px; 
            font-weight: normal; white-space: normal; width: 220px; text-align: center; line-height: 1.4;
            z-index: 9999; margin-bottom: 5px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); pointer-events: none; 
        }
        @media (max-width: 768px) {
            .tooltip-container:hover::after { left: auto; right: -20px; transform: none; width: 180px; }
        }
        @media print {
            body { background: white !important; color: black !important; }
            header, footer, .page-title-strip, .btn, .no-print { display: none !important; }
            .card { box-shadow: none !important; border: 1px solid #ccc !important; margin-bottom: 20px !important; page-break-inside: avoid; }
            .container { max-width: 100% !important; margin: 0 !important; padding: 0 !important; }
            canvas { max-width: 100% !important; height: auto !important; }
        }
    </style>

    <div class="no-print" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <a href="/" class="btn" style="background: #6c757d; font-size: 13px;">← Back to Search</a>
        <div style="display: flex; gap: 10px;">
            <button onclick="window.print()" class="btn" style="background: #17a2b8; font-size: 13px;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:5px; vertical-align:-2px;"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg> Save PDF
            </button>
            <a href="/compare?id1=${data.master_id}" class="btn" style="background: var(--accent); font-size: 13px;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:5px; vertical-align:-2px;"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg> Compare Journal
            </a>
        </div>
    </div>

    <div class="card">
        <h2 style="color: var(--primary); margin: 0; font-size: 24px;">${data.name}</h2>
        <div style="display: flex; gap: 10px; margin-top: 15px; align-items: center; flex-wrap: wrap;">
            <div style="background: #f1f3f4; padding: 6px 12px; border-radius: 4px; border: 1px solid #ddd; font-family: monospace; color: #555;">
                ISSN: <b>${data.issn}</b>
            </div>
            <a href="https://www.google.com/search?q=ISSN+${data.issn}" target="_blank" class="btn no-print" style="padding: 6px 15px; font-size: 13px; background: #4285F4; display: flex; align-items: center; gap: 5px;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg> Search Google
            </a>
        </div>
    </div>
    
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; margin-bottom: 25px;">
        <div class="card" style="text-align: center; border-left: 5px solid #6c757d; margin: 0; padding: 20px 10px;">
            <div class="tooltip-container" data-tooltip="The simple average of all available ratings.">
                <small style="text-transform: uppercase; color: #999; font-size: 10px; font-weight: bold;">Historical Average</small>
                <span class="tooltip-icon">?</span>
            </div>
            <div style="font-size: 26px; font-weight: bold; color: #6c757d; line-height: 1.2; margin-top: 5px;">${avgScore.toFixed(2)}</div>
        </div>
        <div class="card" style="text-align: center; border-left: 5px solid var(--primary); margin: 0; padding: 20px 10px;">
            <small style="text-transform: uppercase; color: #999; font-size: 10px; font-weight: bold;">Latest Rating (${latestObj.year})</small>
            <div style="font-size: 26px; font-weight: bold; color: var(--primary); line-height: 1.2; margin-top: 5px;">${latestVal.toFixed(2)}</div>
        </div>
        <div class="card" style="text-align: center; border-left: 5px solid ${topDevColor}; margin: 0; padding: 20px 10px;">
            <small style="text-transform: uppercase; color: #999; font-size: 10px; font-weight: bold;">Deviation from Avg</small>
            <div style="font-size: 26px; font-weight: bold; color: ${topDevColor}; line-height: 1.2; margin-top: 5px;">${topDevSign}${topDeviation.toFixed(2)}</div>
        </div>
        <div class="card" style="text-align: center; border-left: 5px solid ${recColor}; margin: 0; padding: 20px 10px;">
            <small style="text-transform: uppercase; color: #999; font-size: 10px; font-weight: bold;">Recommendation</small>
            <div style="font-size: 18px; font-weight: bold; color: ${recColor}; line-height: 1.2; margin-top: 10px; text-transform: uppercase;">${recStatus}</div>
        </div>
    </div>

    <div class="card">
        <h3 style="margin-top: 0; border-bottom: 2px solid #eee; padding-bottom: 10px;">Performance Trends</h3>
        <div style="height: 350px; width: 100%;"><canvas id="naasChart"></canvas></div>
    </div>
    
    <div class="card" style="padding: 0; overflow: hidden; margin-bottom: 25px;">
        <div style="padding: 15px 20px; border-bottom: 1px solid #eee; background: #fafafa;">
            <h3 style="margin: 0; font-size: 16px;">Historical Data Matrix</h3>
        </div>
        <div class="table-responsive">
            <table>
                <thead>
                    <tr>
                        <th style="padding: 12px; background: #f8f9fa; text-align: left;">Year</th>
                        <th style="padding: 12px; background: #f8f9fa; text-align: center;">NAAS Rating</th>
                        <th style="padding: 12px; background: #f8f9fa; text-align: center;">YoY Change</th>
                        <th style="padding: 12px; background: #f8f9fa; text-align: center;">Deviation from Avg</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRowsHtml}
                </tbody>
                <tfoot>
                    <tr style="background: #eef2f5;">
                        <td style="padding: 12px; text-align: right; font-weight: bold; color: #555;">Historical Average:</td>
                        <td style="padding: 12px; text-align: center; font-weight: bold; color: var(--primary); font-size: 16px;">${avgScore.toFixed(2)}</td>
                        <td colspan="2"></td>
                    </tr>
                </tfoot>
            </table>
        </div>
    </div>

    <div class="card" style="border-left: 5px solid ${recColor}; background: #fffcfc;">
        <h3 style="margin-top: 0; color: #333; font-size: 16px;">Algorithmic Recommendation Details</h3>
        <p style="font-size: 15px; line-height: 1.6; color: #555;">
            On the basis of the NAAS rating analysis of the last 10 years and the current NAAS trajectory, it is 
            <strong style="color: ${recColor}; font-size: 16px; text-transform: uppercase;">${recStatus}</strong> to publish in this journal.
        </p>
        <p style="font-size: 13px; color: #888; margin-bottom: 20px;"><em>Reasoning: ${recReason}</em></p>
        
        <h4 style="margin: 0 0 10px 0; font-size: 13px; color: #444; text-transform: uppercase;">Decision Matrix Calculations</h4>
        <div class="table-responsive" style="border: 1px solid #eee;">
            <table style="font-size: 13px; text-align: left;">
                <thead style="background: #f8f9fa;">
                    <tr>
                        <th style="padding: 8px 12px; border-bottom: 1px solid #ddd;">Evaluation Metric</th>
                        <th style="padding: 8px 12px; border-bottom: 1px solid #ddd;">Calculated Value</th>
                        <th style="padding: 8px 12px; border-bottom: 1px solid #ddd;">Algorithmic Target</th>
                        <th style="padding: 8px 12px; border-bottom: 1px solid #ddd;">Status</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="padding: 8px 12px; border-bottom: 1px solid #eee;"><div class="tooltip-container" data-tooltip="Compares the most recent rating against the overall average.">Long-Term Baseline <span class="tooltip-icon">?</span></div></td>
                        <td style="padding: 8px 12px; border-bottom: 1px solid #eee;">Latest: <b>${latestVal.toFixed(2)}</b></td>
                        <td style="padding: 8px 12px; border-bottom: 1px solid #eee; color: #666;">&ge; Hist. Avg (${avgScore.toFixed(2)})</td>
                        <td style="padding: 8px 12px; border-bottom: 1px solid #eee;">${statusBadge(latestVal >= avgScore)}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 12px; border-bottom: 1px solid #eee;"><div class="tooltip-container" data-tooltip="Average of the last 3 years, showing recent momentum.">Short-Term Momentum <span class="tooltip-icon">?</span></div></td>
                        <td style="padding: 8px 12px; border-bottom: 1px solid #eee;">3-Yr Avg: <b>${recentAvg.toFixed(2)}</b></td>
                        <td style="padding: 8px 12px; border-bottom: 1px solid #eee; color: #666;">&ge; Hist. Avg (${historicalAvg.toFixed(2)})</td>
                        <td style="padding: 8px 12px; border-bottom: 1px solid #eee;">${statusBadge(recentAvg >= historicalAvg)}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 12px; border-bottom: 1px solid #eee;"><div class="tooltip-container" data-tooltip="Standard Deviation. Lower numbers mean a more consistent journal.">Volatility Index (StdDev) <span class="tooltip-icon">?</span></div></td>
                        <td style="padding: 8px 12px; border-bottom: 1px solid #eee;">&sigma; = <b>${stdDev.toFixed(2)}</b></td>
                        <td style="padding: 8px 12px; border-bottom: 1px solid #eee; color: #666;">&lt; 0.30 (Stability)</td>
                        <td style="padding: 8px 12px; border-bottom: 1px solid #eee;">${statusBadge(stdDev < 0.30)}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 12px;"><div class="tooltip-container" data-tooltip="Did the journal drop severely in the last year compared to its normal volatility?">Recent Anomaly (YoY) <span class="tooltip-icon">?</span></div></td>
                        <td style="padding: 8px 12px;">Change: <b>${yoyChange > 0 ? '+':''}${yoyChange.toFixed(2)}</b></td>
                        <td style="padding: 8px 12px; color: #666;">Drop &lt; 0.50 (or 1 StdDev)</td>
                        <td style="padding: 8px 12px;">${statusBadge(yoyChange >= -Math.max(stdDev, 0.5))}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

    <script>
        setTimeout(() => {
            new Chart(document.getElementById('naasChart').getContext('2d'), {
                type: 'line',
                data: {
                    labels: ${chartYears},
                    datasets: [
                        { label: 'NAAS Rating', data: ${chartValues}, borderColor: '#0056b3', backgroundColor: 'rgba(0, 86, 179, 0.05)', fill: true, tension: 0.3, pointRadius: 5, order: 1 },
                        { label: 'Historical Average (${avgScore.toFixed(2)})', data: ${avgValues}, borderColor: '#28a745', borderWidth: 2, borderDash: [5, 5], fill: false, pointRadius: 0, order: 2 }
                    ]
                },
                options: { responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false }, plugins: { tooltip: { enabled: true } } }
            });
        }, 150);
    </script>
  `;
}

export function renderCompareBody(journals) {
    const defaultColors = ['#0056b3', '#ff8c00', '#28a745', '#dc3545']; 
    
    if (journals.length < 2) {
        const preSelectedJs = journals.length === 1 ? `addJournal('${journals[0].master_id}', '${journals[0].name.replace(/'/g, "\\'")}', '${journals[0].issn}');` : '';

        return `
        <div class="card" style="border-top: 5px solid var(--accent); text-align: center; padding-bottom: 40px;">
            <h2 style="color: var(--primary); margin-bottom: 10px;">Compare & Rank Journals</h2>
            <p style="color: #666; font-size: 15px; margin-bottom: 25px;">Select up to 4 journals. Our engine will analyze historical data, calculate momentum, and rank them automatically.</p>
            
            <div style="max-width: 700px; margin: 0 auto; background: #fafafa; padding: 25px; border-radius: 8px; border: 1px solid #eee; text-align: left;">
                <div style="margin-bottom: 20px; position: relative;">
                    <label style="font-size: 12px; font-weight: bold; color: #555;">SEARCH AND ADD JOURNAL</label>
                    <input type="text" id="compare-search" autocomplete="off" placeholder="Type journal name or ISSN..." 
                           style="width: 100%; padding: 14px; border: 2px solid var(--border); border-radius: 6px; font-size: 15px; margin-top: 5px;">
                    <div class="autocomplete-dropdown" id="compare-dropdown"></div>
                </div>

                <div style="margin-bottom: 20px;">
                    <label style="font-size: 12px; font-weight: bold; color: #555;">SELECTED JOURNALS (<span id="sel-count">0</span>/4)</label>
                    <ul id="selected-list" style="list-style: none; padding: 0; margin: 10px 0 0 0; display: flex; flex-direction: column; gap: 10px;"></ul>
                </div>
                
                <form action="/compare" method="GET" id="compare-form" style="margin-top: 25px;">
                    <div id="hidden-inputs"></div>
                    <button type="submit" id="compare-btn" class="btn" style="width: 100%; font-size: 16px; background: var(--accent); opacity: 0.5; pointer-events: none; padding: 14px;">Select at least 2 journals</button>
                </form>
            </div>
        </div>
        <script>
            const cInp = document.getElementById('compare-search');
            const cDd = document.getElementById('compare-dropdown');
            const cList = document.getElementById('selected-list');
            const hInputs = document.getElementById('hidden-inputs');
            const cBtn = document.getElementById('compare-btn');
            const cCount = document.getElementById('sel-count');
            let selected = [];

            function updateUI() {
                cList.innerHTML = ''; hInputs.innerHTML = '';
                selected.forEach((j, idx) => {
                    cList.innerHTML += \`<li style="background: white; border: 1px solid #ddd; padding: 12px 15px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                        <div><strong style="color: var(--primary); font-size: 14px;">\${j.name}</strong> <span style="color: #888; font-size: 12px; margin-left: 10px; font-family: monospace;">ISSN: \${j.issn}</span></div>
                        <button type="button" onclick="removeJournal('\${j.id}')" style="background: var(--danger); color: white; border: none; border-radius: 4px; padding: 5px 10px; cursor: pointer; font-size: 11px; font-weight: bold;">Remove</button>
                    </li>\`;
                    hInputs.innerHTML += \`<input type="hidden" name="id\${idx+1}" value="\${j.id}">\`;
                });
                
                cCount.innerText = selected.length;
                if(selected.length >= 4) { cInp.placeholder = "Maximum 4 journals. Remove one to add another."; cInp.disabled = true; } 
                else { cInp.placeholder = "Type journal name or ISSN..."; cInp.disabled = false; }

                if(selected.length >= 2) { cBtn.style.opacity = '1'; cBtn.style.pointerEvents = 'auto'; cBtn.innerText = 'Analyze & Rank ' + selected.length + ' Journals'; } 
                else { cBtn.style.opacity = '0.5'; cBtn.style.pointerEvents = 'none'; cBtn.innerText = 'Select at least 2 journals'; }
            }

            window.addJournal = function(id, name, issn) {
                if(selected.length >= 4) return;
                if(selected.find(j => j.id === id)) { alert("Journal already added!"); } 
                else { selected.push({id, name, issn}); updateUI(); }
                cInp.value = ''; cDd.style.display = 'none';
            };

            window.removeJournal = function(id) { selected = selected.filter(j => j.id !== id); updateUI(); };

            cInp.addEventListener('input', async () => {
                const val = cInp.value.trim();
                if(val.length < 2) { cDd.style.display = 'none'; return; }
                try {
                    const res = await fetch('/?ajax_search=' + encodeURIComponent(val));
                    const data = await res.json();
                    if(data.length > 0) {
                        cDd.innerHTML = data.map(item => \`<div class="autocomplete-item" onclick="window.addJournal('\${item.master_id}', '\${item.Name.replace(/'/g, "\\\\'")}', '\${item.ISSN}')"><span style="display:block; font-weight:bold; color:var(--primary);">\${item.Name}</span><small style="color:#666;">ISSN: \${item.ISSN}</small></div>\`).join('');
                        cDd.style.display = 'block';
                    } else { cDd.style.display = 'none'; }
                } catch (err) { console.error(err); }
            });
            document.addEventListener('click', (e) => { if (e.target !== cInp && e.target !== cDd) cDd.style.display = 'none'; });
            ${preSelectedJs}
        </script>`;
    }

    const calculateAdvancedStats = (journal, originalIndex) => {
        const ratings = journal.ratings;
        const n = ratings.length;
        if (n === 0) return { ...journal, originalIndex, score: -999, rank: 0, latest: 0, avg: 0 };

        const scores = ratings.map(r => r.rating);
        const latestVal = scores[n - 1];
        const prevVal = n > 1 ? scores[n - 2] : null;
        
        const sum = scores.reduce((a, b) => a + b, 0);
        const avgScore = sum / n;
        const variance = scores.reduce((a, b) => a + Math.pow(b - avgScore, 2), 0) / n;
        const stdDev = Math.sqrt(variance);

        let recentAvg = latestVal; let historicalAvg = avgScore;
        if (n >= 4) {
            recentAvg = (scores[n-1] + scores[n-2] + scores[n-3]) / 3;
            const histScores = scores.slice(0, n-3);
            historicalAvg = histScores.reduce((a, b) => a + b, 0) / histScores.length;
        } else if (n === 3) {
            recentAvg = (scores[1] + scores[2]) / 2; historicalAvg = scores[0];
        }

        const yoyChange = prevVal !== null ? latestVal - prevVal : 0;
        
        // Ranking relies heavily on absolute NAAS score so top tier journals always win
        const compositeScore = (latestVal * 0.60) + (recentAvg * 0.20) + (avgScore * 0.20) - (stdDev * 0.25);

        // TIER-AWARE RECOMMENDATION ENGINE (FIXED)
        let recStatus = "Recommended"; let recColor = "var(--success)";
        const isSevereCrash = prevVal !== null && yoyChange < -Math.max(stdDev, 0.5);
        const isUnderperforming = recentAvg < avgScore && latestVal < avgScore;

        if (latestVal >= 10.0) {
            if (isSevereCrash) { recStatus = "Caution"; recColor = "var(--accent)"; } 
            else { recStatus = "Highly Recommended"; recColor = "var(--primary)"; }
        } else if (latestVal >= 6.0) {
            if (isSevereCrash || (isUnderperforming && yoyChange < 0)) { recStatus = "Caution"; recColor = "var(--accent)"; } 
            else { recStatus = "Recommended"; recColor = "var(--success)"; }
        } else {
            if (isSevereCrash || isUnderperforming) { recStatus = "Not Recommended"; recColor = "var(--danger)"; } 
            else if (recentAvg > avgScore && yoyChange > 0) { recStatus = "Recommended"; recColor = "var(--success)"; } 
            else { recStatus = "Caution"; recColor = "var(--accent)"; }
        }

        return { ...journal, originalIndex, color: defaultColors[originalIndex], latest: latestVal, year: ratings[n-1].year, avg: avgScore, stdDev: stdDev, recentAvg: recentAvg, score: compositeScore, recStatus: recStatus, recColor: recColor };
    };

    let analyzedJournals = journals.map((j, idx) => calculateAdvancedStats(j, idx));
    const sortedByScore = [...analyzedJournals].sort((a, b) => b.score - a.score);
    
    analyzedJournals = analyzedJournals.map(j => {
        const rankIndex = sortedByScore.findIndex(sorted => sorted.master_id === j.master_id);
        j.rank = rankIndex + 1; return j;
    });

    const rankMedals = { 1: '🥇 1st', 2: '🥈 2nd', 3: '🥉 3rd', 4: '4th' };

    let summaryCardsHtml = "";
    sortedByScore.forEach((j) => {
        summaryCardsHtml += `
        <div class="card" style="border-top: 5px solid ${j.color}; margin: 0; padding: 20px; position: relative; display: flex; flex-direction: column;">
            <div style="position: absolute; top: -12px; right: 20px; background: #333; color: gold; padding: 4px 12px; border-radius: 12px; font-weight: bold; font-size: 13px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                ${rankMedals[j.rank]}
            </div>
            <div style="font-size: 11px; font-weight: bold; color: ${j.color}; text-transform: uppercase; margin-bottom: 5px;">Score: ${j.score.toFixed(2)}</div>
            <h3 style="margin: 0 0 10px 0; font-size: 15px; color: #333; line-height: 1.3;">${j.name}</h3>
            <div style="font-family: monospace; font-size: 11px; color: #666; margin-bottom: 15px;">ISSN: ${j.issn}</div>
            
            <div style="margin-bottom: 15px;">
                <span style="background: ${j.recColor}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; text-transform: uppercase;">
                    ${j.recStatus}
                </span>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: auto; padding-top: 15px; border-top: 1px solid #eee;">
                <div><div style="font-size: 9px; color: #999; text-transform: uppercase;">Latest</div><div style="font-size: 16px; font-weight: bold; color: ${j.color};">${j.latest.toFixed(2)}</div></div>
                <div><div style="font-size: 9px; color: #999; text-transform: uppercase;">10-Yr Avg</div><div style="font-size: 16px; font-weight: bold; color: #555;">${j.avg.toFixed(2)}</div></div>
                <div><div style="font-size: 9px; color: #999; text-transform: uppercase;">Momentum (3y)</div><div style="font-size: 14px; font-weight: bold; color: #555;">${j.recentAvg.toFixed(2)}</div></div>
                <div><div style="font-size: 9px; color: #999; text-transform: uppercase;">Volatility (&sigma;)</div><div style="font-size: 14px; font-weight: bold; color: #555;">${j.stdDev.toFixed(2)}</div></div>
            </div>
        </div>`;
    });

    const yearsSet = new Set();
    journals.forEach(j => j.ratings.forEach(r => yearsSet.add(r.year)));
    const allYears = Array.from(yearsSet).sort();

    const getRatingForYear = (ratings, year) => { const found = ratings.find(r => r.year === year); return found ? found.rating : null; };
    const datasetsData = analyzedJournals.map(j => allYears.map(y => getRatingForYear(j.ratings, y)));

    let tableRowsHtml = "";
    for (let i = allYears.length - 1; i >= 0; i--) {
        const year = allYears[i];
        let rowCells = `<td style="padding: 12px; font-weight: bold;">${year}</td>`;
        analyzedJournals.forEach((j, idx) => {
            const val = datasetsData[idx][i];
            rowCells += `<td style="padding: 12px; text-align: center;">${val !== null ? `<span style="background:${j.color}; color:white; padding:4px 8px; border-radius:4px; font-weight:bold;">${val.toFixed(2)}</span>` : '<span style="color:#ccc">N/A</span>'}</td>`;
        });
        tableRowsHtml += `<tr style="border-bottom: 1px solid #eee;">${rowCells}</tr>`;
    }

    let tableHeaders = '<th style="padding: 12px; background: #f8f9fa; text-align: left; width: 80px;">Year</th>';
    analyzedJournals.forEach((j) => { tableHeaders += `<th style="padding: 12px; background: #f8f9fa; text-align: center; color: ${j.color}; font-size: 13px;">${j.issn}<br><span style="font-weight:normal; font-size:10px; color:#666;">Rank ${j.rank}</span></th>`; });

    const datasetsJson = analyzedJournals.map((j, idx) => ({
        label: `[Rank ${j.rank}] ${j.name}`, data: datasetsData[idx], borderColor: j.color, backgroundColor: j.color, fill: false, tension: 0.3, pointRadius: 5, borderWidth: 3
    }));

    return `
    <style>
        .table-responsive { width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; border-radius: 6px; }
        @media print {
            body { background: white !important; color: black !important; }
            header, footer, .page-title-strip, .btn, .no-print { display: none !important; }
            .card { box-shadow: none !important; border: 1px solid #ccc !important; margin-bottom: 20px !important; page-break-inside: avoid; }
            canvas { max-width: 100% !important; height: auto !important; }
        }
    </style>
    
    <div class="no-print" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <a href="/compare" class="btn" style="background: #6c757d; font-size: 13px;">← New Comparison</a>
        <button onclick="window.print()" class="btn" style="background: #17a2b8; font-size: 13px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:5px; vertical-align:-2px;"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg> Save PDF Report
        </button>
    </div>

    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 15px; margin-bottom: 25px;">
        ${summaryCardsHtml}
    </div>

    <div class="card" style="background: #f8f9fa; border: 1px dashed #ccc; padding: 15px 20px; font-size: 12px; color: #555;">
        <strong style="color: #333;">How is the Rank calculated?</strong> The engine uses a tier-aware composite algorithm to find the most robust journal. <br>
        <code style="display: inline-block; margin-top: 5px; background: #fff; padding: 4px 8px; border: 1px solid #ddd; border-radius: 4px;">Score = (Latest Rating × 0.60) + (3-Yr Momentum × 0.20) + (10-Yr Avg × 0.20) - (Volatility Penalty)</code>
    </div>

    <div class="card">
        <h3 style="margin-top: 0; border-bottom: 2px solid #eee; padding-bottom: 10px;">Longitudinal Comparison (Change in NAAS Rating)</h3>
        <div style="height: 450px; width: 100%;"><canvas id="compareChart"></canvas></div>
    </div>

    <div class="card" style="padding: 0; overflow: hidden;">
        <div style="padding: 15px 20px; border-bottom: 1px solid #eee; background: #fafafa;">
            <h3 style="margin: 0; font-size: 16px;">Comparative Data Matrix</h3>
        </div>
        <div class="table-responsive">
            <table style="min-width: ${100 + journals.length * 150}px;">
                <thead><tr>${tableHeaders}</tr></thead>
                <tbody>${tableRowsHtml}</tbody>
            </table>
        </div>
    </div>

    <script>
        setTimeout(() => {
            const ctx = document.getElementById('compareChart').getContext('2d');
            new Chart(ctx, {
                type: 'line',
                data: { labels: ${JSON.stringify(allYears)}, datasets: ${JSON.stringify(datasetsJson)} },
                options: { 
                    responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false },
                    plugins: { tooltip: { enabled: true }, legend: { position: 'top', labels: { usePointStyle: true, padding: 15, font: { size: 11 } } } },
                    scales: { y: { title: { display: true, text: 'NAAS Rating' } } }
                }
            });
        }, 150);
    </script>
    `;
}
