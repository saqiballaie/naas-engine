export function renderAnalyticsPage(data) {
    const allRatings = data.ratings || [];
    const recentRatings = allRatings.slice(-10);
    const n = recentRatings.length;
    
    if (n === 0) return `<div class="card" style="margin-top:20px;">No rating data found for this journal.</div>`;

    const scores = recentRatings.map(r => r.rating);
    const years = recentRatings.map(r => r.year);
    const latestScore = scores[n - 1];
    const avgScore = scores.reduce((a, b) => a + b, 0) / n;
    const stdDev = Math.sqrt(scores.reduce((a, b) => a + Math.pow(b - avgScore, 2), 0) / n);
    const cv = (avgScore > 0) ? (stdDev / avgScore) * 100 : 0;
    
    const recent3 = scores.slice(-3);
    const trend3Yr = recent3.length > 1 ? recent3[recent3.length - 1] - recent3[0] : 0;
    const yoyChange = n > 1 ? scores[n - 1] - scores[n - 2] : 0;

    let recStatus = "", recColor = "", recIcon = "", recText = "";
    if (latestScore >= 6.0 && cv < 15 && trend3Yr >= 0) {
        recStatus = "HIGHLY RECOMMENDED"; recColor = "#15803d"; recIcon = "🌟"; recText = `Strong, stable performance (CV: ${cv.toFixed(1)}%). Excellent choice for manuscript submission.`;
    } else if (latestScore >= 4.0 && cv <= 20 && yoyChange >= -0.5) {
        recStatus = "RECOMMENDED"; recColor = "#0284c7"; recIcon = "✅"; recText = `Solid performance with acceptable volatility. Good target for standard academic publications.`;
    } else if (cv > 25 || trend3Yr <= -1.0 || yoyChange <= -1.0) {
        recStatus = "CAUTION ADVISED"; recColor = "#b45309"; recIcon = "⚠️"; recText = `High volatility detected (CV: ${cv.toFixed(1)}%) or sharp decline. Consider risks before publishing.`;
    } else if (latestScore < 4.0 && trend3Yr <= 0) {
        recStatus = "AVOID / LOW PRIORITY"; recColor = "#dc2626"; recIcon = "🛑"; recText = `Low baseline rating with stagnant/declining momentum. Seek alternative venues.`;
    } else {
        recStatus = "MODERATE / STABLE"; recColor = "#475569"; recIcon = "⚖️"; recText = `Relatively stable but lacks strong upward momentum. Acceptable as a backup option.`;
    }

    const tableRows = recentRatings.map((row, index) => {
        const prevRating = index > 0 ? recentRatings[index - 1].rating : row.rating;
        const changeFromPrev = row.rating - prevRating;
        const changeFromAvg = row.rating - avgScore;
        const yoyColor = changeFromPrev > 0 ? '#15803d' : (changeFromPrev < 0 ? '#dc2626' : '#64748b');
        const avgColor = changeFromAvg > 0 ? '#15803d' : (changeFromAvg < 0 ? '#dc2626' : '#64748b');
        return `<tr><td style="font-weight:bold; color:#334155;">${row.year}</td><td style="font-size:15px; font-weight:800; color:var(--primary);">${row.rating.toFixed(2)}</td><td style="color:${yoyColor}; font-weight:600;">${changeFromPrev > 0 ? '+' : ''}${changeFromPrev.toFixed(2)}</td><td style="color:${avgColor}; font-weight:600;">${changeFromAvg > 0 ? '+' : ''}${changeFromAvg.toFixed(2)}</td></tr>`;
    }).reverse().join('');

    return `
    <div style="margin-bottom: 20px;"><a href="/" class="btn" style="background:#e2e8f0; color:#475569; padding:8px 16px; font-size:13px;">← Back to Search</a></div>
    
    <div class="card" style="border-top: 5px solid var(--primary); padding: 30px;">
        <h2 style="color: #0f172a; margin: 0 0 8px 0; font-size: 28px; line-height: 1.3;">${data.name}</h2>
        
        ${data.altNames && data.altNames.length > 0 ? `
            <div style="font-size: 13px; color: #64748b; margin-bottom: 15px; background: #f8fafc; padding: 8px 12px; border-radius: 6px; border-left: 3px solid #cbd5e1;">
                <span style="font-weight: 700; text-transform: uppercase; font-size: 11px; color: #475569; margin-right: 5px;">Formerly / Also Known As:</span> 
                ${data.altNames.join(' <span style="color:#cbd5e1;">|</span> ')}
            </div>
        ` : ''}

        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 20px; flex-wrap: wrap;">
            <div style="font-family: monospace; color: #334155; font-size: 15px; background: #f1f5f9; padding: 6px 12px; border-radius: 6px; border: 1px solid #e2e8f0;">
                <span style="font-weight:bold; color:#64748b; font-size:11px; font-family:sans-serif; text-transform: uppercase;">Primary ISSN:</span> ${data.issn}
            </div>
            
            ${data.altIssns && data.altIssns.length > 0 ? `
                <div style="font-family: monospace; color: #64748b; font-size: 14px; background: #ffffff; padding: 6px 12px; border-radius: 6px; border: 1px dashed #cbd5e1;">
                    <span style="font-weight:bold; color:#94a3b8; font-size:11px; font-family:sans-serif; text-transform: uppercase;">Other ISSNs:</span> ${data.altIssns.join(', ')}
                </div>
            ` : ''}
        </div>
        
        <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-top: 10px;">
            <a href="https://www.google.com/search?q=ISSN+${data.issn}+Journal" target="_blank" class="btn" style="background: #4285F4;">🔍 Search Google</a>
            <a href="/compare?id1=${data.master_id}" class="btn" style="background: var(--accent);">⚖️ Compare Journal</a>
            <button onclick="window.print()" class="btn" style="background: #475569;">🖨️ Print Report</button>
        </div>
    </div>

    <div class="card" style="border: 2px solid ${recColor}; background: ${recColor}0A; padding: 25px;">
        <div style="font-size: 12px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Algorithmic Verdict</div>
        <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 10px;"><span style="font-size: 32px;">${recIcon}</span><h3 style="margin: 0; color: ${recColor}; font-size: 24px;">${recStatus}</h3></div>
        <p style="margin: 0; color: #334155; font-size: 15px; line-height: 1.6;">${recText}</p>
    </div>

    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 25px;">
        <div class="card" style="text-align: center; margin: 0; padding: 20px;"><small style="color:#64748b; font-weight:bold; display:block; margin-bottom:5px;">LATEST RATING</small><div style="font-size:28px; font-weight:900; color:var(--primary);">${latestScore.toFixed(2)}</div></div>
        <div class="card" style="text-align: center; margin: 0; padding: 20px;"><small style="color:#64748b; font-weight:bold; display:block; margin-bottom:5px;">10-YR AVERAGE</small><div style="font-size:28px; font-weight:900; color:#475569;">${avgScore.toFixed(2)}</div></div>
        <div class="card" style="text-align: center; margin: 0; padding: 20px;"><small style="color:#64748b; font-weight:bold; display:block; margin-bottom:5px;">VOLATILITY (CV)</small><div style="font-size:28px; font-weight:900; color:${cv > 20 ? '#dc2626' : '#15803d'};">${cv.toFixed(1)}%</div></div>
    </div>

    <div class="card"><h3 style="margin-top: 0; color: #334155;">10-Year Trajectory</h3><div style="height: 350px;"><canvas id="naasChart"></canvas></div></div>
    
    <div class="card" style="padding: 0; overflow: hidden;">
        <div style="padding: 15px 20px; background: #f8fafc; border-bottom: 1px solid #e2e8f0;"><h3 style="margin: 0; font-size: 16px; color: #334155;">Historical Data Breakdown</h3></div>
        <div class="table-responsive" style="border: none; border-radius: 0;"><table><thead><tr style="background:#ffffff;"><th style="color:#64748b; text-transform:uppercase; font-size:12px;">Year</th><th style="color:#64748b; text-transform:uppercase; font-size:12px;">NAAS Rating</th><th style="color:#64748b; text-transform:uppercase; font-size:12px;">YoY Change</th><th style="color:#64748b; text-transform:uppercase; font-size:12px;">Vs. Average</th></tr></thead><tbody>${tableRows}</tbody></table></div>
    </div>
    
    <script>
        setTimeout(() => {
            const years = ${JSON.stringify(years)}; const rawScores = ${JSON.stringify(scores)}; const averageArr = Array(years.length).fill(${avgScore.toFixed(2)});
            new Chart(document.getElementById('naasChart'), {
                type: 'line', data: { labels: years, datasets: [
                    { label: 'Actual Rating', data: rawScores, borderColor: '#0056b3', backgroundColor: '#0056b3', borderWidth: 3, pointRadius: 5, tension: 0.1, fill: false, order: 1 },
                    { label: 'Historical Average', data: averageArr, borderColor: '#94a3b8', borderWidth: 2, borderDash: [5, 5], pointRadius: 0, fill: false, order: 2 }
                ]},
                options: { responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false } }
            });
        }, 150);
    </script>
    `;
}
