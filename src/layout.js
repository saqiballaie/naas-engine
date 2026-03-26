export function layout(title, content, path, latestYear) {
  const page = path.split('/').pop() || 'index.php';
  
  const modules = {
    'index.php': 'Journal Search Portal',
    '/': 'Journal Search Portal',
    'journalmetrics.php': 'Journal Analytics Dashboard',
    'journal': 'Journal Analytics Dashboard'
  };
  const currentModule = modules[page] || "NAAS Insights Engine";
  const currentYear = new Date().getFullYear();

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} | NAAS Insights</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        :root { 
            --primary: #0056b3; --primary-light: #e3f2fd; --accent: #ff8c00; 
            --success: #28a745; --danger: #dc3545; --bg: #f8f9fa; 
            --text: #333; --text-muted: #666; --border: #dee2e6; --white: #ffffff;
            --shadow: 0 4px 12px rgba(0,0,0,0.08);
        }
        * { box-sizing: border-box; }
        body { font-family: 'Segoe UI', sans-serif; margin: 0; background: var(--bg); color: var(--text); line-height: 1.6; display: flex; flex-direction: column; min-height: 100vh; }
        header { background: var(--white); border-bottom: 1px solid var(--border); position: sticky; top: 0; z-index: 1000; }
        .header-container { max-width: 1200px; margin: 0 auto; padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; }
        .logo h1 { margin: 0; color: var(--primary); font-size: 22px; font-weight: 800; }
        nav ul { list-style: none; margin: 0; padding: 0; display: flex; gap: 8px; }
        nav a { color: #495057; text-decoration: none; font-weight: 600; font-size: 14px; padding: 8px 14px; border-radius: 6px; }
        nav a.active { color: var(--white); background: var(--primary); }
        .page-title-strip { background: var(--white); padding: 10px 0; border-bottom: 1px solid var(--border); }
        .strip-container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
        .breadcrumb { color: #6c757d; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px; }
        .main-content { flex: 1; }
        .container { max-width: 1100px; margin: 30px auto; padding: 0 20px; }
        .card { background: var(--white); padding: 25px; border-radius: 10px; box-shadow: var(--shadow); margin-bottom: 25px; border: 1px solid var(--border); }
        .btn { background: var(--primary); color: white; padding: 11px 22px; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; text-decoration: none; display: inline-block; }
        input { padding: 10px; border: 1px solid var(--border); border-radius: 6px; font-size: 14px; }
        .autocomplete-dropdown { position: absolute; background: white; border: 1px solid #ddd; width: 100%; z-index: 2000; display: none; box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 0 0 8px 8px; max-height: 300px; overflow-y: auto; }
        .autocomplete-item { padding: 12px; cursor: pointer; border-bottom: 1px solid #eee; text-align: left; }
        .autocomplete-item:hover { background: var(--primary-light); }
    </style>
</head>
<body>
<header>
    <div class="header-container">
        <div class="logo"><h1>NAAS Insights Engine</h1></div>
        <nav>
            <ul>
                <li><a href="/" class="${(page === 'index.php' || path === '/') ? 'active' : ''}">Search</a></li>
                <li><a href="/admin/upload">Upload Data</a></li>
            </ul>
        </nav>
    </div>
</header>

<div class="page-title-strip">
    <div class="strip-container">
        <span class="breadcrumb">Current Module: <span style="color: var(--primary);">${currentModule}</span></span>
    </div>
</div>

<div class="main-content">
    <div class="container">${content}</div>
</div>

<footer style="margin-top: 60px; background: white; border-top: 1px solid var(--border); padding: 40px 20px; color: #495057;">
    <div style="max-width: 1100px; margin: 0 auto;">
        <div style="margin-bottom: 30px; border-bottom: 1px solid #eee; padding-bottom: 20px;">
            <h3 style="color: var(--primary); margin-top: 0;">NAAS Insights Engine</h3>
            <p style="line-height: 1.6; font-size: 15px; color: #6c757d; max-width: 800px;">
                A specialized analytical platform designed to provide researchers, students, and scientists 
                with transparent access to historical NAAS ratings and longitudinal journal performance metrics.
            </p>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px;">
            <div>
                <h4 style="margin: 0 0 10px 0; color: var(--text); font-size: 16px;">Lead Developer</h4>
                <p style="font-size: 15px; font-weight: bold; margin: 0; color: var(--primary);">Dr. Saqib Parvaze Allaie</p>
                <p style="font-size: 14px; margin: 2px 0; color: #666;">SMS (Agri. Engg.)</p>
                <p style="font-size: 13px; margin: 2px 0; color: #888;">KVK Shamli - SVPUAT</p>
            </div>
            <div>
                <h4 style="margin: 0 0 10px 0; color: var(--text); font-size: 16px;">Co-Developer</h4>
                <p style="font-size: 15px; font-weight: bold; margin: 0; color: var(--primary);">Dr. Sabah Parvaze</p>
                <p style="font-size: 14px; margin: 2px 0; color: #666;">Asstt. Prof. (Agri. Engg.)</p>
                <p style="font-size: 13px; margin: 2px 0; color: #888;">CoAE&T, SKUAST-Kashmir</p>
            </div>
        </div>
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #f8f9fa; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;">
            <p style="font-size: 12px; color: #adb5bd;">&copy; ${currentYear} | NAAS Insights Engine</p>
            <p style="font-size: 12px; color: #adb5bd;">Developed for Academic & Research Purposes</p>
        </div>
    </div>
</footer>

<script>
  // AUTOCOMPLETE LOGIC
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
          dd.innerHTML = data.map(item => \`
            <div class="autocomplete-item" onclick="window.selectJournal('\${item.Name.replace(/'/g, "\\\\'")}')">
              <span style="display:block; font-weight:bold; color:var(--primary);">\${item.Name}</span>
              <small style="color:#666;">ISSN: \${item.ISSN}</small>
            </div>
          \`).join('');
          dd.style.display = 'block';
        } else { dd.style.display = 'none'; }
      } catch (err) { console.error('Search error:', err); }
    });

    window.selectJournal = function(val) {
      inp.value = val;
      dd.style.display = 'none';
    };

    document.addEventListener('click', (e) => {
      if (e.target !== inp && e.target !== dd) dd.style.display = 'none';
    });
  }
</script>
</body>
</html>`;
}
