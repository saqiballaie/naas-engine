import { escapeHTML } from '../utils.js';

export function renderSearchPage(searchTerm, min, max, results, isSearchSubmitted, page = 1) {
    const safeTerm = escapeHTML(searchTerm);
    const limit = 50; // Match the limit set in database.js

    // Pagination Logic: Determine if we need "Next" or "Previous"
    const paginationControls = `
        <div style="margin: 20px 0; display: flex; justify-content: center; gap: 15px; align-items: center; padding-bottom: 20px;">
            ${page > 1 ? `<a href="/?search=${encodeURIComponent(searchTerm)}&min_rating=${min}&max_rating=${max}&page=${page - 1}" class="btn" style="background:#64748b; padding: 8px 16px;">← Previous</a>` : ''}
            
            <span style="font-weight: bold; color: #475569; background: #f1f5f9; padding: 8px 16px; border-radius: 6px;">Page ${page}</span>
            
            ${results.length === limit ? `<a href="/?search=${encodeURIComponent(searchTerm)}&min_rating=${min}&max_rating=${max}&page=${page + 1}" class="btn" style="background:#64748b; padding: 8px 16px;">Next →</a>` : ''}
        </div>
    `;

    return `
    <div class="card" style="border-top: 5px solid var(--primary); margin-bottom: 25px;">
        <form action="/" method="GET" id="search-form" style="max-width: 900px; margin: 0 auto; text-align: left;">
            <div style="margin-bottom: 20px; position: relative;">
                <label style="font-size: 12px; font-weight: 800; color: #475569; text-transform: uppercase; margin-bottom: 8px; display: block;">Find a Journal</label>
                <input type="text" id="main-search" name="search" autocomplete="off" value="${safeTerm}" placeholder="Enter Journal Name or ISSN..." style="width: 100%; padding: 16px; border: 2px solid var(--border); border-radius: 8px; font-size: 16px;">
                <div class="autocomplete-dropdown" id="search-dropdown"></div>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; align-items: end;">
                <div><label style="font-size: 11px; font-weight: bold; color: #64748b;">Min Rating</label><input type="number" step="0.01" name="min_rating" value="${escapeHTML(min)}" style="width: 100%; padding: 12px; border: 1px solid var(--border); border-radius: 6px;"></div>
                <div><label style="font-size: 11px; font-weight: bold; color: #64748b;">Max Rating</label><input type="number" step="0.01" name="max_rating" value="${escapeHTML(max)}" style="width: 100%; padding: 12px; border: 1px solid var(--border); border-radius: 6px;"></div>
                <button type="submit" class="btn" style="height: 45px; font-size: 15px;">Search Database</button>
            </div>
            <div style="margin-top: 25px; border-top: 1px solid #e2e8f0; padding-top: 15px;">
                <span style="font-size: 12px; font-weight: bold; color: #64748b; margin-right: 15px; text-transform: uppercase;">Quick Categories:</span>
                <div style="display: inline-flex; gap: 10px; flex-wrap: wrap; align-items: center;">
                    <a href="/?max_rating=3.99" class="quick-chip developing">Below 4.0</a>
                    <a href="/?min_rating=4.00&max_rating=5.99" class="quick-chip mid">4.0 - 5.9</a>
                    <a href="/?min_rating=6.00&max_rating=8.99" class="quick-chip high">6.0 - 8.9</a>
                    <a href="/?min_rating=9.00" class="quick-chip elite">Above 9.0</a>
                </div>
            </div>
        </form>
    </div>

    ${!isSearchSubmitted ? `
    <div class="card" style="background: linear-gradient(to right bottom, #ffffff, #f8fafc); border: 1px solid #e2e8f0;">
        <h2 style="color: var(--primary); margin-top: 0;">Welcome to NAAS Insights Engine</h2>
        <p style="color: #475569; font-size: 15px; line-height: 1.6;">This platform provides researchers and recruitment boards with longitudinal performance metrics and anti-fraud verification for scientific journals based on the <strong>National Academy of Agricultural Sciences (NAAS)</strong> system.</p>
        <h3 style="color: #334155; margin-top: 25px; margin-bottom: 10px; font-size: 18px;">How to use this tool:</h3>
        <ul style="color: #475569; line-height: 1.7; font-size: 15px;">
            <li><strong>Verification:</strong> Cross-check scores claimed by candidates in recruitment/CAS forms.</li>
            <li><strong>Anti-Fraud:</strong> Use the <em>Verify via ISSN</em> feature to detect 'cloned' journals.</li>
            <li><strong>Trends:</strong> View historical averages and our proprietary Volatility Index.</li>
        </ul>
    </div>
    
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 15px; margin-bottom: 30px;">
        <div class="card" style="margin:0; border-left: 4px solid #0284c7; padding: 15px; background: #f0f9ff;">
            <h4 style="margin:0 0 5px 0; color:#0369a1; font-size:14px;">📋 Recruitment Verification</h4>
            <p style="margin:0; font-size:12px; color:#64748b;">Instant validation of NAAS scores for recruitment panels and CAS selection committees.</p>
        </div>
        <div class="card" style="margin:0; border-left: 4px solid #16a34a; padding: 15px; background: #f0fdf4;">
            <h4 style="margin:0 0 5px 0; color:#15803d; font-size:14px;">🛡️ Anti-Fraud Shield</h4>
            <p style="margin:0; font-size:12px; color:#64748b;">ISSN-anchored cross-verification to detect and prevent predatory journal fraud.</p>
        </div>
        <div class="card" style="margin:0; border-left: 4px solid var(--accent); padding: 15px; background: #fffbeb;">
            <h4 style="margin:0 0 5px 0; color:#b45309; font-size:14px;">📈 Longitudinal Analytics</h4>
            <p style="margin:0; font-size:12px; color:#64748b;">10-year trajectory indexing to help choose stable, high-impact publication venues.</p>
        </div>
    </div>` : ''}

    ${isSearchSubmitted ? `
    <div class="card" style="padding: 0; overflow: hidden;">
        <div style="padding: 15px 20px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
            <h3 style="margin: 0; font-size: 16px; color: #334155;">Results (Page ${page})</h3>
            <span style="font-size: 12px; color: #64748b;">Found ${results.length} journals in this view</span>
        </div>
        ${results.length === 0 ? `
            <div style="padding: 40px; text-align: center; color: #64748b;"><div style="font-size: 40px; margin-bottom: 10px;">🔍</div><h3>No journals found</h3><a href="/" class="btn" style="margin-top: 10px;">Clear Filters</a></div>
        ` : `
        <div class="table-responsive" style="border: none; border-radius: 0;">
            <table>
                <thead><tr style="background: #ffffff;"><th style="color:#64748b; font-size:12px; text-transform:uppercase;">ISSN</th><th style="color:#64748b; font-size:12px; text-transform:uppercase;">Journal Title</th><th style="color:#64748b; font-size:12px; text-transform:uppercase; text-align:center;">Rating</th><th style="color:#64748b; font-size:12px; text-transform:uppercase; text-align:center;">Action</th></tr></thead>
                <tbody>
                    ${results.map(row => {
                        return `<tr>
                            <td style="font-family:monospace; color:#475569;">${row.issn || 'N/A'}</td>
                            <td><strong style="color:#1e293b;">${row.name}</strong></td>
                            <td style="text-align:center;"><span style="font-weight:800; color:var(--primary); background:#eef2ff; padding:4px 10px; border-radius:15px;">${row.rating ? row.rating.toFixed(2) : 'N/A'}</span></td>
                            <td style="text-align:center;"><a href="/journal?id=${row.master_id}" class="btn" style="padding:6px 12px; font-size:11px; background:#e2e8f0; color:#334155;">📊 View Metrics</a></td>
                        </tr>`;
                    }).join('')}
                </tbody>
            </table>
        </div>`}
    </div>
    ${results.length > 0 ? paginationControls : ''}
    ` : ''}

    <style>
        .quick-chip { padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 700; text-decoration: none; transition: all 0.2s ease; border: 1px solid transparent; }
        .quick-chip.developing { color: #475569; background: #f1f5f9; border-color: #cbd5e1; }
        .quick-chip.mid { color: #b45309; background: #fef3c7; border-color: #fde68a; }
        .quick-chip.high { color: #15803d; background: #dcfce3; border-color: #bbf7d0; }
        .quick-chip.elite { color: #1d4ed8; background: #dbeafe; border-color: #bfdbfe; }
        .quick-chip:hover { filter: brightness(0.95); transform: translateY(-1px); }
    </style>

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
                 return '<div class="autocomplete-item" data-id="' + item.master_id + '" data-name="' + cleanName + '">' +
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
                const id = item.getAttribute('data-id');
                window.location.href = '/journal?id=' + id;
            }
        });

        document.addEventListener('click', (e) => { 
            if (e.target !== inp && e.target !== dd) dd.style.display = 'none'; 
        });
      }
    </script>
    `;
}
