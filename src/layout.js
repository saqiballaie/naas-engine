export function layout(title, content, path, latestYear) {
  const currentYear = new Date().getFullYear();
  const isSearchActive = (path === '/' || path === '/index.php') ? 'active' : '';
  const isCompareActive = (path.startsWith('/compare')) ? 'active' : '';
  const isStatsActive = (path === '/statistics') ? 'active' : '';

  return `<!DOCTYPE html>
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
        .logo h1 { margin: 0; color: var(--primary); font-size: 22px; font-weight: 800; }
        nav ul { list-style: none; margin: 0; padding: 0; display: flex; gap: 8px; }
        nav a { color: #495057; text-decoration: none; font-weight: 600; font-size: 14px; padding: 8px 14px; border-radius: 6px; }
        nav a:hover, nav a.active { color: var(--white); background: var(--primary); }
        .container { max-width: 1100px; margin: 25px auto; padding: 0 20px; width: 100%; }
        .card { background: var(--white); padding: 25px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); margin-bottom: 25px; border: 1px solid var(--border); }
        .btn { background: var(--primary); color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; padding: 10px 16px; transition: opacity 0.2s; }
        .table-responsive { width: 100%; overflow-x: auto; border: 1px solid var(--border); border-radius: 8px; background: white; }
        table { width: 100%; border-collapse: collapse; }
        th { white-space: nowrap; background: #f8f9fa; font-size: 12px; text-transform: uppercase; color: #666; }
        th, td { padding: 12px 15px; text-align: left; border-bottom: 1px solid #eee; }
        @media (max-width: 768px) { .header-container { flex-direction: column; gap: 10px; } }
    </style>
</head>
<body>
<header>
    <div class="header-container">
        <div class="logo"><h1>NAAS Insights Engine</h1></div>
        <nav>
            <ul>
                <li><a href="/" class="${isSearchActive}">Search</a></li>
                <li><a href="/compare" class="${isCompareActive}">Compare</a></li>
                <li><a href="/statistics" class="${isStatsActive}">Statistics 📊</a></li>
            </ul>
        </nav>
    </div>
</header>
<div class="container">${content}</div>
</body>
</html>`;
}
