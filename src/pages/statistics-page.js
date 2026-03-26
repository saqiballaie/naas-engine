export function renderStatisticsPage(stats) {
    const years = JSON.stringify(stats.yearlyTrends.map(d => d.year));
    const avgs = JSON.stringify(stats.yearlyTrends.map(d => d.avg_rating.toFixed(2)));
    const tierLabels = JSON.stringify(stats.distribution.map(d => d.tier));
    const tierValues = JSON.stringify(stats.distribution.map(d => d.count));

    return `
    <div class="card" style="border-top: 5px solid var(--accent);">
        <h2>Global Analytics Dashboard</h2>
        <p>Insights into the entire NAAS ecosystem across all recorded years.</p>
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
                    ${stats.topJournals.map((j, i) => `<tr><td>${i+1}</td><td>${j.Name}</td><td><strong>${j.rating.toFixed(2)}</strong></td></tr>`).join('')}
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
