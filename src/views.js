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
  const n = ratings.length;
  
  // Extract pure numbers for statistical math
  const scores = ratings.map(r => r.rating);
  const latestObj = ratings[n - 1];
  const previousObj = n > 1 ? ratings[n - 2] : null;
  const latestVal = latestObj.rating;
  const previousVal = previousObj ? previousObj.rating : null;

  // Calculate Mean (Average)
  const sum = scores.reduce((a, b) => a + b, 0);
  const avgScore = sum / n;

  // Calculate Variance & Standard Deviation (Volatility)
  const variance = scores.reduce((a, b) => a + Math.pow(b - avgScore, 2), 0) / n;
  const stdDev = Math.sqrt(variance);

  // Calculate 3-Year Moving Average vs Historical (Momentum)
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

  // --- STATISTICAL RECOMMENDATION ENGINE ---
  let recStatus = "Recommended";
  let recColor = "var(--success)";
  let recReason = "";

  if (n < 3) {
      if (latestVal >= avgScore) {
          recStatus = "Recommended";
          recReason = "Based on limited available data, the journal is maintaining its rating baseline.";
      } else {
          recStatus = "Proceed with Caution";
          recColor = "var(--accent)";
          recReason = "Limited historical data shows a recent dip in the rating.";
      }
  } else {
      const isSevereCrash = previousVal !== null && (previousVal - latestVal) > stdDev && stdDev > 0.3;
      const isSevereSpike = previousVal !== null && (latestVal - previousVal) > stdDev && stdDev > 0.3;

      if (recentAvg >= avgScore && latestVal >= avgScore && !isSevereCrash) {
          recStatus = "Recommended";
          recColor = "var(--success)";
          recReason = `The journal demonstrates strong, sustained performance. Its recent 3-year momentum (${recentAvg.toFixed(2)}) meets or exceeds its 10-year historical baseline, indicating a reliable publishing venue.`;
      } else if (isSevereSpike && historicalAvg < avgScore) {
          recStatus = "Proceed with Caution";
          recColor = "var(--accent)";
          recReason = `Statistical anomaly detected: While the current rating spiked significantly this year, the older historical average (${historicalAvg.toFixed(2)}) is much lower. Verify if this recent quality improvement is sustainable before publishing.`;
      } else if (isSevereCrash || (recentAvg < historicalAvg && latestVal < avgScore)) {
          if (historicalAvg > avgScore + 0.2) {
              recStatus = "Proceed with Caution";
              recColor = "var(--accent)";
              recReason = `This journal was historically strong (averaging ${historicalAvg.toFixed(2)}), but statistical variance analysis reveals a severe recent decline. Exercise caution until ratings stabilize.`;
          } else {
              recStatus = "Not Recommended";
              recColor = "var(--danger)";
              recReason = `The journal shows a sustained downward trajectory. Its recent ratings have crashed below the historical average (${avgScore.toFixed(2)}) and standard deviation thresholds, indicating declining scientific impact.`;
          }
      } else if (recentAvg < avgScore) {
          recStatus = "Not Recommended";
          recColor = "var(--danger)";
          recReason = `Statistical trends indicate a persistent underperformance, with the recent moving average (${recentAvg.toFixed(2)}) remaining below the historical baseline.`;
      } else {
          recStatus = "Proceed with Caution";
          recColor = "var(--accent)";
          recReason = "The journal's performance is highly volatile and shows inconsistent statistical trends compared to its historical mean.";
      }
  }

  // Top Deviation Card
  const topDeviation = latestVal - avgScore;
  const topDevColor = topDeviation >= 0 ? "var(--success)" : "var(--danger)";
  const topDevSign = topDeviation >= 0 ? "+" : "";

  // Formats for Chart.js
  const chartYears = JSON.stringify(ratings.map(r => r.year));
  const chartValues = JSON.stringify(ratings.map(r => r.rating));
  const avgValues = JSON.stringify(ratings.map(() => avgScore.toFixed(2))); 

  // Table Row Generation (Reverse Chronological)
  let tableRowsHtml = "";
  for (let i = n - 1; i >= 0; i--) {
      const current = ratings[i];
      const prev = i > 0 ? ratings[i - 1] : null;
      
      const diffFromAvg = current.rating - avgScore;
      const yoyChange = prev ? current.rating - prev.rating : 0;
      
      const avgColor = diffFromAvg >= 0 ? "var(--success)" : "var(--danger)";
      const yoyColor = yoyChange > 0 ? "var(--success)" : (yoyChange < 0 ? "var(--danger)" : "#666");

      tableRowsHtml += `
        <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 12px;"><strong>${current.year}</strong></td>
            <td style="padding: 12px; text-align: center;"><span style="background: var(--primary); color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;">${current.rating.toFixed(2)}</span></td>
            <td style="padding: 12px; text-align: center; color: ${yoyColor}; font-weight: bold;">${prev ? (yoyChange > 0 ? '+' : '') + yoyChange.toFixed(2) : '-'}</td>
            <td style="padding: 12px; text-align: center; color: ${avgColor}; font-weight: bold;">${(diffFromAvg > 0 ? '+' : '') + diffFromAvg.toFixed(2)}</td>
        </tr>
      `;
  }

  return `
    <div class="card">
        <h2 style="color: var(--primary); margin: 0;">${data.name}</h2>
        <div style="display: flex; gap: 10px; margin-top: 15px; align-items: center; flex-wrap: wrap;">
            <div style="background: #f1f3f4; padding: 6px 12px; border-radius: 4px; border: 1px solid #ddd; font-family: monospace; color: #555;">
                ISSN: <b>${data.issn}</b>
            </div>
            <a href="https://www.google.com/search?q=ISSN+${data.issn}" target="_blank" class="btn" style="padding: 6px 15px; font-size: 13px; background: #4285F4; display: flex; align-items: center; gap: 5px;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg> Search Google
            </a>
        </div>
    </div>
    
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 25px;">
        <div class="card" style="text-align: center; border-left: 5px solid #6c757d; margin: 0;">
            <small style="text-transform: uppercase; color: #999; font-size: 10px; font-weight: bold;">Historical Average</small>
            <div style="font-size: 32px; font-weight: bold; color: #6c757d;">${avgScore.toFixed(2)}</div>
        </div>
        <div class="card" style="text-align: center; border-left: 5px solid var(--primary); margin: 0;">
            <small style="text-transform: uppercase; color: #999; font-size: 10px; font-weight: bold;">Latest Rating (${latestObj.year})</small>
            <div style="font-size: 32px; font-weight: bold; color: var(--primary);">${latestVal.toFixed(2)}</div>
        </div>
        <div class="card" style="text-align: center; border-left: 5px solid ${topDevColor}; margin: 0;">
            <small style="text-transform: uppercase; color: #999; font-size: 10px; font-weight: bold;">Deviation from Average</small>
            <div style="font-size: 32px; font-weight: bold; color: ${topDevColor};">${topDevSign}${topDeviation.toFixed(2)}</div>
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
        <div style="overflow-x: auto;">
            <table style="min-width: 600px; width: 100%; border-collapse: collapse;">
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
        <h3 style="margin-top: 0; color: #333; font-size: 16px;">Algorithmic Recommendation</h3>
        <p style="font-size: 15px; line-height: 1.6; color: #555;">
            On the basis of the NAAS rating analysis of the last 10 years and current NAAS trajectory, it is 
            <strong style="color: ${recColor}; font-size: 16px; text-transform: uppercase;">${recStatus}</strong> to publish in this journal.
        </p>
        <p style="font-size: 13px; color: #888; margin-bottom: 0; border-top: 1px dashed #ddd; padding-top: 10px;">
            <strong>Reasoning:</strong> ${recReason}
        </p>
    </div>

    <script>
        setTimeout(() => {
            new Chart(document.getElementById('naasChart').getContext('2d'), {
                type: 'line',
                data: {
                    labels: ${chartYears},
                    datasets: [
                        { 
                            label: 'NAAS Rating', 
                            data: ${chartValues}, 
                            borderColor: '#0056b3', 
                            backgroundColor: 'rgba(0, 86, 179, 0.05)', 
                            fill: true, 
                            tension: 0.3, 
                            pointRadius: 5,
                            order: 1
                        },
                        {
                            label: 'Historical Average (${avgScore.toFixed(2)})',
                            data: ${avgValues},
                            borderColor: '#28a745',
                            borderWidth: 2,
                            borderDash: [5, 5],
                            fill: false,
                            pointRadius: 0,
                            order: 2
                        }
                    ]
                },
                options: { 
                    responsive: true, 
                    maintainAspectRatio: false,
                    interaction: { mode: 'index', intersect: false },
                    plugins: { tooltip: { enabled: true } }
                }
            });
        }, 150);
    </script>
  `;
}
