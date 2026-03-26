export function renderHeader(path) {
  const isSearchActive = (path === '/' || path === '/index.php') ? 'active' : '';
  const isCompareActive = (path.startsWith('/compare')) ? 'active' : '';

  return `
    <header style="background: var(--white); border-bottom: 1px solid var(--border); position: sticky; top: 0; z-index: 1000; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
        <div style="max-width: 1200px; margin: 0 auto; padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;">
            <div class="logo">
                <h1 style="margin: 0; color: var(--primary); font-size: 22px; font-weight: 800;">NAAS Insights Engine</h1>
                <div style="font-size: 11px; color: #6c757d; margin-top: 3px; font-weight: 500;">
                    SVP University of Agriculture and Technology & SKUAST-Kashmir
                </div>
            </div>
            <nav>
                <ul style="list-style: none; margin: 0; padding: 0; display: flex; gap: 8px;">
                    <li><a href="/" class="nav-link ${isSearchActive}">Search</a></li>
                    <li><a href="/compare" class="nav-link ${isCompareActive}">Compare</a></li>
                    <li><a href="/statistics" class="nav-link">Statistics</a></li>
                </ul>
            </nav>
        </div>
        <style>
            .nav-link { color: #495057; text-decoration: none; font-weight: 600; font-size: 14px; padding: 8px 14px; border-radius: 6px; transition: all 0.2s; }
            .nav-link:hover, .nav-link.active { color: var(--white); background: var(--primary); }
        </style>
    </header>
  `;
}
