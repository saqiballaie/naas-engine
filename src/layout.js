export function layout(title, content, path, latestYear) {
  const currentYear = new Date().getFullYear();
  
  const isSearchActive = (path === '/' || path === '/index.php') ? 'active' : '';
  const isCompareActive = (path.startsWith('/compare')) ? 'active' : '';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} | NAAS Insights Engine</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        :root { --primary: #0056b3; --primary-light: #e3f2fd; --accent: #ff8c00; --success: #28a745; --danger: #dc3545; --bg: #f4f6f8; --border: #dee2e6; --white: #ffffff; }
        * { box-sizing: border-box; }
        body { font-family: 'Segoe UI', system-ui, sans-serif; margin: 0; background: var(--bg); color: #333; display: flex; flex-direction: column; min-height: 100vh; }
        header { background: var(--white); border-bottom: 1px solid var(--border); position: sticky; top: 0; z-index: 1000; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
        .header-container { max-width: 1200px; margin: 0 auto; padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; }
        .logo h1 { margin: 0; color: var(--primary); font-size: 22px; font-weight: 800; line-height: 1.2; }
        .initiative-subtitle { font-size: 11px; color: #6c757d; margin-top: 3px; font-weight: 500; letter-spacing: 0.3px; max-width: 550px; }
        nav ul { list-style: none; margin: 0; padding: 0; display: flex; gap: 8px; }
        nav a { color: #495057; text-decoration: none; font-weight: 600; font-size: 14px; padding: 8px 14px; border-radius: 6px; transition: all 0.2s; }
        nav a:hover, nav a.${isSearchActive}, nav a.${isCompareActive} { color: var(--white); background: var(--primary); }
        .main-content { flex: 1; }
        .container { max-width: 1100px; margin: 30px auto; padding: 0 20px; }
        .card { background: var(--white); padding: 25px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); margin-bottom: 25px; border: 1px solid var(--border); }
        .btn { background: var(--primary); color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; transition: opacity 0.2s; }
        .btn:hover { opacity: 0.9; }
        .autocomplete-dropdown { position: absolute; background: white; border: 1px solid #ddd; width: 100%; z-index: 2000; display: none; box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 0 0 8px 8px; max-height: 300px; overflow-y: auto; }
        .autocomplete-item { padding: 12px; cursor: pointer; border-bottom: 1px solid #eee; text-align: left; }
        .autocomplete-item:hover { background: var(--primary-light); }
        
        /* Responsive Table Magic */
        .table-responsive { width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; border-radius: 6px; }
        table { min-width: max-content; width: 100%; border-collapse: collapse; }
        
        /* Mobile Breakpoints */
        @media (max-width: 768px) { 
            .header-container { flex-direction: column; text-align: center; gap: 10px; } 
            .initiative-subtitle { text-align: center; margin: 4px auto 8px auto; } 
            nav ul { justify-content: center; } 
            .container { margin: 15px auto; }
            th, td { padding: 10px 8px !important; font-size: 13px !important; }
        }
    </style>
</head>
<body>
<header>
    <div class="header-container">
        <div class="logo">
            <h1>NAAS Insights Engine</h1>
            <div class="initiative-subtitle">
                A joint initiative by Sardar Vallabhbhai Patel University of Agriculture and Technology & Sher-e-Kashmir University of Agricultural Sciences and Technology of Kashmir
            </div>
        </div>
        <nav>
            <ul>
                <li><a href="/" class="${isSearchActive}">Search</a></li>
                <li><a href="/compare" class="${isCompareActive}">Compare</a></li>
            </ul>
        </nav>
    </div>
</header>
<div class="main-content"><div class="container">${content}</div></div>

<footer style="margin-top: 50px; background: #1e293b; color: #f8f9fa; padding: 50px 20px 30px;">
    <div style="max-width: 1100px; margin: 0 auto;">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 40px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 40px;">
            
            <div>
                <h3 style="color: #fff; margin-top: 0; margin-bottom: 15px; font-size: 20px; font-weight: 800;">NAAS Insights Engine</h3>
                <p style="font-size: 14px; color: #94a3b8; line-height: 1.6; margin-bottom: 0;">An advanced analytical platform providing longitudinal performance metrics and algorithmic evaluation of agricultural and scientific journals.</p>
            </div>
            
            <div>
                <h4 style="margin: 0 0 12px 0; font-size: 12px; text-transform: uppercase; color: #64748b; letter-spacing: 1px; font-weight: 800;">Project Lead</h4>
                <p style="margin: 0 0 4px 0; font-weight: bold; color: #f1f5f9; font-size: 15px;">Dr. Saqib Parvaze Allaie</p>
                <p style="margin: 0 0 4px 0; font-size: 13px; color: #38bdf8;">Subject Matter Specialist (Agricultural Engineering)</p>
                <p style="margin: 0 0 2px 0; font-size: 12px; color: #cbd5e1;">Krishi Vigyan Kendra (KVK), Shamli</p>
                <p style="margin: 0; font-size: 12px; color: #94a3b8; line-height: 1.4;">Sardar Vallabhbhai Patel University of Agriculture and Technology (SVPUAT)</p>
            </div>
            
            <div>
                <h4 style="margin: 0 0 12px 0; font-size: 12px; text-transform: uppercase; color: #64748b; letter-spacing: 1px; font-weight: 800;">Co-Developer</h4>
                <p style="margin: 0 0 4px 0; font-weight: bold; color: #f1f5f9; font-size: 15px;">Dr. Sabah Parvaze</p>
                <p style="margin: 0 0 4px 0; font-size: 13px; color: #38bdf8;">Assistant Professor (Agricultural Engineering)</p>
                <p style="margin: 0 0 2px 0; font-size: 12px; color: #cbd5e1;">College of Agricultural Engineering and Technology</p>
                <p style="margin: 0; font-size: 12px; color: #94a3b8; line-height: 1.4;">Sher-e-Kashmir University of Agricultural Sciences and Technology of Kashmir (SKUAST-K)</p>
            </div>

        </div>
        <div style="margin-top: 25px; display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: #64748b; flex-wrap: wrap; gap: 10px;">
            <span>&copy; ${currentYear} | Developed for Academic & Research Purposes</span>
            <span>Version 1.0.0</span>
        </div>
    </div>
</footer>

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
             const safeName = item.Name.replace(/'/g, "\\'");
             return \`<div class="autocomplete-item" onclick="window.selectJournal('\${safeName}')"><span style="display:block; font-weight:bold; color:var(--primary);">\${item.Name}</span><small style="color:#666;">ISSN: \${item.ISSN}</small></div>\`;
          }).join('');
          dd.style.display = 'block';
        } else { dd.style.display = 'none'; }
      } catch (err) { console.error(err); }
    });
    window.selectJournal = function(val) { inp.value = val; dd.style.display = 'none'; };
    document.addEventListener('click', (e) => { if (e.target !== inp && e.target !== dd) dd.style.display = 'none'; });
  }
</script>
</body>
</html>`;
}
