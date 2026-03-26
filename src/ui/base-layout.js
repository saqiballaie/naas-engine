import { renderHead } from './head.js';
import { renderHeader } from './header.js';
import { renderFooter } from './footer.js';

export function layout(title, content, path) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        ${renderHead(title)}
    </head>
    <body>
        ${renderHeader(path)}
        <main class="main-content">
            <div class="container">
                ${content}
            </div>
        </main>
        ${renderFooter()}
    </body>
    </html>
  `;
}
