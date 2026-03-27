export function renderComparePage(journals) {
    const preselected = journals.map(j => ({ id: j.master_id, name: j.name, issn: j.issn }));
    const chartColors = ['#0056b3', '#ff8c00', '#28a745', '#dc3545', '#8b5cf6'];
    let processedJournals = []; let allYearsSet = new Set();

    journals.forEach((j, index) => {
        const recentRatings = (j.ratings || []).slice(-10);
        recentRatings.forEach(r => allYearsSet.add(r.year));
        const n = recentRatings.length;
        if (n === 0) return;
        const scores = recentRatings.map(r => r.rating);
        const latestScore = scores[n - 1];
        const avgScore = scores.reduce((a, b) => a + b, 0) / n;
        const stdDev = Math.sqrt(scores.reduce((a, b) => a + Math.pow(b - avgScore, 2), 0) / n);
        const cv = (avgScore > 0) ? (stdDev / avgScore) * 100 : 0;
        const publishScore = latestScore - (cv * 0.05);
        const ratingsByYear = {};
        recentRatings.forEach(r => { ratingsByYear[r.year] = r.rating; });
        processedJournals.push({ ...j, color: chartColors[index], latestScore, avgScore, cv, publishScore, ratingsByYear });
    });

    const sortedYearsDesc = Array.from(allYearsSet).sort((a, b) => b - a);
    const sortedYearsAsc = Array.from(allYearsSet).sort((a, b) => a - b);

    const safePreselected = escapeHTML(JSON.stringify(preselected));
    const safeLabels = escapeHTML(JSON.stringify(sortedYearsAsc));
    const safeDatasets = escapeHTML(JSON.stringify(processedJournals.map((j) => { 
        return { label: j.name, data: sortedYearsAsc.map(y => j.ratingsByYear[y] || null), borderColor: j.color, backgroundColor: j.color, tension: 0.1, pointRadius: 4, borderWidth: 2, spanGaps: true }; 
    })));

    let recommendationHTML = "";
    if (processedJournals.length > 1) {
        const ranked = [...processedJournals].sort((a, b) => b.publishScore - a.publishScore);
        const best = ranked[0]; const secondBest = ranked[1];
        let recText = `Based on the comparative analysis, <strong>${best.name}</strong> is the strongest candidate. It offers the best balance of a high current NAAS rating (${best.latestScore.toFixed(2)}) and manageable historical volatility (${best.cv.toFixed(1)}%). `;
        if (best.cv > 20 && secondBest && secondBest.cv < 15) recText += `However, please note it has high volatility. If stability is your primary concern, <strong>${secondBest.name}</strong> (CV: ${secondBest.cv.toFixed(1)}%) might be a safer alternative.`;
        recommendationHTML = `<div class="card" style="border: 2px solid #15803d; background: #f0fdf4; padding: 25px;"><div style="font-size: 12px; font-weight: 800; color: #166534; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Algorithmic Recommendation</div><div style="display: flex; align-items: flex-start; gap: 15px;"><span style="font-size: 32px; line-height: 1;">🏆</span><p style="margin: 0; color: #166534; font-size: 15px; line-height: 1.6;">${recText}</p></div></div>`;
    }

    return `
    <div id="compare-state" data-preselected="${safePreselected}" style="display:none;"></div>
    <div class="card" style="border-top: 5px solid var(--accent);"><h2 style="margin-top: 0; color: #334155;">Compare Journals</h2>
    
    ${processedJournals.length >= 1 ? `
    ${recommendationHTML}
    <div class="card" style="padding: 0; overflow: hidden;"><div style="padding: 15px 20px; background: #f8fafc; border-bottom: 1px solid #e2e8f0;"><h3 style="margin: 0; font-size: 16px; color: #334155;">Key Performance Metrics</h3></div><div class="table-responsive" style="border: none; border-radius: 0;"><table><thead><tr style="background: #ffffff;"><th style="color: #64748b; font-size: 12px; text-transform: uppercase;">Journal</th><th style="color: #64748b; font-size: 12px; text-transform: uppercase;">Latest Rating</th><th style="color: #64748b; font-size: 12px; text-transform: uppercase;">10-Yr Avg</th><th style="color: #64748b; font-size: 12px; text-transform: uppercase;">Volatility (CV)</th></tr></thead><tbody>${processedJournals.map(j => `<tr><td><div style="display: flex; align-items: center; gap: 8px;"><div style="width: 12px; height: 12px; border-radius: 3px; background: ${j.color};"></div><strong style="color: #1e293b;">${j.name}</strong></div></td><td><span style="font-weight: 800; color: var(--primary);">${j.latestScore.toFixed(2)}</span></td><td style="color: #475569; font-weight: 600;">${j.avgScore.toFixed(2)}</td><td><span style="font-weight: 600; color: ${j.cv > 20 ? '#dc2626' : (j.cv < 10 ? '#15803d' : '#b45309')};">${j.cv.toFixed(1)}%</span></td></tr>`).join('')}</tbody></table></div></div>
   <div class="card"><h3 style="margin-top: 0; color: #334155;">Historical Trajectory</h3><div style="height: 400px;"><canvas id="compareChart" data-chart="true" data-chart-type="line" data-labels="${safeLabels}" data-datasets="${safeDatasets}"></canvas></div></div>
   <div class="card" style="padding: 0; overflow: hidden;"><div style="padding: 15px 20px; background: #f8fafc; border-bottom: 1px solid #e2e8f0;"><h3 style="margin: 0; font-size: 16px; color: #334155;">10-Year Historical Data</h3></div><div class="table-responsive" style="border: none; border-radius: 0;"><table><thead><tr style="background: #ffffff;"><th style="color: #64748b; font-size: 12px; text-transform: uppercase; width: 80px;">Year</th>${processedJournals.map(j => `<th style="color: #1e293b; font-size: 12px;">${j.name}</th>`).join('')}</tr></thead><tbody>${sortedYearsDesc.map(year => `<tr><td style="font-weight: bold; color: #475569;">${year}</td>${processedJournals.map(j => {const rating = j.ratingsByYear[year]; return `<td style="color: ${rating ? '#334155' : '#cbd5e1'}; font-weight: ${rating ? '600' : 'normal'};">${rating ? rating.toFixed(2) : '-'}</td>`;}).join('')}</tr>`).join('')}</tbody></table></div></div>` : ''}
    `;
}
