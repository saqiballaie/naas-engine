/**
 * Renders a responsive table.
 * @param {string[]} headers - Array of column titles.
 * @param {string[][]} rows - Array of arrays containing row data.
 */
export function renderTable(headers, rows) {
    return `
    <div class="table-responsive">
        <table>
            <thead>
                <tr style="background: #f8f9fa;">
                    ${headers.map(h => `<th>${h}</th>`).join('')}
                </tr>
            </thead>
            <tbody>
                ${rows.map(row => `
                    <tr>
                        ${row.map(cell => `<td>${cell}</td>`).join('')}
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>
    `;
}
