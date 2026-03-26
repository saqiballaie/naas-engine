export function layout(title, content, path, latestYear) {
  const page = path.split('/').pop() || 'index.php';
  
  // Logic for Breadcrumb titles
  const modules = {
    'index.php': 'Journal Search Portal',
    '/': 'Journal Search Portal',
    'journalmetrics.php': 'Journal Analytics Dashboard',
    'journal': 'Journal Analytics Dashboard'
  };
  const currentModule = modules[page] || "NAAS Insights Engine";

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
            --primary: #0056b3; --primary-light: #e3f2fd; --success: #28a745; 
            --danger: #dc3545; --bg: #f8f9fa; --border: #dee2e6; --white: #ffffff;
        }
        body { font-family: 'Segoe UI', sans-serif; margin: 0; background: var(--bg); color: #333; line-height: 1.6; }
        header { background: var(--white); border-bottom: 1px solid var(--border); position: sticky; top: 0; z-index: 1000; }
        .header-container { max-width: 1200px; margin: 0 auto; padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; }
        .logo h1 { margin: 0; color: var(--primary); font-size: 22px; font-weight: 800; }
        nav ul { list-style: none; margin: 0; padding: 0; display: flex; gap: 8px; }
        nav a { color: #495057; text-decoration: none; font-weight: 600; font-size: 14px; padding: 8px 14px; border-radius: 6px; }
        nav a.active { color: var(--white); background: var(--primary); }
        .page-title-strip { background: var(--white); padding: 10px 0; border-bottom: 1px solid var(--border); }
        .strip-container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
        .breadcrumb { color: #6c757d; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px; }
        .container { max-width: 1100px; margin: 30px auto; padding: 0 20px; }
        .card { background: var(--white); padding: 25px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); margin-bottom: 25px; border: 1px solid var(--border); }
        .btn { background: var(--primary); color: white; padding: 11px 22px; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; text-decoration: none; display: inline-block; }
        input { padding: 10px; border: 1px solid var(--border); border-radius: 6px; font-size: 14px; }
        .autocomplete-dropdown { position: absolute; background: white; border: 1px solid #ddd; width: 100%; z-index: 2000; display: none; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .autocomplete-item { padding: 12px; cursor: pointer; border-bottom: 1px solid #eee; }
    </style>
</head>
<body>
<header>
    <div class="header-container">
        <div class="logo"><h1>NAAS Insights Engine</h1></div>
        <nav>
            <ul>
                <li><a href="/" class="${(page === 'index.php' || path === '/') ? 'active' : ''}">Search</a></li>
                <li><a href="/admin/upload">Upload</a></li>
            </ul>
        </nav>
    </div>
</header>
<div class="page-title-strip">
    <div class="strip-container">
        <span class="breadcrumb">Current Module: <span style="color: var(--primary);">${currentModule}</span></span>
    </div>
</div>
<div class="container">${content}</div>
</body>
</html>`;
}
