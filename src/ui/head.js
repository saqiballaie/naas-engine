export function renderHead(title) {
  return `
    <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} | NAAS Insights Engine</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js" defer></script>
    <script src="/app.js" defer></script>
    <style>
        :root { --primary: #0056b3; --primary-light: #e3f2fd; --accent: #ff8c00; --success: #28a745; --danger: #dc3545; --bg: #f4f6f8; --border: #dee2e6; --white: #ffffff; }
        * { box-sizing: border-box; }
        body { font-family: 'Segoe UI', system-ui, sans-serif; margin: 0; background: var(--bg); color: #333; display: flex; flex-direction: column; min-height: 100vh; }
        .main-content { flex: 1; }
        .container { max-width: 1100px; margin: 30px auto; padding: 0 20px; width: 100%; }
        .card { background: var(--white); padding: 25px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); margin-bottom: 25px; border: 1px solid var(--border); }
        .btn { background: var(--primary); color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; transition: opacity 0.2s; padding: 10px 20px; }
        .btn:hover { opacity: 0.9; }
        .table-responsive { width: 100%; overflow-x: auto; border: 1px solid var(--border); border-radius: 8px; background: white; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; font-size: 14px; }
        .autocomplete-dropdown { position: absolute; background: white; border: 1px solid #ddd; width: 100%; z-index: 2000; display: none; box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 0 0 8px 8px; max-height: 300px; overflow-y: auto; }
        .autocomplete-item { padding: 12px; cursor: pointer; border-bottom: 1px solid #eee; }
        .autocomplete-item:hover { background: var(--primary-light); }
        @media (max-width: 768px) { .container { margin: 15px auto; } th, td { padding: 10px 8px; font-size: 13px; } }
    </style>
  `;
}
