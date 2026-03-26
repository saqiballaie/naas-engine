export function renderAnalyticsPage(data) {
    if (!data || !data.history || data.history.length === 0) {
        return `<div class="card" style="text-align: center; padding: 50px;"><h2>No Data Found</h2><a href="/" class="btn">Return to Search</a></div>`;
    }

    // 1. Prepare Chart Data (Chronological: 2015 -> Current)
    const chartLabels = JSON.stringify(data.history.map(row => row.year));
    const chartData = JSON.stringify(data.history.map(row => row.rating));

    // 2. Prepare Table Data (Calculate Yearly Change and Deviation before reversing)
    const enrichedHistory = data.history.map((row, index, arr) => {
        let yearlyChange = null;
        if (index > 0) {
            yearlyChange = row.rating - arr[index - 1].rating;
        }
        const devFromAvg = row.rating - data.avg_rating;
        return { ...row, yearlyChange, devFromAvg };
    });

    // 3. Prepare Recommendation Logic based on Volatility (CV)
    let recTitle = "Highly Recommended";
    let recText = "This journal shows stable historical ratings, making it a reliable choice for consistent CAS/API score accumulation.";
    let recColor = "#16a34a"; // Green
    let recIcon = "✅";

    if (data.cv > 15) {
        recTitle = "Caution Advised";
        recText = "This journal exhibits high rating volatility. There is a significant risk of sudden score drops in future NAAS assessments.";
        recColor = "#dc2626"; // Red
        recIcon = "⚠️";
    } else if (data.cv > 8) {
        recTitle = "Moderate Fluctuation";
        recText = "This journal has noticeable rating fluctuations. Monitor its trajectory closely before submitting critical manuscripts.";
        recColor = "#b45309"; // Orange
        recIcon = "⚖️";
    }

    return `
    <div style="max-width: 900px; margin: 0 auto;">
        
        <div class="card" style="border-top: 5px solid var(--primary); margin-bottom: 20px; padding: 25px;">
            <h2 style="margin: 0 0 15px 0; color: #0f172a; font-size: 26px;">${data.name}</h2>
            
            <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 15px; margin-bottom: 15px;">
                <div style="font-family: monospace; font-size: 15px; color: #334155; background: #f1f5f9; padding: 6px 12px; border-radius: 6px; border: 1px solid #e2e8f0;">
                    <strong>ISSN:</strong> ${data.issn}
                </div>
                
                <a href="/" class="btn" style="background: #475569; padding: 6px 12px; font-size: 13px;">🔍 New Search</a>
                <a href="/compare?id1=${data.master_id}" class="btn" style="background: #8b5cf6; padding: 6px 12px; font-size: 13px;">📈 Compare</a>
                <a href="https://www.google.com/search?q=ISSN+${data.issn}+Journal" target="_blank" class="btn" style="background: #0284c7; padding: 6px 12px; font-size: 13px;">🛡️ Verify via Google</a>
            </div>
            
            <div style="display: flex; gap: 20px; font-size: 14px; color: #64748b; border-top: 1px solid #f1f5f9; padding-top: 15px;">
                <span><strong>Latest Rating:</strong> <span style="color: var(--primary); font-weight: bold;">${data.latest_rating.toFixed(2)}</span></span>
                <span><strong>10Y Average:</strong> ${data.avg_rating.toFixed(2)}</span>
                <span><strong>Volatility (CV):</strong> ${data.cv.toFixed(2)}%</span>
            </div>
        </div>

        <div class="card" style="margin-bottom: 20px; padding: 20px;">
            <h3 style="margin: 0 0 15px 0; color: #334155; font-size: 16px; text-transform: uppercase;">Historical Trend</h3>
            <div style="position: relative; height: 280px; width: 100%;">
                <canvas id="ratingChart"></canvas>
            </div>
        </div>

        <div class="card" style="margin-bottom: 20px; padding: 0; overflow: hidden;">
            <div style="padding: 15px 20px; background: #f8fafc; border-bottom: 1px solid #e2e8f0;">
                <h3 style="margin: 0; font-size: 16px; color: #334155;">Annual Performance Record</h3>
            </div>
            <div class="table-responsive" style="margin: 0; border: none; max-height: 400px; overflow-y: auto;">
                <table style="margin: 0; width: 100%; text-align: center;">
                    <thead style="position: sticky; top: 0; background: #ffffff; z-index: 1;">
                        <tr>
                            <th style="color: #64748b; font-size: 12px; text-transform: uppercase;">Year</th>
                            <th style="color: #64748b; font-size: 12px; text-transform: uppercase;">Rating</th>
                            <th style="color: #64748b; font-size: 12px; text-transform: uppercase;">Yearly Change</th>
                            <th style="color: #64748b; font-size: 12px; text-transform: uppercase;">Dev. from Avg</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${[...enrichedHistory].reverse().map(row => {
                            // Formatting Yearly Change
                            let changeUI = '<span style="color: #94a3b8;">-</span>';
                            if (row.yearlyChange > 0) changeUI = `<span style="color: #16a34a; font-weight: bold;">+${row.yearlyChange.toFixed(2)}</span>`;
                            else if (row.yearlyChange < 0) changeUI = `<span style="color: #dc2626; font-weight: bold;">${row.yearlyChange.toFixed(2)}</span>`;
                            else if (row.yearlyChange === 0) changeUI = `<span style="color: #64748b;">0.00</span>`;

                            // Formatting Deviation
                            let devUI = '';
                            if (row.devFromAvg > 0) devUI = `<span style="color: #0284c7;">+${row.devFromAvg.toFixed(2)}</span>`;
                            else if (row.devFromAvg < 0) devUI = `<span style="color: #ea580c;">${row.devFromAvg.toFixed(2)}</span>`;
                            else devUI = `<span style="color: #64748b;">0.00</span>`;

                            return `
                            <tr>
                                <td style="font-weight: bold; color: #475569;">${row.year}</td>
                                <td><span style="background: #f1f5f9; padding: 4px 10px; border-radius: 12px; font-weight: 800; color: var(--primary);">${row.rating.toFixed(2)}</span></td>
                                <td>${changeUI}</td>
                                <td>${devUI}</td>
                            </tr>`;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        </div>

        <div class="card" style="border-left: 5px solid ${recColor}; background: #f8fafc; padding: 25px;">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                <span style="font-size: 24px;">${recIcon}</span>
                <h3 style="margin: 0; color: ${recColor}; font-size: 18px;">System Recommendation: ${recTitle}</h3>
            </div>
            <p style="margin: 0; color: #475569; font-size: 15px; line-height: 1.6;">${recText}</p>
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
                        tension: 0.2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { 
                            beginAtZero: false,
                            grid: { color: '#e2e8f0' }
                        },
                        x: { 
                            grid: { display: false }
                        }
                    }
                }
            });
        });
    </script>
    `;
}
