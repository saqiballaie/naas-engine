export function renderHeader(path) {
  const isSearchActive = (path === '/' || path === '/index.php') ? 'active' : '';
  const isCompareActive = (path.startsWith('/compare')) ? 'active' : '';
  const isStatsActive = (path === '/statistics') ? 'active' : '';

  return `
    <header style="background: var(--white); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); position: sticky; top: 0; z-index: 1000;">
        <div style="max-width: 1200px; margin: 0 auto; padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px;">
            <div class="logo">
                <h1 style="margin: 0; color: var(--primary); font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">NAAS Insights Engine</h1>
            </div>
            <div style="font-size: 12px; color: #64748b; font-weight: 600; text-align: right; line-height: 1.4; border-left: 2px solid #e2e8f0; padding-left: 15px;">
                A joint initiative by<br>
                <span style="color: #475569;">SVPUAT</span> & <span style="color: #475569;">SKUAST-Kashmir</span>
            </div>
        </div>

        <nav style="background: var(--primary);">
            <ul style="max-width: 1200px; margin: 0 auto; list-style: none; padding: 0 20px; display: flex; gap: 5px;">
                <li><a href="/" class="nav-link ${isSearchActive}">Search</a></li>
                <li><a href="/compare" class="nav-link ${isCompareActive}">Compare</a></li>
                <li><a href="/statistics" class="nav-link ${isStatsActive}">Statistics</a></li>
            </ul>
        </nav>

        <style>
            .nav-link { 
                display: block;
                color: rgba(255,255,255,0.8); 
                text-decoration: none; 
                font-weight: 600; 
                font-size: 14px; 
                padding: 12px 24px; 
                transition: all 0.2s ease;
                border-bottom: 3px solid transparent;
            }
            .nav-link:hover { 
                color: var(--white); 
                background: rgba(255,255,255,0.1); 
            }
            .nav-link.active { 
                color: var(--white); 
                background: rgba(0,0,0,0.15);
                border-bottom: 3px solid var(--accent);
            }
            
            /* Mobile adjustments */
            @media (max-width: 768px) {
                header > div { flex-direction: column; align-items: flex-start; }
                header > div > div:nth-child(2) { text-align: left; border-left: none; padding-left: 0; border-top: 2px solid #e2e8f0; padding-top: 10px; width: 100%; }
                .nav-link { padding: 12px 15px; font-size: 13px; }
            }
        </style>
    </header>
  `;
}
