export function renderAnalyticsPage(data) {
    // 1. Safely handle cases where a journal might have no history yet
    if (!data || !data.history || data.history.length === 0) {
        return `
        <div class="card" style="text-align: center; padding: 50px; max-width: 800px; margin: 0 auto; border-top: 5px solid #dc2626;">
            <h2 style="font-size: 40px; margin: 0;">⚠️</h2>
            <h2 style="color: #dc2626;">No Historical Data Found</h2>
            <p style="color: #64748b;">There are no NAAS ratings recorded for <strong>${data.name || 'this journal'}</strong> in our database.</p>
            <a href="/" class="btn" style="margin-top: 20px;">Return to Search</a>
        </div>`;
    }

    // 2. Prepare data for the Chart (Chronological Order: 2015 -> Current)
    const chartLabels = JSON.stringify(data.history.map(row => row.year));
    const chartData = JSON.stringify(data.history.map(row => row.rating));

    return `
    <div style="max-width: 1000px; margin: 0 auto;">
        
        <div class="card" style="border-top: 5px solid var(--primary); margin-bottom: 25px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 20px;">
                <div>
                    <h2 style="margin: 0 0 10px 0; color: #0f172a; font-size: 24px;">${data.name}</h2>
                    <div style="display: flex; gap: 15px; align-items: center; font-family: monospace; color: #475569; font-size: 14px;">
                        <span style="background: #f1f5f9; padding: 4px 8px; border-radius: 4px;"><strong>ISSN:</strong> ${data.issn}</span>
                        <span style="color: #cbd5e1;">|</span>
                        <span><strong>Database ID:</strong> ${data.master_id}</span>
                    </div>
                </div>
                
                <a href="https://www.google.com/search?q=ISSN+${data.issn}+Journal" target="_blank" rel="noopener noreferrer" class="btn" style="background: #0284c7; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 6px -1px rgba(2, 132, 199, 0.2);">
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
                <h4 style="margin: 0 0 10px 0; color: #64748b; font-size: 12px; text-transform: uppercase;">Volatility Index</h4>
                <div style="font-size: 20px; font-weight: 800; color: ${data.volatility_color}; margin-bottom: 5px;">${data.volatility_status}</div>
                <div style="font-size: 12px; color: #94a3b8;">CV: ${data.cv ? data.cv.toFixed(2) + '%' : 'N/A'}</div>
            </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 25px;">
            
            <div class="card" style="margin: 0; grid-column: span 2;">
                <h3 style="margin-top: 0; color: #334155;">Longitudinal Trend (All Available Years)</h3>
                <div style="position: relative; height: 300px; width: 100%;">
                    <canvas id="ratingChart"></canvas>
                </div>
            </div>

            <div class="card" style="margin: 0; padding: 0; overflow: hidden; grid-column: span 1;">
                <h3 style="margin: 20px; color: #334155;">Data Record</h3>
                <div class="table-responsive" style="margin: 0; border: none; max-height: 300px; overflow-y: auto;">
                    <table style="margin: 0;">
                        <thead style="position: sticky; top: 0; background: #f8fafc; z-index: 1;">
                            <tr>
                                <th style="color: #64748b; font-size: 12px; text-transform: uppercase;">Year</th>
                                <th style="text-align: right; color: #64748b; font-size: 12px; text-transform: uppercase;">Rating</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${[...data.history].reverse().map(row => `
                                <tr>
                                    <td style="font-weight: 600; color: #475569;">${row.year}</td>
                                    <td style="text-align: right; font-weight: 800; color: var(--primary);">${row.rating.toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        
        <div style="margin-top: 30px; text-align: center; padding-bottom: 40px;">
            <a href="/" class="btn" style="background: #64748b; padding: 12px 24px;">← Back to Search</a>
            <a href="/compare?id1=${data.master_id}" class="btn" style="margin-left: 15px; padding: 12px 24px;">Compare Journal 📈</a>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const canvas = document.getElementById('ratingChart');
            if (!canvas) return;
            
            const ctx = canvas.getContext('2d');
            
            const labels = ${chartLabels};
            const chartData = ${chartData};

            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'NAAS Score',
                        data: chartData,
                        borderColor: '#2563eb',
                        backgroundColor: 'rgba(37, 99, 235, 0.1)',
                        borderWidth: 3,
                        pointBackgroundColor: '#ffffff',
                        pointBorderColor: '#2563eb',
                        pointBorderWidth: 2,
                        pointRadius: 5,
                        pointHoverRadius: 7,
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
                            displayColors: false,
                            callbacks: {
                                label: function(context) {
                                    return 'Rating: ' + context.parsed.y.toFixed(2);
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: false,
                            grid: { color: '#e2e8f0', drawBorder: false },
                            ticks: { font: { size: 12 }, color: '#64748b' }
                        },
                        x: {
                            grid: { display: false, drawBorder: false },
                            ticks: { font: { size: 12, weight: 'bold' }, color: '#475569' }
                        }
                    }
                }
            });
        });
    </script>
    `;
}
