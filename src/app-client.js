// This is the code for the client-side app.js
const appJS = `
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. CHART INITIALIZATION ENGINE
    // Finds any canvas with data-chart="true" and builds it
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
                        
                        // Client-side escaping just to be safe
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

    // Initialize Main Search Autocomplete
    setupAutocomplete('main-search', 'search-dropdown', (item) => {
        window.location.href = '/journal?id=' + item.getAttribute('data-id');
    });

    // 3. COMPARE PAGE STATE MANAGEMENT
    const compareState = document.getElementById('compare-state');
    if (compareState) {
        let selected = JSON.parse(compareState.getAttribute('data-preselected') || '[]');
        
        window.removeJ = (id) => { 
            selected = selected.filter(x => x.id !== id); 
            updateCompareUI(); 
            if(selected.length > 0) document.getElementById('compare-form').submit(); 
            else window.location.href = '/compare'; 
        };

        function updateCompareUI() {
            const list = document.getElementById('selected-list');
            const hidden = document.getElementById('hidden-inputs');
            const searchInp = document.getElementById('compare-search');
            
            list.innerHTML = selected.map(j => 
                '<li style="padding: 12px 15px; background: #fff; border: 1px solid #e2e8f0; border-radius: 6px; display: flex; justify-content: space-between; align-items: center;">' +
                '<span style="font-weight: 600; color: #334155; font-size: 14px;">' + j.name + ' <small style="color:#94a3b8; font-weight:normal;">(ISSN: ' + j.issn + ')</small></span>' +
                '<button type="button" onclick="window.removeJ(\\'' + j.id + '\\')" style="background: #fee2e2; color: #dc2626; border: none; border-radius: 4px; padding: 4px 8px; cursor: pointer; font-size: 12px; font-weight: bold;">✖ Remove</button></li>'
            ).join('');
            
            hidden.innerHTML = selected.map((j, i) => '<input type="hidden" name="id' + (i+1) + '" value="' + j.id + '">').join('');
            
            if (selected.length >= 5) { 
                searchInp.placeholder = "Maximum of 5 journals reached."; searchInp.disabled = true; 
            } else { 
                searchInp.placeholder = "Search by Journal Name or ISSN to add..."; searchInp.disabled = false; 
            }
            document.getElementById('compare-btn').style.display = selected.length >= 2 ? 'block' : 'none';
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
});
`;
