export function renderComparePage(journals) {
    const preselected = journals.map(j => ({ id: j.master_id, name: j.name, issn: j.issn }));
    
    // UI Colors for up to 5 journals
    const chartColors = ['#0056b3', '#ff8c00', '#28a745', '#dc3545', '#8b5cf6'];

    // --- Process Data for Comparison ---
    let processedJournals = [];
    let allYearsSet = new Set();

    journals.forEach((j, index) => {
        const recentRatings = (j.ratings || []).slice(-10); // Last 10 years
        recentRatings.forEach(r => allYearsSet.add(r.year));
        
        const n = recentRatings.length;
        if (n === 0) return;

        const scores = recentRatings.map(r => r.rating);
        const latestScore = scores[n - 1];
        const avgScore = scores.reduce((a, b) => a + b, 0) / n;
        const stdDev = Math.sqrt(scores.reduce((a, b) => a + Math.pow(b - avgScore, 2), 0) / n);
        const cv = (avgScore > 0) ? (stdDev / avgScore) * 100 : 0;
        
        // Calculate a basic "Publish Score" (Higher latest score is good, high volatility penalizes slightly)
        const publishScore = latestScore - (cv * 0.05);

        // Create a mapping of Year -> Rating for easy table generation
        const ratingsByYear = {};
        recentRatings.forEach(r => { ratingsByYear[r.year] = r.rating; });

        processedJournals.push({
            ...j,
            color: chartColors[index],
            latestScore,
            avgScore,
            cv,
            publishScore,
            ratingsByYear
        });
    });

    // Sort Years descending for the historical table
    const sortedYears = Array.from(allYearsSet).sort((a, b) => b - a);

    // --- Recommendation Engine ---
    let recommendationHTML = "";
    if (processedJournals.length > 1) {
        // Sort by our custom heuristic publish score
        const ranked = [...processedJournals].sort((a, b) => b.publishScore - a.publishScore);
        const best = ranked[0];
        const secondBest = ranked[1];

        let recText = `Based on the comparative analysis, <strong>${best.name}</strong> is the strongest candidate. It offers the best balance of a high current NAAS rating (${best.latestScore.toFixed(2)}) and manageable historical volatility (${best.cv.toFixed(1)}%). `;
        
        if (best.cv > 20 && secondBest && secondBest.cv < 15) {
            recText += `However, please note it has high volatility. If stability is your primary concern, <strong>${secondBest.name}</strong> (CV: ${secondBest.cv.toFixed(1)}%) might be a safer, albeit potentially lower-rated, alternative.`;
        }

        recommendationHTML = `
        <div class="card" style="border: 2px solid #15803d; background: #f0fdf4; padding: 25px;">
            <div style="font-size: 12px; font-weight: 800; color: #166534; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Algorithmic Recommendation</div>
            <div style="display: flex; align-items: flex-start; gap: 15px;">
                <span style="font-size: 32px; line-height: 1;">🏆</span>
                <p style="margin: 0; color: #166534; font-size: 15px; line-height: 1.6;">${recText}</p>
            </div>
        </div>`;
    }

    return `
    <div class="card" style="border-top: 5px solid var(--accent);">
        <h2 style="margin-top: 0; color: #334155;">Compare Journals</h2>
        <p style="color: #64748b;">Add up to 5 journals to analyze head-to-head performance metrics, volatility, and historical trends.</p>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0;">
            <div style="position: relative; margin-bottom: 20px;">
                <input type="text" id="compare-search" autocomplete="off" placeholder="Search by Journal Name or ISSN to add..." style="width: 100%; padding: 14px; border: 2px solid var(--border); border-radius: 6px; font-size: 15px;">
                <div class="autocomplete-dropdown" id="compare-dropdown"></div>
            </div>
            <ul id="selected-list" style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px;"></ul>
            <form action="/compare" method="GET" id="compare-form" style="margin-top: 15px;">
                <div id="hidden-inputs"></div>
                <button type="submit" id="compare-btn" class="btn" style="width:100%; display:none; background: var(--accent); font-size: 16px;">Run Comparison Analysis</button>
            </form>
        </div>
    </div>
    
    ${processedJournals.length >= 1 ? `
    
    ${recommendationHTML}

    <div class="card" style="padding: 0; overflow: hidden;">
        <div style="padding: 15px 20px; background: #f8fafc; border-bottom: 1px solid #e2e8f0;">
            <h3 style="margin: 0; font-size: 16px; color: #334155;">Key Performance Metrics</h3>
        </div>
        <div class="table-responsive" style="border: none; border-radius: 0;">
            <table>
                <thead>
                    <tr style="background: #ffffff;">
                        <th style="color: #64748b; font-size: 12px; text-transform: uppercase;">Journal</th>
                        <th style="color: #64748b; font-size: 12px; text-transform: uppercase;">Latest Rating</th>
                        <th style="color: #64748b; font-size: 12px; text-transform: uppercase;">10-Yr Avg</th>
                        <th style="color: #64748b; font-size: 12px; text-transform: uppercase;" title="Coefficient of Variation">Volatility (CV)</th>
                    </tr>
                </thead>
                <tbody>
                    ${processedJournals.map(j => `
                    <tr>
                        <td>
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <div style="width: 12px; height: 12px; border-radius: 3px; background: ${j.color};"></div>
                                <strong style="color: #1e293b;">${j.name}</strong>
                            </div>
                        </td>
                        <td><span style="font-weight: 800; color: var(--primary);">${j.latestScore.toFixed(2)}</span></td>
                        <td style="color: #475569; font-weight: 600;">${j.avgScore.toFixed(2)}</td>
                        <td>
                            <span style="font-weight: 600; color: ${j.cv > 20 ? '#dc2626' : (j.cv < 10 ? '#15803d' : '#b45309')};">
                                ${j.cv.toFixed(1)}%
                            </span>
                        </td>
                    </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    </div>

    <div class="card">
        <h3 style="margin-top: 0; color: #334155;">Historical Trajectory Comparison</h3>
        <div style="height: 400px;"><canvas id="compareChart"></canvas></div>
    </div>
    
    <div class="card" style="padding: 0; overflow: hidden;">
        <div style="padding: 15px 20px; background: #f8fafc; border-bottom: 1px solid #e2e8f0;">
            <h3 style="margin: 0; font-size: 16px; color: #334155;">10-Year Historical Data</h3>
        </div>
        <div class="table-responsive" style="border: none; border-radius: 0;">
            <table>
                <thead>
                    <tr style="background: #ffffff;">
                        <th style="color: #64748b; font-size: 12px; text-transform: uppercase; width: 80px;">Year</th>
                        ${processedJournals.map(j => `<th style="color: #1e293b; font-size: 12px;">${j.name}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${sortedYears.map(year => `
                    <tr>
                        <td style="font-weight: bold; color: #475569;">${year}</td>
                        ${processedJournals.map(j => {
                            const rating = j.ratingsByYear[year];
                            return `<td style="color: ${rating ? '#334155' : '#cbd5e1'}; font-weight: ${rating ? '600' : 'normal'};">${rating ? rating.toFixed(2) : '-'}</td>`;
                        }).join('')}
                    </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    </div>
    ` : ''}

    <script>
        // UI Logic for adding/removing journals
        let selected = ${JSON.stringify(preselected)};
        
        function updateUI() {
            const list = document.getElementById('selected-list');
            const hidden = document.getElementById('hidden-inputs');
            const searchInp = document.getElementById('compare-search');
            
            // Render list
            list.innerHTML = selected.map(j => \`
                <li style="padding: 12px 15px; background: #fff; border: 1px solid #e2e8f0; border-radius: 6px; display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-weight: 600; color: #334155; font-size: 14px;">\${j.name} <small style="color:#94a3b8; font-weight:normal;">(ISSN: \${j.issn})</small></span>
                    <button type="button" onclick="window.removeJ('\${j.id}')" style="background: #fee2e2; color: #dc2626; border: none; border-radius: 4px; padding: 4px 8px; cursor: pointer; font-size: 12px; font-weight: bold;">✖ Remove</button>
                </li>
            \`).join('');
            
            // Render hidden inputs for form submission
            hidden.innerHTML = selected.map((j, i) => \`<input type="hidden" name="id\${i+1}" value="\${j.id}">\`).join('');
            
            // Manage UI limits (Max 5)
            if (selected.length >= 5) {
                searchInp.placeholder = "Maximum of 5 journals reached.";
                searchInp.disabled = true;
            } else {
                searchInp.placeholder = "Search by Journal Name or ISSN to add...";
                searchInp.disabled = false;
            }

            // Show compare button if at least 2 are selected
            document.getElementById('compare-btn').style.display = selected.length >= 2 ? 'block' : 'none';
        }

        window.removeJ = (id) => { 
            selected = selected.filter(x => x.id !== id); 
            updateUI(); 
            // If they remove one, auto-submit to refresh the page without it
            if(selected.length > 0) document.getElementById('compare-form').submit();
            else window.location.href = '/compare';
        };
        
        updateUI();

        // Autocomplete Logic
        const inp = document.getElementById('compare-search');
        const dd = document.getElementById('compare-dropdown');
        if(inp) {
            inp.addEventListener('input', async () => {
                const val = inp.value.trim();
                if(val.length < 2) { dd.style.display = 'none'; return; }
                try {
                    const res = await fetch('/?ajax_search=' + encodeURIComponent(val));
                    const data = await res.json();
                    if(data.length > 0) {
                        dd.innerHTML = data.map(item => {
                            const safeName = item.Name.replace(/'/g, "\\\\'");
                            // Prevent adding duplicates
                            const isDup = selected.some(s => s.id == item.master_id);
                            if(isDup) return '';
                            
                            return \`<div class="autocomplete-item" onclick="window.addJournal('\${item.master_id}', '\${safeName}', '\${item.ISSN}')">
                                <span style="display:block; font-weight:bold; color:var(--primary);">\${item.Name}</span>
                                <small style="color:#666;">ISSN: \${item.ISSN}</small>
                            </div>\`;
                        }).join('');
                        dd.style.display = dd.innerHTML.trim() === '' ? 'none' : 'block';
                    } else { dd.style.display = 'none'; }
                } catch (err) { console.error(err); }
            });
            
            window.addJournal = function(id, name, issn) { 
                if(selected.length < 5) {
                    selected.push({id, name, issn});
                    inp.value = '';
                    dd.style.display = 'none';
                    updateUI();
                }
            };
            
            document.addEventListener('click', (e) => { if (e.target !== inp && e.target !== dd) dd.style.display = 'none'; });
        }

        // Chart initialization
        ${processedJournals.length > 0 ? `
        setTimeout(() => {
            const allYears = Array.from(new Set(${JSON.stringify(Array.from(allYearsSet))})).sort();
            new Chart(document.getElementById('compareChart'), {
                type: 'line',
                data: {
                    labels: allYears,
                    datasets: ${JSON.stringify(processedJournals.map((j) => {
                        // We need to map the data to ensure it aligns with the allYears array, inserting nulls where data is missing
                        const alignedData = allYears.map(y => j.ratingsByYear[y] || null);
                        return {
                            label: j.name,
                            data: alignedData,
                            borderColor: j.color,
                            backgroundColor: j.color,
                            tension: 0.1,
                            pointRadius: 4,
                            borderWidth: 2,
                            spanGaps: true // Connects lines even if a year is missing
                        };
                    }))}
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: { mode: 'index', intersect: false }
                }
            });
        }, 150);` : ''}
    </script>
    `;
}
