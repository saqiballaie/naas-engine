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
            
            <div style="overflow-x: auto;">
                <table style="min-width: 900px; width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr>
                            <th style="padding: 12px; background: #f8f9fa; text-align: left; width: 120px;">ISSN</th>
                            <th style="padding: 12px; background: #f8f9fa; text-align: left;">Journal Title</th>
                            <th style="padding: 12px; background: #f8f9fa; text-align: center; width: 100px;">Latest (${latestYear})</th>
                            <th style="padding: 12px; background: #f8f9fa; text-align: center; width: 100px;">10-Yr Avg</th>
                            <th style="padding: 12px; background: #f8f9fa; text-align: center; width: 140px;">Trend</th>
                            <th style="padding: 12px; background: #f8f9fa; text-align: center; width: 170px;">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${results.length === 0 ? `<tr><td colspan="6" style="text-align:center; padding: 40px; color: #888; font-size: 15px;">No journals found.</td></tr>` : 
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
                                    ${latest !== null && avg !== null ? `${trendIcon} ${trendText}<div style="font-size: 10px; font-weight: normal; opacity: 0.8;">(${diffDisplay})</div>` : '-'}
                                </td>
                                <td style="padding: 12px; text-align: center;">
                                    <div style="display: flex; gap: 6px; justify-content: center;">
                                        <a href="/journal?id=${row.master_id}" class="btn" style="padding: 6px 10px; font-size: 11px; background: var(--success);">📊 Metrics</a>
                                        <a href="https://www.google.com/search?q=ISSN+${row.ISSN}" target="_blank" class="btn" style="padding: 6px 10px; font-size: 11px; background: #4285F4;">🔍 Search</a>
                                    </div>
                                </td>
                            </tr>`;
                        }).join('')}
                    </tbody>
                </table>
            </div>
            
            ${results.length >= 150 ? `<div style="padding: 15px 20px; background: #fffdf8; text-align: center; font-size: 13px; color: #d9534f;">⚠️ Showing top 150 matching results.</div>` : ''}
        </div>
        
        <script>
            function downloadCSV() {
                const data = ${safeResults};
                if (!data || data.length === 0) return;
                let csvContent = "ISSN,Journal Title,Latest Score,10-Yr Avg,Data Points\\n";
                data.forEach(row => {
                    const title = row.Name ? '"' + row.Name.replace(/"/g, '""') + '"' : "Unknown";
                    csvContent += \`\${row.ISSN},\${title},\${row.latest_score},\${row.calculated_avg},\${row.valid_years}\\n\`;
                });
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.setAttribute("href", url);
                link.setAttribute("download", "NAAS_Insights_Export.csv");
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        </script>
    `}
  `;
}

// ... Rest of the analytics and compare code remains exactly the same as previous stable version ...
// I am including the fixed analytics and compare functions from the previous working step below:

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

  let recStatus = "Recommended"; let recColor = "var(--success)"; let recReason = "";
  const isSevereCrash = previousVal !== null && yoyChange < -Math.max(stdDev, 0.5);
  const isUnderperforming = recentAvg < avgScore && latestVal < avgScore;

  if (latestVal >= 10.0) {
      if (isSevereCrash) { recStatus = "Proceed with Caution"; recColor = "var(--accent)"; recReason = "Elite tier but severe drop."; } 
      else { recStatus = "Highly Recommended"; recColor = "var(--primary)"; recReason = "Exceptional NAAS rating."; }
  } else if (latestVal >= 6.0) {
      if (isSevereCrash || (isUnderperforming && yoyChange < 0)) { recStatus = "Proceed with Caution"; recColor = "var(--accent)"; recReason = "Strong tier but declining momentum."; } 
      else { recStatus = "Recommended"; recColor = "var(--success)"; recReason = "Solid quality and stability."; }
  } else {
      if (isSevereCrash || isUnderperforming) { recStatus = "Not Recommended"; recColor = "var(--danger)"; recReason = "Declining trajectory in lower tier."; } 
      else if (recentAvg > avgScore && yoyChange > 0) { recStatus = "Recommended"; recColor = "var(--success)"; recReason = "Strong positive momentum."; } 
      else { recStatus = "Proceed with Caution"; recColor = "var(--accent)"; recReason = "Fluctuating performance."; }
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
            <td style="padding: 12px;"><strong>${current.year}</strong></td>
            <td style="padding: 12px; text-align: center;"><span style="background: var(--primary); color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;">${current.rating.toFixed(2)}</span></td>
            <td style="padding: 12px; text-align: center; color: ${yoyColor}; font-weight: bold;">${prev ? (yoy > 0 ? '+' : '') + yoy.toFixed(2) : '-'}</td>
            <td style="padding: 12px; text-align: center; color: ${avgColor}; font-weight: bold;">${(diffFromAvg > 0 ? '+' : '') + diffFromAvg.toFixed(2)}</td>
        </tr>`;
  }

  return `
    <style>
        .tooltip-icon { display: inline-flex; align-items: center; justify-content: center; width: 14px; height: 14px; border-radius: 50%; background: #e2e8f0; color: #64748b; font-size: 10px; font-weight: bold; cursor: help; margin-left: 4px; border: 1px solid #cbd5e1; }
        .tooltip-container { position: relative; display: inline-flex; align-items: center; }
        .tooltip-container:hover::after { content: attr(data-tooltip); position: absolute; bottom: 120%; left: 50%; transform: translateX(-50%); background: #1e293b; color: #fff; padding: 8px 12px; border-radius: 6px; font-size: 12px; white-space: normal; width: 200px; text-align: center; z-index: 99; }
    </style>
    <div class="no-print" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <a href="/" class="btn" style="background: #6c757d; font-size: 13px;">← Back</a>
        <div style="display: flex; gap: 10px;">
            <button onclick="window.print()" class="btn" style="background: #17a2b8; font-size: 13px;">Save PDF</button>
            <a href="/compare?id1=${data.master_id}" class="btn" style="background: var(--accent); font-size: 13px;">Compare</a>
        </div>
    </div>
    <div class="card">
        <h2 style="color: var(--primary); margin: 0;">${data.name}</h2>
        <p style="margin: 10px 0 0; color: #666; font-family: monospace;">ISSN: ${data.issn}</p>
    </div>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; margin-bottom: 25px;">
        <div class="card" style="text-align: center; border-left: 5px solid #6c757d; margin: 0; padding: 15px;">
            <small style="text-transform: uppercase; color: #999; font-size: 10px; font-weight: bold;">Avg Rating</small>
            <div style="font-size: 24px; font-weight: bold;">${avgScore.toFixed(2)}</div>
        </div>
        <div class="card" style="text-align: center; border-left: 5px solid var(--primary); margin: 0; padding: 15px;">
            <small style="text-transform: uppercase; color: #999; font-size: 10px; font-weight: bold;">Latest (${latestObj.year})</small>
            <div style="font-size: 24px; font-weight: bold; color: var(--primary);">${latestVal.toFixed(2)}</div>
        </div>
        <div class="card" style="text-align: center; border-left: 5px solid ${topDevColor}; margin: 0; padding: 15px;">
            <small style="text-transform: uppercase; color: #999; font-size: 10px; font-weight: bold;">Deviation</small>
            <div style="font-size: 24px; font-weight: bold; color: ${topDevColor};">${topDevSign}${topDeviation.toFixed(2)}</div>
        </div>
        <div class="card" style="text-align: center; border-left: 5px solid ${recColor}; margin: 0; padding: 15px;">
            <small style="text-transform: uppercase; color: #999; font-size: 10px; font-weight: bold;">Verdict</small>
            <div style="font-size: 14px; font-weight: bold; color: ${recColor}; margin-top: 5px;">${recStatus}</div>
        </div>
    </div>
    <div class="card">
        <h3 style="margin: 0 0 15px 0;">Performance Trends</h3>
        <div style="height: 300px;"><canvas id="naasChart"></canvas></div>
    </div>
    <div class="card" style="padding: 0; overflow: hidden; margin-bottom: 25px;">
        <div class="table-responsive">
            <table style="width: 100%;">
                <thead>
                    <tr><th style="padding: 12px; background: #f8f9fa; text-align: left;">Year</th><th style="text-align: center; background: #f8f9fa;">Rating</th><th style="text-align: center; background: #f8f9fa;">YoY</th><th style="text-align: center; background: #f8f9fa;">Dev</th></tr>
                </thead>
                <tbody>${tableRowsHtml}</tbody>
            </table>
        </div>
    </div>
    <div class="card" style="border-left: 5px solid ${recColor};">
        <h4 style="margin: 0 0 10px 0;">Algorithmic Recommendation</h4>
        <p style="margin: 0; font-size: 14px;">${recReason}</p>
    </div>
    <script>
        setTimeout(() => {
            new Chart(document.getElementById('naasChart').getContext('2d'), {
                type: 'line',
                data: {
                    labels: ${chartYears},
                    datasets: [
                        { label: 'Rating', data: ${chartValues}, borderColor: '#0056b3', tension: 0.3, fill: false },
                        { label: 'Average', data: ${avgValues}, borderColor: '#28a745', borderDash: [5,5], pointRadius: 0, fill: false }
                    ]
                },
                options: { responsive: true, maintainAspectRatio: false }
            });
        }, 150);
    </script>
  `;
}

