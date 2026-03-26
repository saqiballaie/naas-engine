export function renderSearchBody(searchTerm, min, max, latestYear, results, isSearchSubmitted) {
    return `
    <div class="card" style="text-align: center; border-top: 5px solid var(--primary);">
        <h2 style="color: var(--primary); margin: 0 0 15px;">NAAS Insights Engine</h2>
        <form action="/" method="GET" style="max-width: 900px; margin: 0 auto; text-align: left;">
            <div style="margin-bottom: 20px;">
                <label style="font-size: 11px; font-weight: 800; color: #666;">JOURNAL NAME OR ISSN</label>
                <input type="text" id="main-search" name="search" value="${searchTerm}" placeholder="Search 3,500+ journals..." style="width: 100%; padding: 15px; border: 2px solid var(--border); border-radius: 8px;">
                <div class="autocomplete-dropdown" id="search-dropdown"></div>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px;">
                <div><label>Min Rating</label><input type="number" step="0.01" name="min_rating" value="${min}" style="width:100%; padding:10px;"></div>
                <div><label>Max Rating</label><input type="number" step="0.01" name="max_rating" value="${max}" style="width:100%; padding:10px;"></div>
                <button type="submit" class="btn">SEARCH</button>
            </div>
        </form>
    </div>
    ${isSearchSubmitted ? `
    <div class="card" style="padding: 0;">
        <div class="table-responsive">
            <table>
                <thead><tr><th>ISSN</th><th>Journal Title</th><th>Latest</th><th>Avg</th><th>Actions</th></tr></thead>
                <tbody>${results.map(r => `<tr><td>${r.ISSN}</td><td><strong>${r.Name}</strong></td><td>${r.latest_score?.toFixed(2)||'N/A'}</td><td>${r.calculated_avg?.toFixed(2)||'N/A'}</td><td><a href="/journal?id=${r.master_id}" class="btn" style="font-size:11px;">📊 Metrics</a></td></tr>`).join('')}</tbody>
            </table>
        </div>
    </div>` : ''}`;
}

export function renderAnalyticsBody(data) {
    const r = data.ratings || []; const n = r.length;
    if (n === 0) return `<div class="card">No data.</div>`;
    const scores = r.map(x => x.rating); const latest = scores[n-1]; const avg = scores.reduce((a,b)=>a+b,0)/n;
    const std = Math.sqrt(scores.reduce((a,b)=>a+Math.pow(b-avg,2),0)/n);
    const yoy = n > 1 ? latest - scores[n-2] : 0;

    return `
    <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
        <a href="/" class="btn" style="background: #6c757d;">← Back</a>
        <a href="/compare?id1=${data.master_id}" class="btn" style="background: var(--accent);">Compare Journal</a>
    </div>
    <div class="card">
        <h2 style="color: var(--primary); margin: 0;">${data.name}</h2>
        <div style="display: flex; align-items: center; gap: 10px; margin-top: 10px;">
            <span style="font-family: monospace;">ISSN: ${data.issn}</span>
            <a href="https://www.google.com/search?q=ISSN+${data.issn}" target="_blank" class="btn" style="padding:4px 8px; font-size:10px; background:#4285F4;">🔍 Google Search</a>
        </div>
    </div>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 25px;">
        <div class="card" style="text-align: center; border-left: 5px solid #6c757d; margin: 0; padding: 15px;"><small>HISTORICAL AVG</small><div style="font-size: 24px; font-weight: bold;">${avg.toFixed(2)}</div></div>
        <div class="card" style="text-align: center; border-left: 5px solid var(--primary); margin: 0; padding: 15px;"><small>LATEST RATING</small><div style="font-size: 24px; font-weight: bold; color: var(--primary);">${latest.toFixed(2)}</div></div>
        <div class="card" style="text-align: center; border-left: 5px solid var(--accent); margin: 0; padding: 15px;"><small>ANNUAL CHANGE</small><div style="font-size: 24px; font-weight: bold; color: var(--accent);">${yoy>=0?'+':''}${yoy.toFixed(2)}</div></div>
        <div class="card" style="text-align: center; border-left: 5px solid var(--success); margin: 0; padding: 15px;"><small>STABILITY (STD DEV)</small><div style="font-size: 24px; font-weight: bold; color: var(--success);">${std.toFixed(2)}</div></div>
    </div>
    <div class="card"><h3>Performance History</h3><div style="height: 350px;"><canvas id="naasChart"></canvas></div></div>
    <div class="card">
        <h3 style="margin-top: 0;">Decision Matrix & Statistical Summary</h3>
        <div class="table-responsive">
            <table style="width: 100%;">
                <thead><tr><th>Metric</th><th>Value</th><th>Target</th><th>Status</th></tr></thead>
                <tbody>
                    <tr><td>Latest vs Average</td><td>${latest.toFixed(2)}</td><td>&ge; ${avg.toFixed(2)}</td><td>${latest>=avg?'✅ PASS':'⚠️ BELOW AVG'}</td></tr>
                    <tr><td>YoY Momentum</td><td>${yoy.toFixed(2)}</td><td>&ge; 0.00</td><td>${yoy>=0?'📈 GROWING':'📉 DECLINING'}</td></tr>
                    <tr><td>Volatility Index</td><td>${std.toFixed(2)}</td><td>&lt; 0.30</td><td>${std<0.30?'🛡️ STABLE':'⚡ VOLATILE'}</td></tr>
                </tbody>
            </table>
        </div>
    </div>
    <script>setTimeout(() => { new Chart(document.getElementById('naasChart'), { type: 'line', data: { labels: ${JSON.stringify(r.map(x=>x.year))}, datasets: [{label: 'Rating', data: ${JSON.stringify(scores)}, borderColor: '#0056b3', tension: 0.2}] }, options: { responsive: true, maintainAspectRatio: false } }); }, 100);</script>`;
}

