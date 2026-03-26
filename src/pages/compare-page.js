export function renderComparePage(journals) {
    const preselected = journals.map(j => ({ id: j.master_id, name: j.name, issn: j.issn }));
    return `
    <div class="card">
        <h2>Compare Journals</h2>
        <p>Add up to 4 journals to see head-to-head performance.</p>
        <div style="background: #fafafa; padding: 20px; border-radius: 8px; border: 1px solid #eee;">
            <div style="position: relative; margin-bottom: 20px;">
                <input type="text" id="compare-search" placeholder="Search to add journal..." style="width: 100%; padding: 12px; border: 2px solid var(--border); border-radius: 6px;">
                <div class="autocomplete-dropdown" id="compare-dropdown"></div>
            </div>
            <ul id="selected-list" style="list-style: none; padding: 0;"></ul>
            <form action="/compare" method="GET" id="compare-form">
                <div id="hidden-inputs"></div>
                <button type="submit" id="compare-btn" class="btn" style="width:100%; display:none;">Compare Now</button>
            </form>
        </div>
    </div>
    
    ${journals.length >= 1 ? `
    <div class="card">
        <h3>Comparison Analysis</h3>
        <div style="height: 400px;"><canvas id="compareChart"></canvas></div>
    </div>` : ''}

    <script>
        let selected = ${JSON.stringify(preselected)};
        function updateUI() {
            const list = document.getElementById('selected-list');
            const hidden = document.getElementById('hidden-inputs');
            list.innerHTML = selected.map(j => '<li style="padding:10px; border-bottom:1px solid #ddd; display:flex; justify-content:space-between;">' + j.name + ' <button type="button" onclick="removeJ(\\''+j.id+'\\')">✖</button></li>').join('');
            hidden.innerHTML = selected.map((j, i) => '<input type="hidden" name="id'+(i+1)+'" value="'+j.id+'">').join('');
            document.getElementById('compare-btn').style.display = selected.length >= 2 ? 'block' : 'none';
        }
        window.removeJ = (id) => { selected = selected.filter(x => x.id !== id); updateUI(); };
        updateUI();

        ${journals.length > 0 ? `
        setTimeout(() => {
            const allYears = Array.from(new Set(${JSON.stringify(journals.flatMap(j => j.ratings.map(r => r.year)))})).sort();
            new Chart(document.getElementById('compareChart'), {
                type: 'line',
                data: {
                    labels: allYears,
                    datasets: ${JSON.stringify(journals.map((j, i) => ({
                        label: j.name,
                        data: j.ratings.map(r => r.rating),
                        borderColor: ['#0056b3', '#ff8c00', '#28a745', '#dc3545'][i]
                    })))}
                }
            });
        }, 100);` : ''}
    </script>
    `;
}
