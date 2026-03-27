import { escapeHTML } from '../utils.js';
export function renderAnalyticsPage(data) {
    if (!data || !data.history || data.history.length === 0) {
        return `<div class="card" style="text-align: center; padding: 50px;"><h2>No Data Found</h2><a href="/" class="btn">Return to Search</a></div>`;
    }

    // 1. Prepare Chart Data for data-* attributes
    const safeLabels = escapeHTML(JSON.stringify(data.history.map(row => row.year)));
    const safeDatasets = escapeHTML(JSON.stringify([
        {
            label: 'NAAS Rating',
            data: data.history.map(row => row.rating),
            borderColor: '#2563eb',
            backgroundColor: 'rgba(37, 99, 235, 0.1)',
            borderWidth: 3, pointBackgroundColor: '#ffffff', pointBorderColor: '#2563eb',
            pointBorderWidth: 2, pointRadius: 4, fill: true, tension: 0.2, order: 1
        },
        {
            label: 'Historical Average',
            data: data.history.map(() => data.avg_rating),
            borderColor: '#94a3b8', borderWidth: 2, borderDash: [5, 5], 
            pointRadius: 0, fill: false, tension: 0, order: 2 
        }
    ]));

    // 2. Prepare Table Data (Yearly Change & Deviation)
    const enrichedHistory = data.history.map((row, index, arr) => {
        let yearlyChange = null;
        if (index > 0) {
            yearlyChange = row.rating - arr[index - 1].rating;
        }
        const devFromAvg = row.rating - data.avg_rating;
        return { ...row, yearlyChange, devFromAvg };
    });

    // ==========================================
    // METRICS CALCULATION (Peaks, Streaks, & CAGR)
    // ==========================================
    const history = data.history;
    const latestRating = history[history.length - 1].rating;
    const latestYear = history[history.length - 1].year;
    
    const peakRating = Math.max(...history.map(r => r.rating));
    const peakYear = history.find(r => r.rating === peakRating).year;
    const dropFromPeak = peakRating - latestRating;

    let latestYoY = history.length > 1 ? history[history.length - 1].rating - history[history.length - 2].rating : 0;

    // 1. Calculate Consecutive Declines (The Streak)
    let consecutiveDeclines = 0;
    for (let i = enrichedHistory.length - 1; i > 0; i--) {
        if (enrichedHistory[i].yearlyChange < 0) {
            consecutiveDeclines++;
        } else if (enrichedHistory[i].yearlyChange > 0) {
            break; // Streak broken
        }
    }

    // 2. Calculate 5-Year CAGR (Compound Annual Growth Rate)
    let cagr = 0;
    if (history.length >= 2) {
        const periods = Math.min(4, history.length - 1); // Up to 4 intervals (5 years total)
        const beginRating = history[history.length - 1 - periods].rating;
        cagr = (Math.pow(latestRating / beginRating, 1 / periods) - 1) * 100;
    }

    // ==========================================
    // BULLETPROOF RECOMMENDATION ENGINE
    // ==========================================
    let recTitle = "Consistent & Reliable";
    let recText = "This journal has maintained a stable trajectory recently. It is currently performing reliably near its historical standard.";
    let recColor = "#16a34a"; // Green
    let recIcon = "✅";

    if (consecutiveDeclines >= 3) {
        recTitle = "Warning: Chronic Decline";
        recText = `This journal is bleeding value. It has dropped in rating for ${consecutiveDeclines} consecutive years. A sustained negative streak is a major red flag for future stability.`;
        recColor = "#dc2626"; // Red
        recIcon = "🚨";
    } else if (latestYoY <= -0.75) {
        recTitle = "Warning: Sudden Drop";
        recText = `This journal experienced a sharp drop of ${Math.abs(latestYoY).toFixed(2)} points in the last cycle. Verify its current status and editorial board immediately.`;
        recColor = "#dc2626"; // Red
        recIcon = "🚨";
    } else if (cagr < -2.0) {
        recTitle = "Negative Long-Term Trend";
        recText = `Despite minor bounces, the 5-year Compound Annual Growth Rate (CAGR) is a negative ${cagr.toFixed(2)}%. The journal's value is slowly degrading over time.`;
        recColor = "#ea580c"; // Orange
        recIcon = "📉";
    } else if (dropFromPeak >= 1.5) {
        recTitle = "Degraded from Peak";
        recText = `This journal is currently ${dropFromPeak.toFixed(2)} points below its all-time high of ${peakRating.toFixed(2)} (achieved in ${peakYear}).`;
        recColor = "#b45309"; // Amber
        recIcon = "⚠️";
    } else if (cagr > 3.0 && latestYoY > 0) {
        recTitle = "Strong Upward Growth";
        recText = `This journal shows excellent momentum with a 5-year CAGR of +${cagr.toFixed(2)}%. It is actively building its reputation in the ecosystem.`;
        recColor = "#0284c7"; // Blue
        recIcon = "📈";
    }

    // Calculate Percentile for the bottom card
    // Calculate Percentile and format the text properly
    const rawPercentile = data.total_journals ? (data.rank / data.total_journals) * 100 : 0;
    let rankText = "";
    let rankColor = "";

    if (rawPercentile <= 10) {
        rankText = `Top ${rawPercentile.toFixed(1)}% (Elite Tier)`;
        rankColor = "#15803d"; // Dark Green
    } else if (rawPercentile <= 25) {
        rankText = `Top ${rawPercentile.toFixed(1)}% (Excellent)`;
        rankColor = "#16a34a"; // Green
    } else if (rawPercentile <= 50) {
        rankText = `Top ${rawPercentile.toFixed(1)}% (Above Average)`;
        rankColor = "#0284c7"; // Blue
    } else if (rawPercentile <= 75) {
        rankText = `Bottom ${(100 - rawPercentile).toFixed(1)}% (Below Average)`;
        rankColor = "#ea580c"; // Orange
    } else {
        rankText = `Bottom ${(100 - rawPercentile).toFixed(1)}% (Low Tier)`;
        rankColor = "#dc2626"; // Red
    }

    return `
    <div style="max-width: 900px; margin: 0 auto;">
        
        <div class="card" style="border-top: 5px solid var(--primary); margin-bottom: 20px; padding: 25px;">
            <h2 style="margin: 0 0 15px 0; color: #0f172a; font-size: 26px;">${escapeHTML(data.name)}</h2>
            
            <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 15px; margin-bottom: 15px;">
                <div style="font-family: monospace; font-size: 15px; color: #334155; background: #f1f5f9; padding: 6px 12px; border-radius: 6px; border: 1px solid #e2e8f0;">
                    <strong>ISSN:</strong> ${escapeHTML(data.issn)}
                </div>
                
                <a href="/" class="btn" style="background: #475569; padding: 6px 12px; font-size: 13px;">🔍 New Search</a>
                <a href="/compare?id1=${data.master_id}" class="btn" style="background: #8b5cf6; padding: 6px 12px; font-size: 13px;">📈 Compare</a>
                <a href="https://www.google.com/search?q=ISSN+${data.issn}+Journal" target="_blank" class="btn" style="background: #0284c7; padding: 6px 12px; font-size: 13px;">🛡️ Verify via Google</a>
            </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 25px;">
            <div class="card" style="margin: 0; text-align: center; padding: 20px;">
                <h4 style="margin: 0 0 10px 0; color: #64748b; font-size: 12px; text-transform: uppercase;">Latest NAAS Rating</h4>
                <div style="font-size: 36px; font-weight: 900; color: var(--primary);">${latestRating.toFixed(2)}</div>
                <div style="font-size: 12px; color: #94a3b8;">Current Status</div>
            </div>
            <div class="card" style="margin: 0; text-align: center; padding: 20px;">
                <h4 style="margin: 0 0 10px 0; color: #64748b; font-size: 12px; text-transform: uppercase;">All-Time Peak</h4>
                <div style="font-size: 32px; font-weight: 700; color: #334155;">${peakRating.toFixed(2)}</div>
                <div style="font-size: 12px; color: #ea580c; font-weight: bold;">${dropFromPeak > 0 ? `Currently -${dropFromPeak.toFixed(2)} below peak` : 'Currently at Peak'}</div>
            </div>
            <div class="card" style="margin: 0; text-align: center; padding: 20px; border-bottom: 4px solid ${latestYoY >= 0 ? '#16a34a' : '#dc2626'};">
                <h4 style="margin: 0 0 10px 0; color: #64748b; font-size: 12px; text-transform: uppercase;">1-Year Change</h4>
                <div style="font-size: 26px; font-weight: 800; color: ${latestYoY > 0 ? '#16a34a' : (latestYoY < 0 ? '#dc2626' : '#64748b')}; margin-bottom: 5px;">
                    ${latestYoY > 0 ? '+' : ''}${latestYoY.toFixed(2)}
                </div>
                <div style="font-size: 12px; color: #94a3b8;">5-Yr CAGR: ${cagr > 0 ? '+' : ''}${cagr.toFixed(2)}%</div>
            </div>
        </div>

        <div class="card" style="margin-bottom: 20px; padding: 20px;">
            <h3 style="margin: 0 0 15px 0; color: #334155; font-size: 16px; text-transform: uppercase;">Historical Trend vs Average</h3>
            <div style="position: relative; height: 300px; width: 100%;">
                <canvas id="ratingChart" 
                        data-chart="true" 
                        data-chart-type="line" 
                        data-labels="${safeLabels}" 
                        data-datasets="${safeDatasets}">
                </canvas>
            </div>
        </div>

        <div class="card" style="margin-bottom: 20px; padding: 0; overflow: hidden;">
            <div style="padding: 15px 20px; background: #f8fafc; border-bottom: 1px solid #e2e8f0;">
                <h3 style="margin: 0; font-size: 16px; color: #334155;">Annual Performance Record</h3>
            </div>
            <div class="table-responsive" style="margin: 0; border: none;">
                <table style="margin: 0; width: 100%; text-align: center;">
                    <thead style="background: #ffffff; border-bottom: 2px solid #e2e8f0;">
                        <tr>
                            <th style="color: #64748b; font-size: 12px; text-transform: uppercase; padding: 12px;">Year</th>
                            <th style="color: #64748b; font-size: 12px; text-transform: uppercase; padding: 12px;">Rating</th>
                            <th style="color: #64748b; font-size: 12px; text-transform: uppercase; padding: 12px;">Yearly Change</th>
                            <th style="color: #64748b; font-size: 12px; text-transform: uppercase; padding: 12px;">Dev. from Avg</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${[...enrichedHistory].reverse().map(row => {
                            let changeUI = '<span style="color: #94a3b8;">-</span>';
                            if (row.yearlyChange > 0) changeUI = `<span style="color: #16a34a; font-weight: bold;">+${row.yearlyChange.toFixed(2)}</span>`;
                            else if (row.yearlyChange < 0) changeUI = `<span style="color: #dc2626; font-weight: bold;">${row.yearlyChange.toFixed(2)}</span>`;
                            else if (row.yearlyChange === 0) changeUI = `<span style="color: #64748b;">0.00</span>`;

                            let devUI = '';
                            if (row.devFromAvg > 0) devUI = `<span style="color: #0284c7;">+${row.devFromAvg.toFixed(2)}</span>`;
                            else if (row.devFromAvg < 0) devUI = `<span style="color: #ea580c;">${row.devFromAvg.toFixed(2)}</span>`;
                            else devUI = `<span style="color: #64748b;">0.00</span>`;

                            return `
                            <tr>
                                <td style="font-weight: bold; color: #475569; padding: 12px;">${row.year}</td>
                                <td style="padding: 12px;"><span style="background: #f1f5f9; padding: 4px 10px; border-radius: 12px; font-weight: 800; color: var(--primary);">${row.rating.toFixed(2)}</span></td>
                                <td style="padding: 12px;">${changeUI}</td>
                                <td style="padding: 12px;">${devUI}</td>
                            </tr>`;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        </div>

        <div class="card" style="border-left: 5px solid ${recColor}; background: #f8fafc; padding: 25px; margin-bottom: 20px;">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                <span style="font-size: 24px;">${recIcon}</span>
                <h3 style="margin: 0; color: ${recColor}; font-size: 18px;">System Recommendation: ${recTitle}</h3>
            </div>
            <p style="margin: 0; color: #475569; font-size: 15px; line-height: 1.6;">${recText}</p>
        </div>

        <div class="card" style="border: 1px solid #e2e8f0; background: #ffffff; padding: 25px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 20px;">
            <div>
                <h3 style="margin: 0 0 5px 0; color: #334155; font-size: 18px;">Global Ecosystem Rank</h3>
                <p style="margin: 0; color: #64748b; font-size: 14px;">Journal standing relative to the entire database for ${latestYear}.</p>
            </div>
            <div style="text-align: right; background: #f8fafc; padding: 15px 25px; border-radius: 8px; border: 1px solid #f1f5f9;">
                <div style="font-size: 28px; font-weight: 900; color: var(--primary);">Rank #${data.rank || '?'}</div>
                <div style="font-size: 14px; font-weight: bold; color: ${rankColor};">
                    ${rankText} of ${data.total_journals || '?'} Journals
                </div>
            </div>
        </div>

    </div>
    `;
}
