export const appJS = `
// Because this is loaded via <script defer>, the DOM is already ready.
// We execute immediately to prevent race conditions.

// 1. CHART INITIALIZATION ENGINE
document.querySelectorAll('canvas[data-chart="true"]').forEach(canvas => {
    try {
        const rawLabels = canvas.getAttribute('data-labels');
        const rawDatasets = canvas.getAttribute('data-datasets');
        const type = canvas.getAttribute('data-chart-type') || 'line';
        
        if (!rawLabels || !rawDatasets) return;
        
        const labels = JSON.parse(rawLabels);
        const datasets = JSON.parse(rawDatasets);
        
        new Chart(canvas, {
            type: type,
            data: { labels, datasets },
            options: { 
                responsive: true, 
                maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false }
            }
        });
    } catch(e) { console.error('Chart init failed:', e); }
});

// 2. AUTOCOMPLETE ENGINE (Main & Compare)
function setupAutocomplete(inputId, dropdownId, onSelectCallback) {
    const inp = document.getElementById(inputId);
    const dd = document.getElementById(dropdownId);
    if (!inp || !dd) return;

    inp.addEventListener('input', async () => {
        const val = inp.value.trim();
        if (val.length < 2) { dd.style.display = 'none'; return; }
        try {
            const res = await fetch('/?ajax_search=' + encodeURIComponent(val));
            const data = await res.json();
            
            if (data.length > 0) {
                dd.innerHTML = data.map(item => {
                    const rawName = item.Name || item.name || "Unknown";
                    const issn = item.ISSN || item.issn || 'N/A';
                    
                    const safeName = rawName.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
                    const safeIssn = issn.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                    
                    return '<div class="autocomplete-item" data-id="' + item.master_id + '" data-name="' + safeName + '" data-issn="' + safeIssn + '">' +
                           '<span style="display:block; font-weight:bold; color:#0056b3;">' + safeName + '</span>' +
                           '<small style="color:#666;">ISSN: ' + safeIssn + '</small></div>';
                }).join('');
                dd.style.display = 'block';
            } else { dd.style.display = 'none'; }
        } catch (err) { console.error(err); }
    });

    dd.addEventListener('click', (e) => {
        const item = e.target.closest('.autocomplete-item');
        if (item) onSelectCallback(item, inp, dd);
    });

    document.addEventListener('click', (e) => { 
        if (e.target !== inp && e.target !== dd) dd.style.display = 'none'; 
    });
}

// Initialize Main Search
setupAutocomplete('main-search', 'search-dropdown', (item) => {
    window.location.href = '/journal?id=' + item.getAttribute('data-id');
});

// 3. COMPARE PAGE STATE MANAGEMENT
const compareState = document.getElementById('compare-state');
if (compareState) {
    let selected = JSON.parse(compareState.getAttribute('data-preselected') || '[]');
    
    const runComparison = () => {
        if (selected.length === 0) {
            window.location.href = '/compare';
            return;
        }
        const params = new URLSearchParams();
        selected.forEach((j, i) => {
            params.append('id' + (i + 1), j.id);
        });
        window.location.href = '/compare?' + params.toString();
    };

    // CSP Compliant Event Delegation (Replaces inline onclick)
    document.addEventListener('click', (e) => {
        const removeBtn = e.target.closest('.remove-journal-btn');
        if (removeBtn) {
            const id = removeBtn.getAttribute('data-id');
            selected = selected.filter(x => x.id !== id); 
            updateCompareUI(); 
            runComparison();
        }
    });

    function updateCompareUI() {
        const list = document.getElementById('selected-list');
        const searchInp = document.getElementById('compare-search');
        const compareBtn = document.getElementById('compare-btn');
        
        if (list) {
            list.innerHTML = selected.map(j => 
                '<li style="padding: 12px 15px; background: #fff; border: 1px solid #e2e8f0; border-radius: 6px; display: flex; justify-content: space-between; align-items: center;">' +
                '<span style="font-weight: 600; color: #334155; font-size: 14px;">' + j.name + ' <small style="color:#94a3b8; font-weight:normal;">(ISSN: ' + j.issn + ')</small></span>' +
                '<button type="button" class="remove-journal-btn" data-id="' + j.id + '" style="background: #fee2e2; color: #dc2626; border: none; border-radius: 4px; padding: 4px 8px; cursor: pointer; font-size: 12px; font-weight: bold;">✖ Remove</button></li>'
            ).join('');
        }
        
        if (searchInp) {
            if (selected.length >= 5) { 
                searchInp.placeholder = "Maximum of 5 journals reached."; searchInp.disabled = true; 
            } else { 
                searchInp.placeholder = "Search by Journal Name or ISSN to add..."; searchInp.disabled = false; 
            }
        }
        
        if (compareBtn) {
            compareBtn.style.display = selected.length >= 2 ? 'block' : 'none';
        }
    }

    const compareBtn = document.getElementById('compare-btn');
    if (compareBtn) {
        compareBtn.addEventListener('click', (e) => {
            e.preventDefault(); 
            runComparison();    
        });
    }

    setupAutocomplete('compare-search', 'compare-dropdown', (item, inp, dd) => {
        const id = item.getAttribute('data-id');
        if(selected.some(s => s.id === id) || selected.length >= 5) return;
        selected.push({
            id: id,
            name: item.getAttribute('data-name'),
            issn: item.getAttribute('data-issn')
        });
        inp.value = ''; dd.style.display = 'none';
        updateCompareUI();
    });

    updateCompareUI();
}
\`;
