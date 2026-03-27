export function renderStatisticsPage(stats) {
    // Prepare Data Attributes for Charts safely
    const safeTrendLabels = escapeHTML(JSON.stringify(stats.yearlyTrends.map(d => d.year)));
    const safeTrendDatasets = escapeHTML(JSON.stringify([{
        label: 'Ecosystem Avg Rating', 
        data: stats.yearlyTrends.map(d => d.avg_rating.toFixed(2)), 
        borderColor: '#0056b3', backgroundColor: 'rgba(0, 86, 179, 0.1)', fill: true, tension: 0.3
    }]));
    
    const safePieLabels = escapeHTML(JSON.stringify([...stats.distribution.map(d => d.tier), 'No Rating']));
    const safePieDatasets = escapeHTML(JSON.stringify([{
        data: [...stats.distribution.map(d => d.count), stats.unratedCount], 
        backgroundColor: ['#1d4ed8', '#16a34a', '#ca8a04', '#dc2626', '#94a3b8']
    }]));

    const totalActive = stats.distribution.reduce((sum, d) => sum + d.count, 0);

    return `
    <div class="card" style="border-top: 5px solid var(--primary); background: linear-gradient(to right, #ffffff, #f8fafc);">
        <h2 style="margin-top: 0; color: #0f172a; font-size: 26px;">Global NAAS Ecosystem Dashboard</h2>
        <p style="color: #475569; font-size: 15px; margin-bottom: 25px;">Macro-level statistical analysis of journal performance, additions, and removals for the year <strong>${stats.latestYear}</strong>.</p>
        
        <div style="display: flex; flex-wrap: wrap; gap: 15px;">
            <div style="flex: 1; min-width: 150px; background: #f1f5f9; padding: 15px; border-radius: 8px; border-left: 4px solid var(--primary);">
                <small style="color: #64748b; font-weight: bold; text-transform: uppercase;">Total Active</small>
                <div style="font-size: 24px; font-weight: 900; color: #0f172a;">${totalActive}</div>
            </div>
            <div style="flex: 1; min-width: 150px; background: #f0fdf4; padding: 15px; border-radius: 8px; border-left: 4px solid #16a34a;">
                <small style="color: #64748b; font-weight: bold; text-transform: uppercase;">New Additions</small>
                <div style="font-size: 24px; font-weight: 900; color: #166534;">+${stats.added.length}</div>
            </div>
            <div style="flex: 1; min-width: 150px; background: #fef2f2; padding: 15px; border-radius: 8px; border-left: 4px solid #dc2626;">
                <small style="color: #64748b; font-weight: bold; text-transform: uppercase;">Removed/Dropped</small>
                <div style="font-size: 24px; font-weight: 900; color: #991b1b;">-${stats.removed.length}</div>
            </div>
            <div style="flex: 1; min-width: 150px; background: #f8fafc; padding: 15px; border-radius: 8px; border-left: 4px solid #94a3b8;">
                <small style="color: #64748b; font-weight: bold; text-transform: uppercase;">Unrated Journals</small>
                <div style="font-size: 24px; font-weight: 900; color: #475569;">${stats.unratedCount}</div>
            </div>
        </div>
    </div>

    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 20px; margin-bottom: 25px;">
        <div class="card" style="margin: 0;">
            <h3 style="margin-top: 0; color: #334155;">Average Score Trend</h3>
            <div style="height: 300px;">
                <canvas id="trendChart" data-chart="true" data-chart-type="line" data-labels="${safeTrendLabels}" data-datasets="${safeTrendDatasets}"></canvas>
            </div>
        </div>
        <div class="card" style="margin: 0;">
            <h3 style="margin-top: 0; color: #334155;">${stats.latestYear} Tier Distribution</h3>
            <div style="height: 300px;">
                <canvas id="pieChart" data-chart="true" data-chart-type="doughnut" data-labels="${safePieLabels}" data-datasets="${safePieDatasets}"></canvas>
            </div>
        </div>
    </div>

    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 20px; margin-bottom: 25px;">
        
        <div class="card" style="margin: 0; padding: 0; overflow: hidden;">
            <div style="padding: 15px 20px; background: #f0fdf4; border-bottom: 1px solid #bbf7d0;">
                <h3 style="margin: 0; font-size: 16px; color: #166534;">🏆 Top 10 Gainers (Vs. Historical Avg)</h3>
            </div>
            <div class="table-responsive" style="border: none; border-radius: 0;">
                <table>
                    <thead>
                        <tr style="background: #ffffff;">
                            <th style="color: #64748b; font-size: 11px; text-transform: uppercase;">Journal</th>
                            <th style="color: #64748b; font-size: 11px; text-transform: uppercase;">Latest</th>
                            <th style="color: #64748b; font-size: 11px; text-transform: uppercase;">Growth</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${stats.topPerformers.map(j => `
                        <tr>
                            <td><a href="/journal?id=${j.master_id}" style="color: #1e293b; text-decoration: none; font-weight: 600;">${j.Name}</a></td>
                            <td style="font-weight: 800; color: var(--primary);">${j.latest_rating.toFixed(2)}</td>
                            <td><span style="color: #15803d; font-weight: bold; background: #dcfce3; padding: 2px 6px; border-radius: 4px;">+${j.pct_change.toFixed(1)}%</span></td>
                        </tr>`).join('')}
                    </tbody>
                </table>
            </div>
        </div>

        <div class="card" style="margin: 0; padding: 0; overflow: hidden;">
            <div style="padding: 15px 20px; background: #fef2f2; border-bottom: 1px solid #fecaca;">
                <h3 style="margin: 0; font-size: 16px; color: #991b1b;">📉 Top 10 Declines (Vs. Historical Avg)</h3>
            </div>
            <div class="table-responsive" style="border: none; border-radius: 0;">
                <table>
                    <thead>
                        <tr style="background: #ffffff;">
                            <th style="color: #64748b; font-size: 11px; text-transform: uppercase;">Journal</th>
                            <th style="color: #64748b; font-size: 11px; text-transform: uppercase;">Latest</th>
                            <th style="color: #64748b; font-size: 11px; text-transform: uppercase;">Decline</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${stats.worstPerformers.map(j => `
                        <tr>
                            <td><a href="/journal?id=${j.master_id}" style="color: #1e293b; text-decoration: none; font-weight: 600;">${j.Name}</a></td>
                            <td style="font-weight: 800; color: var(--primary);">${j.latest_rating.toFixed(2)}</td>
                            <td><span style="color: #dc2626; font-weight: bold; background: #fee2e2; padding: 2px 6px; border-radius: 4px;">${j.pct_change.toFixed(1)}%</span></td>
                        </tr>`).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 20px;">
        
        <div class="card" style="margin: 0; padding: 0; overflow: hidden; display: flex; flex-direction: column;">
            <div style="padding: 15px 20px; background: #f8fafc; border-bottom: 1px solid #e2e8f0;">
                <h3 style="margin: 0; font-size: 16px; color: #334155;">✨ Added in ${stats.latestYear} (${stats.added.length})</h3>
            </div>
            <div>
                ${stats.added.length === 0 ? '<div style="padding: 20px; text-align: center; color: #64748b;">No new additions this year.</div>' : `
                <table style="width: 100%; border-collapse: collapse;">
                    <tbody>
                        ${stats.added.map(j => `
                        <tr style="border-bottom: 1px solid #f1f5f9;">
                            <td style="padding: 10px 15px;"><a href="/journal?id=${j.master_id}" style="color: #0f172a; text-decoration: none; font-weight: 500; font-size: 13px;">${j.Name}</a><br><small style="color: #64748b; font-family: monospace;">ISSN: ${j.ISSN}</small></td>
                            <td style="padding: 10px 15px; text-align: right;"><span style="color: #166534; font-weight: bold; font-size: 14px;">${j.rating.toFixed(2)}</span></td>
                        </tr>`).join('')}
                    </tbody>
                </table>`}
            </div>
        </div>

        <div class="card" style="margin: 0; padding: 0; overflow: hidden; display: flex; flex-direction: column;">
            <div style="padding: 15px 20px; background: #f8fafc; border-bottom: 1px solid #e2e8f0;">
                <h3 style="margin: 0; font-size: 16px; color: #334155;">❌ Removed in ${stats.latestYear} (${stats.removed.length})</h3>
            </div>
            <div>
                ${stats.removed.length === 0 ? '<div style="padding: 20px; text-align: center; color: #64748b;">No removals this year.</div>' : `
                <table style="width: 100%; border-collapse: collapse;">
                    <tbody>
                        ${stats.removed.map(j => `
                        <tr style="border-bottom: 1px solid #f1f5f9;">
                            <td style="padding: 10px 15px;"><span style="color: #475569; font-weight: 500; font-size: 13px;">${j.Name}</span><br><small style="color: #94a3b8; font-family: monospace;">ISSN: ${j.ISSN}</small></td>
                            <td style="padding: 10px 15px; text-align: right;"><span style="color: #94a3b8; font-size: 12px;">Last: ${j.prev_rating.toFixed(2)}</span></td>
                        </tr>`).join('')}
                    </tbody>
                </table>`}
            </div>
        </div>
    </div>

    <div style="margin-top: 30px; text-align: center; color: #64748b; font-size: 13px;">
        <p>💡 <em>Analytical Note: Top Gainers and Declines are calculated using the percentage change from their historical average to account for relative impact across different rating tiers.</em></p>
    </div>
    `;
}