export function renderCompareBody(journals) {
    const pre = journals.map(j => ({ id: j.master_id, name: j.name }));
    return `
    <div class="card">
        <h2>Comparison Engine</h2>
        <div style="background: #fafafa; padding: 20px; border-radius: 8px;">
            <input type="text" id="compare-search" placeholder="Search to add journal..." style="width: 100%; padding: 12px; border: 2px solid var(--border); border-radius: 6px;">
            <div class="autocomplete-dropdown" id="compare-dropdown"></div>
            <ul id="selected-list" style="list-style: none; padding: 0; margin-top: 15px;"></ul>
            <form action="/compare" method="GET" id="compare-form">
                <div id="hidden-inputs"></div>
                <button type="submit" id="compare-btn" class="btn" style="width:100%; display:none; background:var(--accent);">Compare Selected</button>
            </form>
        </div>
    </div>
    ${journals.length >= 1 ? `<div class="card"><h3>Head-to-Head Trend</h3><div style="height: 400px;"><canvas id="compareChart"></canvas></div></div>` : ''}
    <script>
        let selected = ${JSON.stringify(pre)};
        function updateUI() {
            document.getElementById('selected-list').innerHTML = selected.map(j => '<li style="padding:10px; border-bottom:1px solid #ddd; display:flex; justify-content:space-between;">' + j.name + ' <button type="button" onclick="removeJ(\\''+j.id+'\\')">✖</button></li>').join('');
            document.getElementById('hidden-inputs').innerHTML = selected.map((j, i) => '<input type="hidden" name="id'+(i+1)+'" value="'+j.id+'">').join('');
            document.getElementById('compare-btn').style.display = selected.length >= 2 ? 'block' : 'none';
        }
        window.removeJ = (id) => { selected = selected.filter(x => x.id !== id); updateUI(); };
        updateUI();
        ${journals.length > 0 ? `setTimeout(() => { new Chart(document.getElementById('compareChart'), { type: 'line', data: { labels: ${JSON.stringify(Array.from(new Set(journals.flatMap(j=>j.ratings.map(x=>x.year)))).sort())}, datasets: ${JSON.stringify(journals.map((j, i) => ({ label: j.name, data: j.ratings.map(x=>x.rating), borderColor: ['#0056b3','#ff8c00','#28a745','#dc3545'][i] })))} } }); }, 100);` : ''}
    </script>`;
}

export function renderStatisticsBody(stats) {
    const years = JSON.stringify(stats.yearlyTrends.map(d => d.year));
    const avgs = JSON.stringify(stats.yearlyTrends.map(d => d.avg.toFixed(2)));
    const counts = JSON.stringify(stats.yearlyTrends.map(d => d.count));
    const tierLabels = JSON.stringify(stats.distribution.map(d => d.tier));
    const tierValues = JSON.stringify(stats.distribution.map(d => d.value));

    return `
    <div class="card" style="border-top: 5px solid var(--accent); text-align:center;">
        <h2 style="margin:0;">NAAS Global Insights Dashboard</h2>
        <p style="color:#666;">Annual performance metrics across the entire indexing ecosystem.</p>
    </div>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px; margin-bottom: 25px;">
        <div class="card"><h3>Avg Score Trend (10-Yr)</h3><div style="height: 250px;"><canvas id="trendChart"></canvas></div></div>
        <div class="card"><h3>Journal Count by Year</h3><div style="height: 250px;"><canvas id="countChart"></canvas></div></div>
        <div class="card"><h3>Tier Distribution (${stats.latestYear})</h3><div style="height: 250px;"><canvas id="pieChart"></canvas></div></div>
    </div>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 20px;">
        <div class="card">
            <h3>Top 10 Performers (${stats.latestYear})</h3>
            <div class="table-responsive"><table>
                <thead><tr><th>Rank</th><th>Journal Name</th><th>Rating</th></tr></thead>
                <tbody>${stats.topJournals.map((j, i) => `<tr><td>${i+1}</td><td>${j.name}</td><td><span style="background:var(--primary); color:white; padding:2px 6px; border-radius:4px;">${j.rating.toFixed(2)}</span></td></tr>`).join('')}</tbody>
            </table></div>
        </div>
        <div class="card">
            <h3>Consistency Index (Stability)</h3>
            <p style="font-size:12px; color:#777;">Journals with the lowest variance in scores over the last 5+ years.</p>
            <div class="table-responsive"><table>
                <thead><tr><th>Journal</th><th>Avg Rating</th><th>Volatility</th></tr></thead>
                <tbody>${stats.stability.map(j => `<tr><td>${j.name}</td><td>${j.avg_rating.toFixed(2)}</td><td><span style="color:var(--success); font-weight:bold;">🛡️ LOW</span></td></tr>`).join('')}</tbody>
            </table></div>
        </div>
    </div>
    <script>
        setTimeout(() => {
            new Chart(document.getElementById('trendChart'), { type: 'line', data: { labels: ${years}, datasets: [{label: 'Avg Rating', data: ${avgs}, borderColor: '#0056b3', fill: true, backgroundColor: 'rgba(0,86,179,0.05)'}] } });
            new Chart(document.getElementById('countChart'), { type: 'bar', data: { labels: ${years}, datasets: [{label: 'Indexed Journals', data: ${counts}, backgroundColor: '#ff8c00'}] } });
            new Chart(document.getElementById('pieChart'), { type: 'pie', data: { labels: ${tierLabels}, datasets: [{data: ${tierValues}, backgroundColor: ['#0056b3', '#28a745', '#ff8c00', '#dc3545']}] } });
        }, 150);
    </script>`;
}
