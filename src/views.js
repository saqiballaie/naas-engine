export function renderSearchBody(searchTerm, min, max, latestYear, results, isSearchSubmitted) {
  const safeResults = JSON.stringify(results || []).replace(/</g, '\\u003c').replace(/`/g, '\\`');

  return `
    <style>
        .quick-filters { display: flex; gap: 10px; margin-top: 20px; flex-wrap: wrap; justify-content: center; }
        .filter-chip { background: var(--primary-light); color: var(--primary); padding: 8px 16px; border-radius: 20px; font-size: 13px; font-weight: 600; cursor: pointer; border: 1px solid rgba(0, 86, 179, 0.2); transition: all 0.2s ease; }
        .filter-chip:hover { background: var(--primary); color: white; border-color: var(--primary); }
        .trust-badge { display: inline-flex; align-items: center; gap: 6px; background: #e8f5e9; color: var(--success); padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; margin-bottom: 20px; border: 1px solid #c3e6cb; }
    </style>

    <div class="card" style="text-align: center; border-top: 5px solid var(--primary); padding-bottom: 35px;">
        <h2 style="color: var(--primary); margin-top: 0; font-size: 28px; margin-bottom: 10px;">NAAS Insights Engine</h2>
        <div class="trust-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
            Database Updated: Latest ${latestYear} NAAS Ratings
        </div>

        <form action="/" method="GET" id="search-form" style="max-width: 900px; margin: 0 auto; text-align: left;">
            <div style="margin-bottom: 20px; position: relative;">
                <label style="font-size: 11px; font-weight: 800; color: #666; text-transform: uppercase;">Journal Name or ISSN</label>
                <input type="text" id="main-search" name="search" autocomplete="off" value="${searchTerm}" 
                       placeholder="Search across 3,500+ journals..." 
                       style="width: 100%; padding: 16px; border: 2px solid var(--border); border-radius: 8px; font-size: 16px; margin-top: 5px;">
                <div class="autocomplete-dropdown" id="search-dropdown"></div>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; align-items: end;">
                <div class="form-group">
                    <label style="font-size: 11px; font-weight: 800; color: #666; text-transform: uppercase;">Min Rating (${latestYear})</label>
                    <input type="number" step="0.01" name="min_rating" value="${min}" style="width: 100%; padding: 14px; border: 1px solid var(--border); border-radius: 6px;">
                </div>
                <div class="form-group">
                    <label style="font-size: 11px; font-weight: 800; color: #666; text-transform: uppercase;">Max Rating (${latestYear})</label>
                    <input type="number" step="0.01" name="max_rating" value="${max}" style="width: 100%; padding: 14px; border: 1px solid var(--border); border-radius: 6px;">
                </div>
                <button type="submit" class="btn" style="height: 48px;">SEARCH</button>
            </div>

            <div class="quick-filters">
                <span class="filter-chip" onclick="applyQuickFilter(9.0, 20.0)">🔥 Top Tier (9.0+)</span>
                <span class="filter-chip" onclick="applyQuickFilter(8.0, 8.99)">⭐ Gold Standard (8.0 - 8.9)</span>
                <span class="filter-chip" onclick="applyQuickFilter(6.0, 7.99)">📈 Solid Performers (6.0 - 7.9)</span>
            </div>
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
                <h3 style="margin-top: 0; font-size: 18px;">Analytical Platform</h3>
                <p style="font-size: 14px; color: #555; line-height: 1.6;">The NAAS Insights Engine provides 10-year longitudinal analysis of journal ratings to help researchers identify stable publishing venues.</p>
            </div>
            <div class="card" style="margin: 0; border-top: 4px solid var(--accent);">
                <h3 style="margin-top: 0; font-size: 18px;">How to use</h3>
                <p style="font-size: 14px; color: #555; line-height: 1.6;">Search by ISSN or Name above. Use the Analytics button on results to see deep trends and statistical recommendations.</p>
            </div>
        </div>
    ` : `
        <div class="card" style="padding: 0; overflow: hidden;">
            <div style="padding: 15px 20px; border-bottom: 1px solid #eee; background: #fafafa; display: flex; justify-content: space-between; align-items: center;">
                <h3 style="margin: 0; font-size: 18px;">Search Results (${results.length})</h3>
                <button onclick="downloadCSV()" class="btn" style="padding: 8px 15px; font-size: 12px; background: var(--success);">Export CSV</button>
            </div>
            
            <div style="width: 100%; overflow-x: auto;">
                <table style="min-width: 850px; width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #f8f9fa; border-bottom: 2px solid #dee2e6;">
                            <th style="padding: 12px; text-align: left;">ISSN</th>
                            <th style="padding: 12px; text-align: left;">Journal Title</th>
                            <th style="padding: 12px; text-align: center;">Latest</th>
                            <th style="padding: 12px; text-align: center;">10-Yr Avg</th>
                            <th style="padding: 12px; text-align: center;">Trend</th>
                            <th style="padding: 12px; text-align: center;">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${results.map(row => {
                            const latest = row.latest_score !== null ? Number(row.latest_score) : null;
                            const avg = row.calculated_avg !== null ? Number(row.calculated_avg) : null;
                            let tI = "−"; let tC = "#6c757d"; let dD = "N/A";
                            if (latest !== null && avg !== null) {
                                const diff = latest - avg; dD = (diff >= 0 ? '+' : '') + diff.toFixed(2);
                                if (diff > 0.05) { tI = "↑"; tC = "var(--success)"; } else if (diff < -0.05) { tI = "↓"; tC = "var(--danger)"; }
                            }
                            return `
                            <tr style="border-bottom: 1px solid #eee;">
                                <td style="padding: 12px; font-family: monospace; font-size: 13px;">${row.ISSN}</td>
                                <td style="padding: 12px; font-size: 14px;"><strong>${row.Name}</strong></td>
                                <td style="padding: 12px; text-align: center;">${latest !== null ? '<span style="background:var(--primary); color:white; padding:4px 8px; border-radius:4px; font-weight:bold;">' + latest.toFixed(2) + '</span>' : 'N/A'}</td>
                                <td style="padding: 12px; text-align: center; font-size: 14px;">${avg !== null ? avg.toFixed(2) : 'N/A'}</td>
                                <td style="padding: 12px; text-align: center; color: ${tC}; font-weight: bold; font-size: 13px;">${tI} (${dD})</td>
                                <td style="padding: 12px; text-align: center;">
                                    <div style="display:flex; gap:5px; justify-content:center;">
                                        <a href="/journal?id=${row.master_id}" class="btn" style="padding:6px 10px; font-size:11px; background:var(--success);">📊 Metrics</a>
                                        <a href="https://www.google.com/search?q=ISSN+${row.ISSN}" target="_blank" class="btn" style="padding:6px 10px; font-size:11px; background:#4285F4;">🔍 Search</a>
                                    </div>
                                </td>
                            </tr>`;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        </div>
        <script>
            function downloadCSV() {
                const data = ${safeResults};
                let csv = "ISSN,Journal Title,Latest Score,Avg\\n";
                data.forEach(r => { csv += (r.ISSN||'N/A') + ',"' + (r.Name||'Unknown') + '",' + (r.latest_score||'0') + ',' + (r.calculated_avg||'0') + "\\n"; });
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a"); a.href = url; a.download = "NAAS_Export.csv"; a.click();
            }
        </script>
    `}
  `;
}

export function renderAnalyticsBody(data) {
  const ratings = data.ratings; const n = ratings.length;
  const scores = ratings.map(r => r.rating);
  const latestObj = ratings[n - 1]; 
  const latestVal = latestObj.rating;
  const latestYear = latestObj.year;
  
  const previousObj = n > 1 ? ratings[n - 2] : null;
  const previousVal = previousObj ? previousObj.rating : null; // FIXED: Added missing variable
  
  const avgScore = scores.reduce((a, b) => a + b, 0) / n;
  const variance = scores.reduce((a, b) => a + Math.pow(b - avgScore, 2), 0) / n;
  const stdDev = Math.sqrt(variance);
  
  let recentAvg = latestVal; let historicalAvg = avgScore;
  if (n >= 4) { recentAvg = (scores[n-1] + scores[n-2] + scores[n-3]) / 3; historicalAvg = scores.slice(0, n-3).reduce((a,b)=>a+b,0) / (n-3); }
  const yoyChange = previousVal !== null ? latestVal - previousVal : 0;

  // Tier-Aware Recommendation Engine
  let recStatus = "Recommended"; let recColor = "var(--success)"; let recReason = "";
  const isSevereCrash = previousVal !== null && yoyChange < -Math.max(stdDev, 0.5);
  const isUnderperforming = recentAvg < avgScore && latestVal < avgScore;

  if (latestVal >= 10.0) {
      if (isSevereCrash) { recStatus = "Proceed with Caution"; recColor = "var(--accent)"; recReason = "Elite tier but experienced a sharp drop recently."; } 
      else { recStatus = "Highly Recommended"; recColor = "var(--primary)"; recReason = "Exceptional world-class NAAS rating."; }
  } else if (latestVal >= 6.0) {
      if (isSevereCrash || (isUnderperforming && yoyChange < 0)) { recStatus = "Proceed with Caution"; recColor = "var(--accent)"; recReason = "Strong tier but showing declining momentum."; } 
      else { recStatus = "Recommended"; recColor = "var(--success)"; recReason = "Solid quality with stable historical performance."; }
  } else {
      if (isSevereCrash || isUnderperforming) { recStatus = "Not Recommended"; recColor = "var(--danger)"; recReason = "Sustained downward trajectory in a lower tier."; } 
      else if (recentAvg > avgScore && yoyChange > 0) { recStatus = "Recommended"; recColor = "var(--success)"; recReason = "Growing journal with strong positive momentum."; } 
      else { recStatus = "Proceed with Caution"; recColor = "var(--accent)"; recReason = "Fluctuating performance; monitor before submission."; }
  }

  const chartLabels = JSON.stringify(ratings.map(r => r.year));
  const chartData = JSON.stringify(scores);
  const avgLine = JSON.stringify(ratings.map(() => avgScore.toFixed(2)));

  const statusBadge = (c) => c ? '<span style="background:var(--success);color:white;padding:2px 6px;border-radius:4px;font-size:11px;">PASS</span>' : '<span style="background:var(--danger);color:white;padding:2px 6px;border-radius:4px;font-size:11px;">FAIL/WARN</span>';

  return `
    <style>
        .tooltip-icon { display: inline-flex; align-items: center; justify-content: center; width: 14px; height: 14px; border-radius: 50%; background: #e2e8f0; color: #64748b; font-size: 10px; font-weight: bold; cursor: help; margin-left: 4px; border: 1px solid #cbd5e1; }
        .tooltip-container { position: relative; display: inline-flex; align-items: center; }
        .tooltip-container:hover::after { content: attr(data-tooltip); position: absolute; bottom: 120%; left: 50%; transform: translateX(-50%); background: #1e293b; color: #fff; padding: 8px 12px; border-radius: 6px; font-size: 12px; white-space: normal; width: 220px; text-align: center; line-height: 1.4; z-index: 999; }
        @media (max-width: 768px) { .tooltip-container:hover::after { left: auto; right: -20px; transform: none; width: 180px; } }
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
            <small style="text-transform: uppercase; color: #999; font-size: 10px; font-weight: bold;">Hist. Avg</small>
            <div style="font-size: 24px; font-weight: bold; color: #6c757d;">${avgScore.toFixed(2)}</div>
        </div>
        <div class="card" style="text-align: center; border-left: 5px solid var(--primary); margin: 0; padding: 15px;">
            <small style="text-transform: uppercase; color: #999; font-size: 10px; font-weight: bold;">Latest (${latestYear})</small>
            <div style="font-size: 24px; font-weight: bold; color: var(--primary);">${latestVal.toFixed(2)}</div>
        </div>
        <div class="card" style="text-align: center; border-left: 5px solid var(--accent); margin: 0; padding: 15px;">
            <small style="text-transform: uppercase; color: #999; font-size: 10px; font-weight: bold;">Deviation</small>
            <div style="font-size: 24px; font-weight: bold; color: var(--accent);">${(latestVal - avgScore >= 0 ? '+' : '')}${(latestVal - avgScore).toFixed(2)}</div>
        </div>
        <div class="card" style="text-align: center; border-left: 5px solid ${recColor}; margin: 0; padding: 15px;">
            <small style="text-transform: uppercase; color: #999; font-size: 10px; font-weight: bold;">Recommendation</small>
            <div style="font-size: 14px; font-weight: bold; color: ${recColor}; text-transform: uppercase; margin-top:5px;">${recStatus}</div>
        </div>
    </div>
    <div class="card">
        <h3 style="margin-top: 0; border-bottom: 2px solid #eee; padding-bottom: 10px;">Performance Trends</h3>
        <div style="height: 350px;"><canvas id="naasChart"></canvas></div>
    </div>
    <div class="card" style="border-left: 5px solid ${recColor}; background: #fffcfc;">
        <h3 style="margin-top: 0; color: #333; font-size: 16px;">Decision Matrix Calculations</h3>
        <p style="font-size: 14px; color: #555;">${recReason}</p>
        <div style="width: 100%; overflow-x: auto; margin-top:15px; border: 1px solid #eee;">
            <table style="font-size: 13px; text-align: left; width: 100%; min-width: 400px;">
                <thead style="background: #f8f9fa;">
                    <tr><th style="padding: 8px 12px; border-bottom: 1px solid #ddd;">Metric</th><th style="padding: 8px 12px; border-bottom: 1px solid #ddd;">Value</th><th style="padding: 8px 12px; border-bottom: 1px solid #ddd;">Target</th><th style="padding: 8px 12px; border-bottom: 1px solid #ddd;">Status</th></tr>
                </thead>
                <tbody>
                    <tr><td style="padding: 8px 12px; border-bottom: 1px solid #eee;">Baseline</td><td style="padding: 8px 12px; border-bottom: 1px solid #eee;">${latestVal.toFixed(2)}</td><td style="padding: 8px 12px; border-bottom: 1px solid #eee; color:#666;">&ge; ${avgScore.toFixed(2)}</td><td style="padding: 8px 12px; border-bottom: 1px solid #eee;">${statusBadge(latestVal >= avgScore)}</td></tr>
                    <tr><td style="padding: 8px 12px; border-bottom: 1px solid #eee;">Momentum (3y)</td><td style="padding: 8px 12px; border-bottom: 1px solid #eee;">${recentAvg.toFixed(2)}</td><td style="padding: 8px 12px; border-bottom: 1px solid #eee; color:#666;">&ge; ${historicalAvg.toFixed(2)}</td><td style="padding: 8px 12px; border-bottom: 1px solid #eee;">${statusBadge(recentAvg >= historicalAvg)}</td></tr>
                    <tr><td style="padding: 8px 12px;">Volatility (&sigma;)</td><td style="padding: 8px 12px;">${stdDev.toFixed(2)}</td><td style="padding: 8px 12px; color:#666;">&lt; 0.30</td><td style="padding: 8px 12px;">${statusBadge(stdDev < 0.30)}</td></tr>
                </tbody>
            </table>
        </div>
    </div>
    <script>
        setTimeout(() => {
            new Chart(document.getElementById('naasChart').getContext('2d'), {
                type: 'line',
                data: { labels: ${chartLabels}, datasets: [{ label: 'NAAS Rating', data: ${chartData}, borderColor: '#0056b3', tension: 0.3, fill: false }, { label: 'Average', data: ${avgLine}, borderColor: '#28a745', borderDash: [5, 5], pointRadius: 0, fill: false }] },
                options: { responsive: true, maintainAspectRatio: false }
            });
        }, 150);
    </script>
  `;
}

export function renderCompareBody(journals) {
    const colors = ['#0056b3', '#ff8c00', '#28a745', '#dc3545'];
    
    if (journals.length < 2) {
        return `
        <div class="card" style="border-top: 5px solid var(--accent); text-align: center; padding-bottom: 40px;">
            <h2 style="color: var(--primary); margin-bottom: 10px;">Compare & Rank Journals</h2>
            <div style="max-width: 700px; margin: 0 auto; background: #fafafa; padding: 25px; border-radius: 8px; border: 1px solid #eee; text-align: left;">
                <div style="margin-bottom: 20px; position: relative;">
                    <label style="font-size: 12px; font-weight: bold; color: #555;">SEARCH AND ADD JOURNAL</label>
                    <input type="text" id="compare-search" autocomplete="off" placeholder="Type journal name or ISSN..." style="width: 100%; padding: 14px; border: 2px solid var(--border); border-radius: 6px; font-size: 15px;">
                    <div class="autocomplete-dropdown" id="compare-dropdown"></div>
                </div>
                <div style="margin-bottom: 20px;">
                    <label style="font-size: 12px; font-weight: bold; color: #555;">SELECTED (<span id="sel-count">0</span>/4)</label>
                    <ul id="selected-list" style="list-style: none; padding: 0; margin: 10px 0 0 0; display: flex; flex-direction: column; gap: 10px;"></ul>
                </div>
                <form action="/compare" method="GET" id="compare-form" style="margin-top: 25px;">
                    <div id="hidden-inputs"></div>
                    <button type="submit" id="compare-btn" class="btn" style="width: 100%; font-size: 16px; background: var(--accent); opacity: 0.5; pointer-events: none; padding: 14px;">Compare Journals</button>
                </form>
            </div>
        </div>
        <script>
            const cI = document.getElementById('compare-search'), cD = document.getElementById('compare-dropdown'), cL = document.getElementById('selected-list'), hI = document.getElementById('hidden-inputs'), cB = document.getElementById('compare-btn'), cC = document.getElementById('sel-count');
            let selected = [];
            function updateUI() {
                cL.innerHTML = ''; hI.innerHTML = '';
                selected.forEach((j, i) => {
                    cL.innerHTML += '<li style="background: white; border: 1px solid #ddd; padding: 10px; border-radius: 6px; display: flex; justify-content: space-between;"><div><strong>' + j.name + '</strong></div><button type="button" onclick="removeJournal(\\''+j.id+'\\')" style="background:var(--danger);color:white;border:none;padding:2px 8px;border-radius:4px;cursor:pointer;">X</button></li>';
                    hI.innerHTML += '<input type="hidden" name="id'+(i+1)+'" value="'+j.id+'">';
                });
                cC.innerText = selected.length;
                cB.style.opacity = selected.length >= 2 ? '1' : '0.5';
                cB.style.pointerEvents = selected.length >= 2 ? 'auto' : 'none';
            }
            window.addJournal = function(id, name, issn) {
                if(selected.length >= 4) return;
                if(!selected.find(j => j.id === id)) { selected.push({id, name, issn}); updateUI(); }
                cI.value = ''; cD.style.display = 'none';
            };
            window.removeJournal = function(id) { selected = selected.filter(j => j.id !== id); updateUI(); };
            cI.addEventListener('input', async () => {
                const v = cI.value.trim(); if(v.length < 2) return;
                const r = await fetch('/?ajax_search=' + encodeURIComponent(v));
                const d = await r.json();
                if(d.length > 0) {
                    cD.innerHTML = d.map(item => '<div class="autocomplete-item" onclick="window.addJournal(\\''+item.master_id+'\\', \\''+item.Name.replace(/'/g, "\\\\'")+'\\', \\''+item.ISSN+'\\')"><strong>'+item.Name+'</strong></div>').join('');
                    cD.style.display = 'block';
                }
            });
        </script>`;
    }

    const analyzed = journals.map((j, idx) => {
        const scores = j.ratings.map(r => r.rating);
        const latest = scores[scores.length - 1];
        const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
        const variance = scores.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / scores.length;
        const stdDev = Math.sqrt(variance);
        const rankScore = (latest * 0.6) + (avg * 0.4) - (stdDev * 0.2);
        return { ...j, latest, avg, stdDev, rankScore, color: colors[idx] };
    }).sort((a, b) => b.rankScore - a.rankScore);

    const yearsSet = new Set(); journals.forEach(j => j.ratings.forEach(r => yearsSet.add(r.year)));
    const allYears = Array.from(yearsSet).sort();
    const rankMedals = { 0: '🥇', 1: '🥈', 2: '🥉', 3: '🏅' };

    return `
    <div class="no-print" style="margin-bottom: 20px;"><a href="/compare" class="btn" style="background: #6c757d;">← New Comparison</a></div>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 15px; margin-bottom: 25px;">
        ${analyzed.map((j, i) => `
            <div class="card" style="border-top: 4px solid ${j.color}; padding: 15px; margin: 0; position:relative;">
                <div style="position:absolute; top:10px; right:10px; font-size:20px;">${rankMedals[i]}</div>
                <div style="font-size: 10px; font-weight: bold; color: #999;">RANK ${i+1}</div>
                <h4 style="margin: 5px 0; font-size: 14px; height: 32px; overflow:hidden;">${j.name}</h4>
                <div style="font-size: 22px; font-weight: bold; color: ${j.color};">${j.latest.toFixed(2)}</div>
                <div style="font-size: 11px; color: #666;">Avg: ${j.avg.toFixed(2)}</div>
            </div>
        `).join('')}
    </div>
    <div class="card">
        <h3 style="margin-top:0;">Longitudinal Comparison</h3>
        <div style="height: 400px;"><canvas id="compareChart"></canvas></div>
    </div>
    <script>
        setTimeout(() => {
            new Chart(document.getElementById('compareChart').getContext('2d'), {
                type: 'line',
                data: {
                    labels: ${JSON.stringify(allYears)},
                    datasets: ${JSON.stringify(analyzed.map(j => ({
                        label: j.name,
                        data: allYears.map(y => { const r = j.ratings.find(rt => rt.year === y); return r ? r.rating : null; }),
                        borderColor: j.color, tension: 0.3, fill: false
                    })))}
                },
                options: { responsive: true, maintainAspectRatio: false }
            });
        }, 150);
    </script>`;
}
export function renderStatisticsBody(stats) {
  const years = JSON.stringify(stats.yearlyTrends.map(d => d.year));
  const avgRatings = JSON.stringify(stats.yearlyTrends.map(d => d.avg_rating.toFixed(2)));
  const counts = JSON.stringify(stats.yearlyTrends.map(d => d.journal_count));
  
  const tierLabels = JSON.stringify(stats.distribution.map(d => d.tier));
  const tierData = JSON.stringify(stats.distribution.map(d => d.count));

  return `
    <div class="card" style="border-top: 5px solid var(--primary);">
        <h2 style="margin:0;">National Agricultural Research Statistics</h2>
        <p style="color: #666;">Longitudinal analysis of ${stats.yearlyTrends.length} years of NAAS data.</p>
    </div>

    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(450px, 1fr)); gap: 20px;">
        <div class="card">
            <h3>Average NAAS Score Trend</h3>
            <div style="height: 300px;"><canvas id="trendChart"></canvas></div>
            <p style="font-size: 12px; color: #777; margin-top: 10px;">Indicates if agricultural journals are improving in quality over time.</p>
        </div>

        <div class="card">
            <h3>Journals Indexed per Year</h3>
            <div style="height: 300px;"><canvas id="countChart"></canvas></div>
        </div>

        <div class="card">
            <h3>Journal Tier Distribution (${stats.latestYear})</h3>
            <div style="height: 300px; display: flex; justify-content: center;">
                <canvas id="tierChart"></canvas>
            </div>
        </div>

        <div class="card">
            <h3>Top 10 Performing Journals (${stats.latestYear})</h3>
            <div class="table-responsive">
                <table>
                    <thead>
                        <tr style="background:#f8f9fa;"><th>Rank</th><th>Journal</th><th>Score</th></tr>
                    </thead>
                    <tbody>
                        ${stats.topJournals.map((j, i) => `
                            <tr>
                                <td>${i+1}</td>
                                <td style="font-size: 13px;"><strong>${j.Name}</strong></td>
                                <td><span style="background:var(--success); color:white; padding:2px 6px; border-radius:4px;">${j.rating.toFixed(2)}</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <script>
        setTimeout(() => {
            // Trend Line Chart
            new Chart(document.getElementById('trendChart'), {
                type: 'line',
                data: { labels: ${years}, datasets: [{ label: 'Avg Rating', data: ${avgRatings}, borderColor: '#0056b3', fill: true, backgroundColor: 'rgba(0, 86, 179, 0.1)' }] }
            });

            // Volume Bar Chart
            new Chart(document.getElementById('countChart'), {
                type: 'bar',
                data: { labels: ${years}, datasets: [{ label: 'Total Journals', data: ${counts}, backgroundColor: '#ff8c00' }] }
            });

            // Tier Pie Chart
            new Chart(document.getElementById('tierChart'), {
                type: 'doughnut',
                data: { 
                    labels: ${tierLabels}, 
                    datasets: [{ data: ${tierData}, backgroundColor: ['#0056b3', '#28a745', '#ff8c00', '#dc3545'] }] 
                },
                options: { maintainAspectRatio: false }
            });
        }, 200);
    </script>
  `;
}
