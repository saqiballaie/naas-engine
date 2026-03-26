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
      const isSevereCrash = previousVal !== null && yoyChange < -stdDev && stdDev > 0.3;
      const isSevereSpike = previousVal !== null && yoyChange > stdDev && stdDev > 0.3;

      if (recentAvg >= avgScore && latestVal >= avgScore && !isSevereCrash) {
          recStatus = "Recommended";
          recColor = "var(--success)";
          recReason = `The journal demonstrates strong, sustained performance. Its recent 3-year momentum meets or exceeds its historical baseline.`;
      } else if (isSevereSpike && historicalAvg < avgScore) {
          recStatus = "Proceed with Caution";
          recColor = "var(--accent)";
          recReason = `Statistical anomaly detected: While the current rating spiked significantly this year, the older historical average is much lower. Verify if this recent quality improvement is sustainable.`;
      } else if (isSevereCrash || (recentAvg < historicalAvg && latestVal < avgScore)) {
          if (historicalAvg > avgScore + 0.2) {
              recStatus = "Proceed with Caution";
              recColor = "var(--accent)";
              recReason = `This journal was historically strong, but statistical variance analysis reveals a severe recent decline. Exercise caution until ratings stabilize.`;
          } else {
              recStatus = "Not Recommended";
              recColor = "var(--danger)";
              recReason = `The journal shows a sustained downward trajectory. Its recent ratings have crashed below the historical average and standard deviation thresholds, indicating declining scientific impact.`;
          }
      } else if (recentAvg < avgScore) {
          recStatus = "Not Recommended";
          recColor = "var(--danger)";
          recReason = `Statistical trends indicate a persistent underperformance, with the recent moving average remaining below the historical baseline.`;
      } else {
          recStatus = "Proceed with Caution";
          recColor = "var(--accent)";
          recReason = "The journal's performance is highly volatile and shows inconsistent statistical trends compared to its historical mean.";
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
      const current = ratings[i];
      const prev = i > 0 ? ratings[i - 1] : null;
      
      const diffFromAvg = current.rating - avgScore;
      const yoy = prev ? current.rating - prev.rating : 0;
      
      const avgColor = diffFromAvg >= 0 ? "var(--success)" : "var(--danger)";
      const yoyColor = yoy > 0 ? "var(--success)" : (yoy < 0 ? "var(--danger)" : "#666");

      tableRowsHtml += `
        <tr style="border-bottom: 1px solid #eee; background: ${i === n-1 ? '#fcfdfc' : 'transparent'};">
            <td style="padding: 12px;"><strong>${current.year}</strong> ${i === n-1 ? '<span style="font-size:10px; color:var(--primary); margin-left:5px;">(Latest)</span>' : ''}</td>
            <td style="padding: 12px; text-align: center;"><span style="background: var(--primary); color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;">${current.rating.toFixed(2)}</span></td>
            <td style="padding: 12px; text-align: center; color: ${yoyColor}; font-weight: bold;">${prev ? (yoy > 0 ? '+' : '') + yoy.toFixed(2) : '-'}</td>
            <td style="padding: 12px; text-align: center; color: ${avgColor}; font-weight: bold;">${(diffFromAvg > 0 ? '+' : '') + diffFromAvg.toFixed(2)}</td>
        </tr>
      `;
  }

  const statusBadge = (condition) => condition ? `<span style="background:var(--success); color:white; padding:2px 6px; border-radius:4px; font-size:11px;">PASS</span>` : `<span style="background:var(--danger); color:white; padding:2px 6px; border-radius:4px; font-size:11px;">FAIL/WARN</span>`;

  return `
    <style>
        .tooltip-icon { display: inline-flex; align-items: center; justify-content: center; width: 14px; height: 14px; border-radius: 50%; background: #e9ecef; color: #6c757d; font-size: 10px; font-weight: bold; cursor: help; margin-left: 4px; border: 1px solid #ced4da; }
        .tooltip-container { position: relative; display: inline-flex; align-items: center; }
        .tooltip-container:hover::after { content: attr(data-tooltip); position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); background: #333; color: #fff; padding: 6px 10px; border-radius: 4px; font-size: 11px; font-weight: normal; white-space: nowrap; z-index: 10; margin-bottom: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.2); pointer-events: none; }
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
        <h3 style="margin-top: 0; color: #333; font-size: 16px;">Algorithmic Recommendation Details</h3>
        <p style="font-size: 15px; line-height: 1.6; color: #555;">
            On the basis of the NAAS rating analysis of the last 10 years and the current NAAS trajectory, it is 
            <strong style="color: ${recColor}; font-size: 16px; text-transform: uppercase;">${recStatus}</strong> to publish in this journal.
        </p>
        <p style="font-size: 13px; color: #888; margin-bottom: 20px;"><em>Reasoning: ${recReason}</em></p>
        
        <h4 style="margin: 0 0 10px 0; font-size: 13px; color: #444; text-transform: uppercase;">Decision Matrix Calculations</h4>
        <div style="overflow-x: auto; border: 1px solid #eee; border-radius: 6px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 13px; text-align: left;">
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
                        <td style="padding: 8px 12px; color: #666;">Drop &lt; 1 StdDev (${stdDev.toFixed(2)})</td>
                        <td style="padding: 8px 12px;">${statusBadge(yoyChange >= -stdDev)}</td>
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

// ---------------------------------------------------------
// NEW MULTI-JOURNAL COMPARE MODULE (HANDLES 2 TO 4 JOURNALS)
// ---------------------------------------------------------
export function renderCompareBody(journals) {
    const colors = ['#0056b3', '#ff8c00', '#28a745', '#dc3545']; // Blue, Orange, Green, Red
    
    // STATE 1: PICKER (Less than 2 journals selected)
    if (journals.length < 2) {
        // If they arrived from a specific journal's "Compare" button, pre-load it.
        const preSelectedJs = journals.length === 1 ? `addJournal('${journals[0].master_id}', '${journals[0].name.replace(/'/g, "\\'")}', '${journals[0].issn}');` : '';

        return `
        <div class="card" style="border-top: 5px solid var(--accent); text-align: center; padding-bottom: 40px;">
            <h2 style="color: var(--primary); margin-bottom: 10px;">Compare Journals</h2>
            <p style="color: #666; font-size: 15px; margin-bottom: 25px;">Search and select between 2 and 4 journals to instantly compare their NAAS ratings, historical averages, and trajectories.</p>
            
            <div style="max-width: 700px; margin: 0 auto; background: #fafafa; padding: 25px; border-radius: 8px; border: 1px solid #eee; text-align: left;">
                
                <div style="margin-bottom: 20px; position: relative;">
                    <label style="font-size: 12px; font-weight: bold; color: #555;">SEARCH AND ADD JOURNAL</label>
                    <input type="text" id="compare-search" autocomplete="off" placeholder="Type journal name or ISSN..." 
                           style="width: 100%; padding: 14px; border: 2px solid var(--border); border-radius: 6px; font-size: 15px; margin-top: 5px;">
                    <div class="autocomplete-dropdown" id="compare-dropdown"></div>
                </div>

                <div style="margin-bottom: 20px;">
                    <label style="font-size: 12px; font-weight: bold; color: #555;">SELECTED JOURNALS (<span id="sel-count">0</span>/4)</label>
                    <ul id="selected-list" style="list-style: none; padding: 0; margin: 10px 0 0 0; display: flex; flex-direction: column; gap: 10px;">
                        </ul>
                </div>
                
                <form action="/compare" method="GET" id="compare-form" style="margin-top: 25px;">
                    <div id="hidden-inputs"></div>
                    <button type="submit" id="compare-btn" class="btn" style="width: 100%; font-size: 16px; background: var(--accent); opacity: 0.5; pointer-events: none; padding: 14px;">Select at least 2 journals</button>
                </form>
            </div>
        </div>
        <script>
            // Isolated JavaScript for the Compare Picker Module
            const cInp = document.getElementById('compare-search');
            const cDd = document.getElementById('compare-dropdown');
            const cList = document.getElementById('selected-list');
            const hInputs = document.getElementById('hidden-inputs');
            const cBtn = document.getElementById('compare-btn');
            const cCount = document.getElementById('sel-count');
            
            let selected = [];

            function updateUI() {
                cList.innerHTML = '';
                hInputs.innerHTML = '';
                selected.forEach((j, idx) => {
                    cList.innerHTML += \`<li style="background: white; border: 1px solid #ddd; padding: 12px 15px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                        <div><strong style="color: var(--primary); font-size: 14px;">\${j.name}</strong> <span style="color: #888; font-size: 12px; margin-left: 10px; font-family: monospace;">ISSN: \${j.issn}</span></div>
                        <button type="button" onclick="removeJournal('\${j.id}')" style="background: var(--danger); color: white; border: none; border-radius: 4px; padding: 5px 10px; cursor: pointer; font-size: 11px; font-weight: bold;">Remove</button>
                    </li>\`;
                    hInputs.innerHTML += \`<input type="hidden" name="id\${idx+1}" value="\${j.id}">\`;
                });
                
                cCount.innerText = selected.length;
                if(selected.length >= 4) {
                    cInp.placeholder = "Maximum of 4 journals selected. Remove one to add another.";
                    cInp.disabled = true;
                } else {
                    cInp.placeholder = "Type journal name or ISSN...";
                    cInp.disabled = false;
                }

                if(selected.length >= 2) {
                    cBtn.style.opacity = '1';
                    cBtn.style.pointerEvents = 'auto';
                    cBtn.innerText = 'Compare ' + selected.length + ' Journals';
                } else {
                    cBtn.style.opacity = '0.5';
                    cBtn.style.pointerEvents = 'none';
                    cBtn.innerText = 'Select at least 2 journals';
                }
            }

            window.addJournal = function(id, name, issn) {
                if(selected.length >= 4) return;
                if(selected.find(j => j.id === id)) { alert("Journal already added!"); } 
                else { selected.push({id, name, issn}); updateUI(); }
                cInp.value = '';
                cDd.style.display = 'none';
            };

            window.removeJournal = function(id) {
                selected = selected.filter(j => j.id !== id);
                updateUI();
            };

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

            // Execute pre-selection if passed via URL
            ${preSelectedJs}
        </script>
        `;
    }

    // STATE 2: RESULTS (2 to 4 journals selected)
    const getStats = (ratings) => {
        if (!ratings || ratings.length === 0) return { avg: 0, latest: 0, year: 'N/A' };
        const sum = ratings.reduce((a, b) => a + b.rating, 0);
        return {
            avg: sum / ratings.length,
            latest: ratings[ratings.length - 1].rating,
            year: ratings[ratings.length - 1].year
        };
    };

    const stats = journals.map(j => getStats(j.ratings));

    // Combine all years across all journals to create a unified timeline for the graph and table
    const yearsSet = new Set();
    journals.forEach(j => j.ratings.forEach(r => yearsSet.add(r.year)));
    const allYears = Array.from(yearsSet).sort();

    const getRatingForYear = (ratings, year) => {
        const found = ratings.find(r => r.year === year);
        return found ? found.rating : null;
    };

    // Extract data arrays for each journal aligned perfectly to the unified timeline
    const datasetsData = journals.map(j => allYears.map(y => getRatingForYear(j.ratings, y)));

    // Generate Dynamic Summary Cards
    let summaryCardsHtml = "";
    journals.forEach((j, idx) => {
        summaryCardsHtml += `
        <div class="card" style="border-top: 5px solid ${colors[idx]}; margin: 0; padding: 20px;">
            <div style="font-size: 11px; font-weight: bold; color: ${colors[idx]}; text-transform: uppercase; margin-bottom: 5px;">Journal ${idx + 1}</div>
            <h3 style="margin: 0 0 10px 0; font-size: 15px; color: #333; line-height: 1.3;">${j.name}</h3>
            <div style="font-family: monospace; font-size: 11px; color: #666; margin-bottom: 15px;">ISSN: ${j.issn}</div>
            
            <div style="display: flex; justify-content: space-between; padding-top: 15px; border-top: 1px solid #eee;">
                <div style="text-align: left;">
                    <div style="font-size: 10px; color: #999; text-transform: uppercase; font-weight: bold;">Hist. Avg</div>
                    <div style="font-size: 18px; font-weight: bold; color: #555;">${stats[idx].avg.toFixed(2)}</div>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 10px; color: #999; text-transform: uppercase; font-weight: bold;">Latest (${stats[idx].year})</div>
                    <div style="font-size: 18px; font-weight: bold; color: ${colors[idx]};">${stats[idx].latest.toFixed(2)}</div>
                </div>
            </div>
        </div>`;
    });

    // Generate Dynamic Table Rows (Reverse chronological)
    let tableRowsHtml = "";
    for (let i = allYears.length - 1; i >= 0; i--) {
        const year = allYears[i];
        let rowCells = `<td style="padding: 12px; font-weight: bold;">${year}</td>`;
        
        journals.forEach((j, idx) => {
            const val = datasetsData[idx][i];
            rowCells += `<td style="padding: 12px; text-align: center;">${val !== null ? `<span style="background:${colors[idx]}; color:white; padding:4px 8px; border-radius:4px; font-weight:bold;">${val.toFixed(2)}</span>` : '<span style="color:#ccc">N/A</span>'}</td>`;
        });

        tableRowsHtml += `<tr style="border-bottom: 1px solid #eee;">${rowCells}</tr>`;
    }

    // Dynamic Table Headers
    let tableHeaders = '<th style="padding: 12px; background: #f8f9fa; text-align: left; width: 80px;">Year</th>';
    journals.forEach((j, idx) => {
        tableHeaders += `<th style="padding: 12px; background: #f8f9fa; text-align: center; color: ${colors[idx]}; font-size: 13px;">${j.issn}<br><span style="font-weight:normal; font-size:10px; color:#666;">Journal ${idx+1}</span></th>`;
    });

    // Chart.js JSON structure
    const datasetsJson = journals.map((j, idx) => ({
        label: j.name,
        data: datasetsData[idx],
        borderColor: colors[idx],
        backgroundColor: colors[idx],
        fill: false,
        tension: 0.3,
        pointRadius: 5,
        borderWidth: 3
    }));

    return `
    <style>
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
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:5px; vertical-align:-2px;"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg> Save PDF
        </button>
    </div>

    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 15px; margin-bottom: 25px;">
        ${summaryCardsHtml}
    </div>

    <div class="card">
        <h3 style="margin-top: 0; border-bottom: 2px solid #eee; padding-bottom: 10px;">Longitudinal Comparison (Change in NAAS Rating)</h3>
        <div style="height: 450px; width: 100%;"><canvas id="compareChart"></canvas></div>
    </div>

    <div class="card" style="padding: 0; overflow: hidden;">
        <div style="padding: 15px 20px; border-bottom: 1px solid #eee; background: #fafafa;">
            <h3 style="margin: 0; font-size: 16px;">Comparative Data Matrix</h3>
        </div>
        <div style="overflow-x: auto;">
            <table style="min-width: ${100 + journals.length * 150}px; width: 100%; border-collapse: collapse;">
                <thead>
                    <tr>${tableHeaders}</tr>
                </thead>
                <tbody>
                    ${tableRowsHtml}
                </tbody>
            </table>
        </div>
    </div>

    <script>
        setTimeout(() => {
            const ctx = document.getElementById('compareChart').getContext('2d');
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ${JSON.stringify(allYears)},
                    datasets: ${JSON.stringify(datasetsJson)}
                },
                options: { 
                    responsive: true, 
                    maintainAspectRatio: false,
                    interaction: { mode: 'index', intersect: false },
                    plugins: { 
                        tooltip: { enabled: true },
                        legend: { position: 'top', labels: { usePointStyle: true, padding: 15, font: { size: 11 } } }
                    },
                    scales: { y: { title: { display: true, text: 'NAAS Rating' } } }
                }
            });
        }, 150);
    </script>
    `;
}
