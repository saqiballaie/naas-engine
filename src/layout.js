export function layout(title, content, path, latestYear) {
  const currentYear = new Date().getFullYear();
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} | NAAS Insights Engine</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        :root { --primary: #0056b3; --primary-light: #e3f2fd; --success: #28a745; --danger: #dc3545; --bg: #f8f9fa; --border: #dee2e6; --white: #ffffff; }
        * { box-sizing: border-box; }
        body { font-family: 'Segoe UI', sans-serif; margin: 0; background: var(--bg); color: #333; display: flex; flex-direction: column; min-height: 100vh; }
        header { background: var(--white); border-bottom: 1px solid var(--border); position: sticky; top: 0; z-index: 1000; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
        .header-container { max-width: 1200px; margin: 0 auto; padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; }
        .logo h1 { margin: 0; color: var(--primary); font-size: 22px; font-weight: 800; }
        nav ul { list-style: none; margin: 0; padding: 0; display: flex; gap: 8px; }
        nav a { color: #495057; text-decoration: none; font-weight: 600; font-size: 14px; padding: 8px 14px; border-radius: 6px; }
        nav a:hover, nav a.active { color: var(--white); background: var(--primary); }
        .main-content { flex: 1; }
        .container { max-width: 1100px; margin: 30px auto; padding: 0 20px; }
        .card { background: var(--white); padding: 25px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); margin-bottom: 25px; border: 1px solid var(--border); }
        .btn { background: var(--primary); color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; }
        .autocomplete-dropdown { position: absolute; background: white; border: 1px solid #ddd; width: 100%; z-index: 2000; display: none; box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 0 0 8px 8px; max-height: 300px; overflow-y: auto; }
        .autocomplete-item { padding: 12px; cursor: pointer; border-bottom: 1px solid #eee; text-align: left; }
        .autocomplete-item:hover { background: var(--primary-light); }
        @media (max-width: 768px) { .header-container { flex-direction: column; } nav ul { margin-top: 10px; } }
    </style>
</head>
<body>
<header>
    <div class="header-container">
        <div class="logo"><h1>NAAS Insights Engine</h1></div>
        <nav><ul><li><a href="/" class="active">Search</a></li></ul></nav>
    </div>
</header>
<div class="main-content"><div class="container">${content}</div></div>
<footer style="margin-top: 40px; background: white; border-top: 1px solid var(--border); padding: 40px 20px; color: #495057;">
    <div style="max-width: 1100px; margin: 0 auto;">
        <h3 style="color: var(--primary); margin-top: 0; margin-bottom: 10px;">NAAS Insights Engine</h3>
        <p style="font-size: 14px; color: #6c757d; max-width: 600px; margin-bottom: 20px;">Platform designed to provide access to historical NAAS ratings and longitudinal journal performance metrics.</p>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; padding-bottom: 20px; border-bottom: 1px solid #eee;">
            <div>
                <h4 style="margin: 0 0 5px 0; font-size: 15px;">Lead Developer</h4>
                <p style="margin: 0; font-weight: bold; color: var(--primary); font-size: 14px;">Dr. Saqib Parvaze Allaie</p>
                <p style="margin: 0; font-size: 12px; color: #666;">KVK Shamli - SVPUAT</p>
            </div>
            <div>
                <h4 style="margin: 0 0 5px 0; font-size: 15px;">Co-Developer</h4>
                <p style="margin: 0; font-weight: bold; color: var(--primary); font-size: 14px;">Dr. Sabah Parvaze</p>
                <p style="margin: 0; font-size: 12px; color: #666;">CoAE&T, SKUAST-Kashmir</p>
            </div>
        </div>
        <div style="margin-top: 20px; display: flex; justify-content: space-between; font-size: 12px; color: #adb5bd;">
            <span>&copy; ${currentYear} | NAAS Insights Engine</span>
            <span>Developed for Academic & Research Purposes</span>
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
          // Careful escaping for single quotes in journal names
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
