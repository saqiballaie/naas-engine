export function renderAnalyticsPage(data) {
    // Generate dynamic labels and data arrays for the chart based on what the DB actually returns
    const chartLabels = JSON.stringify(data.history.map(row => row.year));
    const chartData = JSON.stringify(data.history.map(row => row.rating));

    return `
    <div style="max-width: 1000px; margin: 0 auto;">
        <div class="card" style="border-top: 5px solid var(--primary); margin-bottom: 25px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 20px;">
                <div>
                    <h2 style="margin: 0 0 10px 0; color: #0f172a; font-size: 24px;">${data.name}</h2>
                    <div style="display: flex; gap: 15px; align-items: center; font-family: monospace; color: #475569; font-size: 14px;">
                        <span><strong>ISSN:</strong> ${data.issn}</span>
                        <span style="color: #cbd5e1;">|</span>
                        <span><strong>ID:</strong> ${data.master_id}</span>
                    </div>
                </div>
                
                <a href="https://www.google.com/search?q=ISSN+${data.issn}+Journal" target="_blank" rel="noopener noreferrer" class="btn" style="background: #0284c7; display: flex; align-items: center; gap: 8px;">
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/></svg>
                    Verify via ISSN (Google)
                </a>
            </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 25px;">
            <div class="card" style="margin: 0; text-align: center; padding: 20px;">
                <h4 style="margin: 0 0 10px 0; color: #64748b; font-size: 12px; text-transform: uppercase;">Latest NAAS Rating</h4>
                <div style="font-size: 36px; font-weight: 900; color: var(--primary);">${data.latest_rating ? data.latest_rating.toFixed(2) : 'N/A'}</div>
            </div>
            <div class="card" style="margin: 0; text-align: center; padding: 20px;">
                <h4 style="margin: 0 0 10px 0; color: #64748b; font-size: 12px; text-transform: uppercase;">Historical Average</h4>
                <div style="font-size: 32px; font-weight: 700; color: #334155;">${data.avg_rating ? data.avg_rating.toFixed(2) : 'N/A'}</div>
            </div>
            <div class="card" style="margin: 0; text-align: center; padding: 20px; border-bottom: 4px solid ${data.volatility_color};">
                <h4 style="margin: 0 0 10px 0; color: #64748b; font-size: 12px; text-transform: uppercase;">Volatility Status</h4>
                <div style="font-size: 20px; font-weight: 800; color: ${data.volatility_color}; margin-bottom: 5px;">${data.volatility_status}</div>
                <div style="font-size: 12px; color: #94a3b8;">CV: ${data.cv ? data.cv.toFixed(1) + '%' : 'N/A'}</div>
            </div>
        </div>

        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 25px;">
            
            <div class="card" style="margin: 0;">
                <h3 style="margin-top: 0; color: #334155;">Longitudinal Trend</h3>
                <canvas id="ratingChart" height="250"></canvas>
            </div>

            <div class="card" style="margin: 0; padding: 0; overflow: hidden;">
                <h3 style="margin: 20px; color: #334155;">Data Record</h3>
                <div class="table-responsive" style="margin: 0; border: none; max-height: 350px; overflow-y: auto;">
                    <table style="margin: 0;">
                        <thead style="position: sticky; top: 0; background: #f8fafc; z-index: 1;">
                            <tr>
                                <th style="color: #64748b;">Year</th>
                                <th style="text-align: right; color: #64748b;">Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.history.reverse().map(row => `
                                <tr>
                                    <td style="font-weight: 600; color: #475569;">${row.year}</td>
                                    <td style="text-align: right; font-weight: bold; color: var(--primary);">${row.rating.toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        
        <div style="margin-top: 25px; text-align: center;">
            <a href="/" class="btn" style="background: #64748b;">← Back to Search</a>
            <a href="/compare?id1=${data.master_id}" class="btn" style="margin-left: 10px;">Compare to Another Journal 📈</a>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const ctx = document.getElementById('ratingChart').getContext('2d');
            
            // These arrays are now dynamically populated from 2015 to current
            const labels = ${chartLabels};
            const chartData = ${chartData};

            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'NAAS Rating',
                        data: chartData,
                        borderColor: '#2563eb',
                        backgroundColor: 'rgba(37, 99, 235, 0.1)',
                        borderWidth: 3,
                        pointBackgroundColor: '#ffffff',
                        pointBorderColor: '#2563eb',
                        pointBorderWidth: 2,
                        pointRadius: 4,
                        fill: true,
                        tension: 0.3
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: '#1e293b',
                            padding: 12,
                            titleFont: { size: 14 },
                            bodyFont: { size: 16, weight: 'bold' },
                            displayColors: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: false,
                            grid: { color: '#e2e8f0', drawBorder: false }
                        },
                        x: {
                            grid: { display: false, drawBorder: false }
                        }
                    }
                }
            });
        });
    </script>
    `;
}