export function renderCompareBody(journals) {
    const colors = ['#0056b3', '#ff8c00', '#28a745', '#dc3545'];
    if (journals.length < 2) {
        return `<div class="card" style="text-align: center; padding: 40px;"><h3>Select journals to compare.</h3><a href="/" class="btn" style="margin-top: 20px;">Back to Search</a></div>`;
    }

    const calculateAdvancedStats = (journal, idx) => {
        const ratings = journal.ratings;
        const scores = ratings.map(r => r.rating);
        const latestVal = scores[ratings.length - 1];
        const sum = scores.reduce((a, b) => a + b, 0);
        const avgScore = sum / ratings.length;
        const variance = scores.reduce((a, b) => a + Math.pow(b - avgScore, 2), 0) / ratings.length;
        const stdDev = Math.sqrt(variance);
        const score = (latestVal * 0.6) + (avgScore * 0.4) - (stdDev * 0.2);
        return { ...journal, latest: latestVal, avg: avgScore, stdDev, score, color: colors[idx] };
    };

    let analyzed = journals.map((j, i) => calculateAdvancedStats(j, i)).sort((a, b) => b.score - a.score);
    const yearsSet = new Set();
    journals.forEach(j => j.ratings.forEach(r => yearsSet.add(r.year)));
    const allYears = Array.from(yearsSet).sort();

    const datasets = analyzed.map(j => ({
        label: j.name,
        data: allYears.map(y => { const r = j.ratings.find(rt => rt.year === y); return r ? r.rating : null; }),
        borderColor: j.color, fill: false, tension: 0.3
    }));

    return `
    <div class="no-print" style="margin-bottom: 20px;"><a href="/" class="btn" style="background: #6c757d;">← Back</a></div>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 25px;">
        ${analyzed.map((j, i) => `
            <div class="card" style="border-top: 4px solid ${j.color}; padding: 15px; margin: 0;">
                <div style="font-size: 10px; font-weight: bold; color: #999;">RANK ${i+1}</div>
                <h4 style="margin: 5px 0; font-size: 14px;">${j.name}</h4>
                <div style="font-size: 18px; font-weight: bold; color: ${j.color};">${j.latest.toFixed(2)}</div>
                <div style="font-size: 11px; color: #666;">Avg: ${j.avg.toFixed(2)}</div>
            </div>
        `).join('')}
    </div>
    <div class="card"><div style="height: 400px;"><canvas id="compareChart"></canvas></div></div>
    <script>
        setTimeout(() => {
            new Chart(document.getElementById('compareChart').getContext('2d'), {
                type: 'line',
                data: { labels: ${JSON.stringify(allYears)}, datasets: ${JSON.stringify(datasets)} },
                options: { responsive: true, maintainAspectRatio: false }
            });
        }, 150);
    </script>
    `;
}
