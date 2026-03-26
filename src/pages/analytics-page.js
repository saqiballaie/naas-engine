export function renderAnalyticsPage(data) {
    const ratings = data.ratings || [];
    const n = ratings.length;
    if (n === 0) return `<div class="card">No rating data found for this journal.</div>`;

    const scores = ratings.map(r => r.rating);
    const latestVal = scores[n - 1];
    const avgScore = scores.reduce((a, b) => a + b, 0) / n;
    const stdDev = Math.sqrt(scores.reduce((a, b) => a + Math.pow(b - avgScore, 2), 0) / n);
    const prevVal = n > 1 ? scores[n - 2] : latestVal;
    const yoyChange = latestVal - prevVal;

    return `
    <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
        <a href="/" class="btn" style="background: #6c757d;">← Back</a>
        <div style="display: flex; gap: 10px;">
            <button onclick="window.print()" class="btn" style="background: #17a2b8;">Save PDF</button>
            <a href="/compare?id1=${data.master_id}" class="btn" style="background: var(--accent);">Compare Journal</a>
        </div>
    </div>

    <div class="card">
        <h2 style="color: var(--primary); margin: 0;">${data.name}</h2>
        <div style="display: flex; align-items: center; gap: 10px; margin-top: 10px;">
            <span style="font-family: monospace; color: #666;">ISSN: ${data.issn}</span>
            <a href="https://www.google.com/search?q=ISSN+${data.issn}" target="_blank" class="btn" style="padding: 4px 8px; font-size: 10px; background: #4285F4;">🔍 Search Google</a>
        </div>
    </div>

    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 25px;">
        <div class="card" style="text-align: center; border-left: 5px solid #6c757d; margin: 0; padding: 15px;">
            <small>HISTORICAL AVG</small>
            <div style="font-size: 24px; font-weight: bold;">${avgScore.toFixed(2)}</div>
        </div>
        <div class="card" style="text-align: center; border-left: 5px solid var(--primary); margin: 0; padding: 15px;">
            <small>LATEST RATING</small>
            <div style="font-size: 24px; font-weight: bold; color: var(--primary);">${latestVal.toFixed(2)}</div>
        </div>
        <div class="card" style="text-align: center; border-left: 5px solid var(--accent); margin: 0; padding: 15px;">
            <small>ANNUAL CHANGE</small>
            <div style="font-size: 24px; font-weight: bold; color: var(--accent);">${yoyChange >= 0 ? '+' : ''}${yoyChange.toFixed(2)}</div>
        </div>
        <div class="card" style="text-align: center; border-left: 5px solid var(--success); margin: 0; padding: 15px;">
            <small>STABILITY (STD DEV)</small>
            <div style="font-size: 24px; font-weight: bold; color: var(--success);">${stdDev.toFixed(2)}</div>
        </div>
    </div>

    <div class="card">
        <h3>Performance History</h3>
        <div style="height: 350px;"><canvas id="naasChart"></canvas></div>
    </div>

    <div class="card">
        <h3 style="margin-top: 0;">Decision Matrix & Statistical Summary</h3>
        <div class="table-responsive">
            <table style="width: 100%; border-collapse: collapse;">
                <thead style="background: #f8f9fa;">
                    <tr><th>Metric</th><th>Value</th><th>Target</th><th>Status</th></tr>
                </thead>
                <tbody>
                    <tr><td>Latest vs Average</td><td>${latestVal.toFixed(2)}</td><td>&ge; ${avgScore.toFixed(2)}</td><td>${latestVal >= avgScore ? '✅ PASS' : '⚠️ BELOW AVG'}</td></tr>
                    <tr><td>Year-over-Year Change</td><td>${yoyChange.toFixed(2)}</td><td>&ge; 0.00</td><td>${yoyChange >= 0 ? '📈 GROWING' : '📉 DECLINING'}</td></tr>
                    <tr><td>Volatility Index</td><td>${stdDev.toFixed(2)}</td><td>&lt; 0.30</td><td>${stdDev < 0.30 ? '🛡️ STABLE' : '⚡ VOLATILE'}</td></tr>
                </tbody>
            </table>
        </div>
    </div>

    <script>
        setTimeout(() => {
            new Chart(document.getElementById('naasChart'), {
                type: 'line',
                data: {
                    labels: ${JSON.stringify(ratings.map(r => r.year))},
                    datasets: [{ label: 'NAAS Rating', data: ${JSON.stringify(scores)}, borderColor: '#0056b3', tension: 0.2, fill: false }]
                },
                options: { responsive: true, maintainAspectRatio: false }
            });
        }, 100);
    </script>
    `;
}
