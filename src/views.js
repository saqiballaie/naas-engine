export function renderSearchBody(searchTerm, min, max, latestYear, results, isSearchSubmitted) {
    const safeResults = JSON.stringify(results || []).replace(/</g, '\\u003c').replace(/`/g, '\\`');
    return `
    <style>
        .quick-filters { display: flex; gap: 10px; margin-top: 20px; flex-wrap: wrap; justify-content: center; }
        .filter-chip { background: var(--primary-light); color: var(--primary); padding: 8px 16px; border-radius: 20px; font-size: 13px; font-weight: 600; cursor: pointer; border: 1px solid rgba(0, 86, 179, 0.2); transition: all 0.2s ease; }
        .filter-chip:hover { background: var(--primary); color: white; border-color: var(--primary); }
    </style>
    <div class="card" style="text-align: center; border-top: 5px solid var(--primary);">
        <h2 style="color: var(--primary); margin-top: 0;">NAAS Insights Engine</h2>
        <form action="/" method="GET" id="search-form" style="max-width: 900px; margin: 0 auto; text-align: left;">
            <div style="margin-bottom: 20px; position: relative;">
                <label style="font-size: 11px; font-weight: 800; color: #666; text-transform: uppercase;">Journal Name or ISSN</label>
                <input type="text" id="main-search" name="search" autocomplete="off" value="${searchTerm}" placeholder="Search across journals..." style="width: 100%; padding: 16px; border: 2px solid var(--border); border-radius: 8px;">
                <div class="autocomplete-dropdown" id="search-dropdown"></div>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; align-items: end;">
                <div>
                    <label style="font-size: 11px; font-weight: bold;">Min Rating</label>
                    <input type="number" step="0.01" name="min_rating" value="${min}" style="width: 100%; padding: 12px; border: 1px solid var(--border); border-radius: 6px;">
                </div>
                <div>
                    <label style="font-size: 11px; font-weight: bold;">Max Rating</label>
                    <input type="number" step="0.01" name="max_rating" value="${max}" style="width: 100%; padding: 12px; border: 1px solid var(--border); border-radius: 6px;">
                </div>
                <button type="submit" class="btn" style="height: 45px;">SEARCH</button>
            </div>
        </form>
    </div>
    ${isSearchSubmitted ? `
    <div class="card" style="padding: 0;">
        <div class="table-responsive">
            <table>
                <thead>
                    <tr style="background: #f8f9fa;">
                        <th>ISSN</th><th>Journal Title</th><th>Latest</th><th>Avg</th><th>Trend</th><th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${results.map(row => `
                    <tr>
                        <td style="font-family: monospace;">${row.ISSN}</td>
                        <td><strong>${row.Name}</strong></td>
                        <td>${row.latest_score ? row.latest_score.toFixed(2) : 'N/A'}</td>
                        <td>${row.calculated_avg ? row.calculated_avg.toFixed(2) : 'N/A'}</td>
                        <td>${(row.latest_score - row.calculated_avg) > 0 ? '↑' : '↓'}</td>
                        <td><a href="/journal?id=${row.master_id}" class="btn" style="padding:5px 10px; font-size:11px;">📊 Metrics</a></td>
                    </tr>`).join('')}
                </tbody>
            </table>
        </div>
    </div>` : ''}
    `;
}

export function renderAnalyticsBody(data) {
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

export function renderCompareBody(journals) {
    const preselected = journals.map(j => ({ id: j.master_id, name: j.name, issn: j.issn }));
    return `
    <div class="card">
        <h2>Compare Journals</h2>
        <p>Add up to 4 journals to see head-to-head performance.</p>
        <div style="background: #fafafa; padding: 20px; border-radius: 8px; border: 1px solid #eee;">
            <div style="position: relative; margin-bottom: 20px;">
                <input type="text" id="compare-search" placeholder="Search to add journal..." style="width: 100%; padding: 12px; border: 2px solid var(--border); border-radius: 6px;">
                <div class="autocomplete-dropdown" id="compare-dropdown"></div>
            </div>
            <ul id="selected-list" style="list-style: none; padding: 0;"></ul>
            <form action="/compare" method="GET" id="compare-form">
                <div id="hidden-inputs"></div>
                <button type="submit" id="compare-btn" class="btn" style="width:100%; display:none;">Compare Now</button>
            </form>
        </div>
    </div>
    
    ${journals.length >= 1 ? `
    <div class="card">
        <h3>Comparison Analysis</h3>
        <div style="height: 400px;"><canvas id="compareChart"></canvas></div>
    </div>` : ''}

    <script>
        let selected = ${JSON.stringify(preselected)};
        function updateUI() {
            const list = document.getElementById('selected-list');
            const hidden = document.getElementById('hidden-inputs');
            list.innerHTML = selected.map(j => '<li style="padding:10px; border-bottom:1px solid #ddd; display:flex; justify-content:space-between;">' + j.name + ' <button type="button" onclick="removeJ(\\''+j.id+'\\')">✖</button></li>').join('');
            hidden.innerHTML = selected.map((j, i) => '<input type="hidden" name="id'+(i+1)+'" value="'+j.id+'">').join('');
            document.getElementById('compare-btn').style.display = selected.length >= 2 ? 'block' : 'none';
        }
        window.removeJ = (id) => { selected = selected.filter(x => x.id !== id); updateUI(); };
        updateUI();

        ${journals.length > 0 ? `
        setTimeout(() => {
            new Chart(document.getElementById('compareChart'), {
                type: 'line',
                data: {
                    labels: ${JSON.stringify(Array.from(new Set(journals.flatMap(j => j.ratings.map(r => r.year)))).sort())},
                    datasets: ${JSON.stringify(journals.map((j, i) => ({
                        label: j.name,
                        data: j.ratings.map(r => r.rating),
                        borderColor: ['#0056b3', '#ff8c00', '#28a745', '#dc3545'][i]
                    })))}
                }
            });
        }, 100);` : ''}
    </script>
    `;
}

export function renderStatisticsBody(stats) {
    const years = JSON.stringify(stats.yearlyTrends.map(d => d.year));
    const avgs = JSON.stringify(stats.yearlyTrends.map(d => d.avg.toFixed(2)));
    const tierLabels = JSON.stringify(stats.distribution.map(d => d.tier));
    const tierValues = JSON.stringify(stats.distribution.map(d => d.value));

    return `
    <div class="card" style="border-top: 5px solid var(--accent);">
        <h2>Global Analytics Dashboard</h2>
        <p>Insights into the entire NAAS ecosystem across 10 years.</p>
    </div>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 20px;">
        <div class="card"><h3>Avg Score Trend</h3><div style="height: 300px;"><canvas id="trendChart"></canvas></div></div>
        <div class="card"><h3>Tier Distribution</h3><div style="height: 300px;"><canvas id="pieChart"></canvas></div></div>
    </div>
    <div class="card">
        <h3>Top 10 Performers (${stats.latestYear})</h3>
        <div class="table-responsive">
            <table>
                <thead><tr style="background:#eee;"><th>Rank</th><th>Journal Name</th><th>Score</th></tr></thead>
                <tbody>
                    ${stats.topJournals.map((j, i) => `<tr><td>${i+1}</td><td>${j.name}</td><td><strong>${j.rating.toFixed(2)}</strong></td></tr>`).join('')}
                </tbody>
            </table>
        </div>
    </div>
    <script>
        setTimeout(() => {
            new Chart(document.getElementById('trendChart'), { type: 'line', data: { labels: ${years}, datasets: [{label: 'Avg Rating', data: ${avgs}, borderColor: '#0056b3'}] }});
            new Chart(document.getElementById('pieChart'), { type: 'pie', data: { labels: ${tierLabels}, datasets: [{data: ${tierValues}, backgroundColor: ['#0056b3', '#28a745', '#ff8c00', '#dc3545']}] }});
        }, 100);
    </script>
    `;
}
