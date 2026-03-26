export function renderSearchPage(search = "", min = "", max = "", results = [], isSubmitted = false) {
  
  // 1. Define the Utility Block content first
  const utilityBlock = `
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 15px; margin-bottom: 30px;">
        <div class="card" style="margin:0; border-left: 4px solid #0284c7; padding: 15px; background: #f0f9ff;">
            <h4 style="margin:0 0 5px 0; color:#0369a1; font-size:14px;">📋 Recruitment Verification</h4>
            <p style="margin:0; font-size:12px; color:#64748b;">Instant validation of NAAS scores for recruitment panels and CAS selection committees to ensure applicant data integrity.</p>
        </div>
        <div class="card" style="margin:0; border-left: 4px solid #16a34a; padding: 15px; background: #f0fdf4;">
            <h4 style="margin:0 0 5px 0; color:#15803d; font-size:14px;">🛡️ Anti-Fraud Shield</h4>
            <p style="margin:0; font-size:12px; color:#64748b;">ISSN-anchored cross-verification to detect and prevent fraud by 'clone' or predatory journals mimicking legitimate titles.</p>
        </div>
        <div class="card" style="margin:0; border-left: 4px solid var(--accent); padding: 15px; background: #fffbeb;">
            <h4 style="margin:0 0 5px 0; color:#b45309; font-size:14px;">📈 Longitudinal Analytics</h4>
            <p style="margin:0; font-size:12px; color:#64748b;">10-year historical trajectory and volatility indexing to help scientists choose stable, high-impact publication venues.</p>
        </div>
    </div>
  `;

  // 2. Return the full page HTML
  return `
    <div style="max-width: 900px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 40px;">
            <h2 style="font-size: 32px; color: var(--primary); margin-bottom: 10px;">Agricultural Journal Search Portal</h2>
            <p style="color: #64748b; font-size: 16px;">Comprehensive Analytics & Integrity Verification for NAAS Rated Journals</p>
        </div>

        ${utilityBlock}

        <div class="card" style="padding: 30px; border-top: 5px solid var(--primary);">
            <form id="search-form" method="GET" action="/">
                <div style="margin-bottom: 20px; position: relative;">
                    <label style="display: block; font-weight: 700; margin-bottom: 8px; color: #334155;">Search by Journal Name or ISSN</label>
                    <input type="text" id="main-search" name="search" value="${search}" placeholder="e.g. Journal of Agricultural Engineering or 0256-6524" autocomplete="off" style="width: 100%; padding: 14px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 16px;">
                    <div id="search-dropdown" class="autocomplete-dropdown"></div>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px;">
                    <div>
                        <label style="display: block; font-weight: 700; margin-bottom: 8px; color: #334155;">Min Rating</label>
                        <input type="number" name="min_rating" value="${min}" step="0.01" placeholder="0.00" style="width: 100%; padding: 12px; border: 2px solid #e2e8f0; border-radius: 8px;">
                    </div>
                    <div>
                        <label style="display: block; font-weight: 700; margin-bottom: 8px; color: #334155;">Max Rating</label>
                        <input type="number" name="max_rating" value="${max}" step="0.01" placeholder="20.00" style="width: 100%; padding: 12px; border: 2px solid #e2e8f0; border-radius: 8px;">
                    </div>
                </div>

                <button type="submit" class="btn" style="width: 100%; padding: 15px; font-size: 18px; font-weight: 700;">Find Journals</button>
            </form>
        </div>

        ${isSubmitted ? `
            <div style="margin-top: 40px;">
                <h3 style="color: #334155; margin-bottom: 20px;">Search Results (${results.length})</h3>
                ${results.length > 0 ? `
                    <div class="table-responsive">
                        <table>
                            <thead>
                                <tr>
                                    <th>Journal Name</th>
                                    <th>ISSN</th>
                                    <th style="text-align:center;">Current Rating</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${results.map(r => `
                                    <tr>
                                        <td style="font-weight: 600; color: #1e293b;">${r.name}</td>
                                        <td style="font-family: monospace; color: #64748b;">${r.issn}</td>
                                        <td style="text-align:center;"><span style="background: var(--primary); color: white; padding: 4px 10px; border-radius: 20px; font-weight: 800; font-size: 14px;">${r.rating.toFixed(2)}</span></td>
                                        <td><a href="/journal?id=${r.master_id}" class="btn" style="padding: 6px 12px; font-size: 12px;">View Analytics</a></td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                ` : `<div class="card" style="text-align: center; color: #64748b;">No journals found matching your criteria.</div>`}
            </div>
        ` : ''}
    </div>

    <script>
      const inp = document.getElementById('main-search');
      const dd = document.getElementById('search-dropdown');
      
      if(inp) {
        inp.addEventListener('input', async () => {
          const val = inp.value.trim();
          if(val.length < 2) { dd.style.display = 'none'; return; }
          try {
            const res = await fetch('/?ajax_search=' + encodeURIComponent(val));
            const data = await res.json();
            if(data.length > 0) {
              dd.innerHTML = data.map(item => {
                 const rawName = item.Name ? String(item.Name) : "Unknown";
                 const cleanName = rawName.replace(/"/g, '&quot;');
                 return '<div class="autocomplete-item" data-name="' + cleanName + '">' +
                        '<span style="display:block; font-weight:bold; color:var(--primary);">' + rawName + '</span>' +
                        '<small style="color:#666;">ISSN: ' + (item.ISSN || 'N/A') + '</small></div>';
              }).join('');
              dd.style.display = 'block';
            } else { dd.style.display = 'none'; }
          } catch (err) { console.error("Autocomplete Error:", err); }
        });

        dd.addEventListener('click', (e) => {
            const item = e.target.closest('.autocomplete-item');
            if (item) {
                inp.value = item.getAttribute('data-name');
                dd.style.display = 'none';
                document.getElementById('search-form').submit();
            }
        });

        document.addEventListener('click', (e) => { if (e.target !== inp && e.target !== dd) dd.style.display = 'none'; });
      }
    </script>
  `;
}
