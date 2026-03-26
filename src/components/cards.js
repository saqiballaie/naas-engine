/**
 * Renders a standardized card container.
 * @param {string} content - The HTML content inside the card.
 * @param {string} extraStyles - Optional inline CSS (e.g., 'border-top: 5px solid var(--primary);').
 */
export function renderCard(content, extraStyles = '') {
    return `
    <div class="card" style="${extraStyles}">
        ${content}
    </div>
    `;
}
