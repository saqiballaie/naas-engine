export function layout(title, content, path, latestYear) {
  const page = path.split('/').pop() || 'index.php';
  const currentYear = new Date().getFullYear();

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} | NAAS Insights</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        :root { --primary: #0056b3; --primary-light: #e3f2fd; --success: #28a745; --danger: #dc3545; --bg: #f8f9fa; --border: #dee2e6; --white: #ffffff; --shadow: 0 4px 12px rgba(0,0,0,0.08); }
        body { font-family: 'Segoe UI', sans-serif; margin: 0; background: var(--bg); display: flex; flex-direction: column; min-height: 100vh; }
        header { background: var(--white); border-bottom: 1px solid var(--border); position: sticky; top: 0; z-index: 1000; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
        .header-container { max-width: 1200px; margin: 0 auto; padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; }
        .logo h1 { margin: 0; color: var(--primary); font-size: 22px; font-weight: 800; }
        nav ul { list-style: none; margin: 0; padding: 0; display: flex; gap: 8px; }
        nav a { color: #495057; text-decoration: none; font-weight: 600; font-size: 14px; padding: 8px 14px; border-radius: 6px; }
        nav a.active { color: var(--white); background: var(--primary); }
        .container { max-width: 1100px; margin: 30px auto; padding: 0 20px; flex: 1; }
        .card { background: var(--white); padding: 25px; border-radius: 10px; box-shadow: var(--shadow); margin-bottom: 25px; border: 1px solid var(--border); }
        .btn { background: var(--primary); color: white; padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer; text-decoration: none; font-weight: 600; display: inline-block; }
        input { padding: 12px; border: 1px solid var(--border); border-radius: 8px; font-size: 14px; width: 100%; box-sizing: border-box; }
        .autocomplete-dropdown { position: absolute; background: white; border: 1px solid #ddd; width: 100%; z-index: 2000; display: none; box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 0 0 8px 8px; }
        .autocomplete-item { padding: 12px; cursor: pointer; border-bottom: 1px solid #eee; text-align: left; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 14px; border-bottom: 1px solid var(--border); text-align: left; }
        th { background: #f8f9fa; font-size: 12px; text-transform: uppercase; color: #666; }
        .rating-badge { background: var(--primary); color: #fff; padding: 4px 10px; border-radius: 4px; font-weight: bold; }
    </style>
</head>
<body>
<header><div class="header-container"><div class="logo"><h1>NAAS Insights</h1></div><nav><ul><li><a href="/" class="active">Search</a></li></ul></nav></div></header>
<div class="container">${content}</div>
<footer style="background: white; border-top: 1px solid var(--border); padding: 40px 20px; color: #495057;">
    <div style="max-width: 1100px; margin: 0 auto;">
        <h3 style="color: var(--primary);">NAAS Insights Engine</h3>
        <p style="color: #6c757d;">Analytical platform by Dr. Saqib Parvaze Allaie & Dr. Sabah Parvaze.</p>
        <div style="font-size: 12px; color: #adb5bd; margin-top: 20px;">&copy; ${currentYear} | Developed for Academic Purposes</div>
    </div>
</footer>
<script>
  const inp = document.getElementById('main-search');
  const dd = document.getElementById('search-dropdown');
  if(inp) {
    inp.addEventListener('input', async () => {
      const v = inp.value.trim();
      if(v.length < 2) { dd.style.display='none'; return; }
      const res = await fetch('/?ajax_search=' + encodeURIComponent(v));
      const data = await res.json();
      if(data.length > 0) {
        dd.innerHTML = data.map(i => \`<div class="autocomplete-item" onclick="window.sel('\${i.Name.replace(/'/g, "\\\\'")}')"><b>\${i.Name}</b><br><small>\${i.ISSN}</small></div>\`).join('');
        dd.style.display = 'block';
      } else { dd.style.display = 'none'; }
    });
    window.sel = (v) => { inp.value = v; dd.style.display = 'none'; };
    document.addEventListener('click', e => { if(e.target !== inp) dd.style.display='none'; });
  }
</script>
</body></html>`;
}
