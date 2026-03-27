/**
 * Generates a script tag to initialize a Line Chart.
 */
export function initLineChart(canvasId, labels, datasets) {
    return `
    <script>
        setTimeout(() => {
            new Chart(document.getElementById('${canvasId}'), {
                type: 'line',
                data: {
                    labels: ${JSON.stringify(labels).replace(/</g, '\\u003c')},
                    datasets: ${JSON.stringify(datasets).replace(/</g, '\\u003c')}
                },
                options: { 
                    responsive: true, 
                    maintainAspectRatio: false,
                    tension: 0.2
                }
            });
        }, 100);
    </script>
    `;
}

/**
 * Generates a script tag to initialize a Pie Chart.
 */
export function initPieChart(canvasId, labels, data, colors) {
    return `
    <script>
        setTimeout(() => {
            new Chart(document.getElementById('${canvasId}'), {
                type: 'pie',
                data: {
                    labels: ${JSON.stringify(labels)},
                    datasets: [{
                        data: ${JSON.stringify(data)},
                        backgroundColor: ${JSON.stringify(colors)}
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false }
            });
        }, 100);
    </script>
    `;
}
