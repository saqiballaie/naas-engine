export function renderFooter() {
  return `
    <footer style="margin-top: 50px; background: #1e293b; color: #f8f9fa; padding: 50px 20px 30px;">
        <div style="max-width: 1100px; margin: 0 auto;">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 40px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 40px;">
                <div>
                    <h3 style="color: #fff; margin-bottom: 15px; font-size: 20px;">NAAS Insights Engine</h3>
                    <p style="font-size: 14px; color: #94a3b8; line-height: 1.6;">Analytical platform for longitudinal performance metrics and trend evaluations of scientific agricultural journals.</p>
                </div>
                <div>
                    <h4 style="font-size: 12px; text-transform: uppercase; color: #64748b; margin-bottom: 8px;">Project Lead</h4>
                    <p style="margin: 0 0 5px 0;"><a href="https://www.linkedin.com/in/saqibparvaze/" target="_blank" class="author-link">Dr. Saqib Parvaze Allaie</a></p>
                    <p style="margin: 0; font-size: 12px; color: #cbd5e1; line-height: 1.5;">SMS (Agri. Engg.), KVK Shamli<br>SVPUAT, Meerut, UP</p>
                </div>
                <div>
                    <h4 style="font-size: 12px; text-transform: uppercase; color: #64748b; margin-bottom: 8px;">Co-Developer</h4>
                    <p style="margin: 0 0 5px 0;"><a href="https://www.linkedin.com/in/sabah-parvaze-67a769ab/" target="_blank" class="author-link">Dr. Sabah Parvaze</a></p>
                    <p style="margin: 0; font-size: 12px; color: #cbd5e1; line-height: 1.5;">Assistant Professor (Agri. Engg.), CoAE&T<br>SKUAST-Kashmir, J&K</p>
                </div>
            </div>
            
            <div style="margin-top: 25px; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 15px; font-size: 12px; color: #94a3b8;">
                <div style="font-weight: 600; color: #f1f5f9;">
                    &copy; 2026 SVPUAT & SKUAST-K. Developed by Saqib Parvaze & Sabah Parvaze.
                </div>
                <div style="display: flex; gap: 15px; align-items: center;">
                    <a href="/disclaimer" class="legal-link">Disclaimer</a>
                    <a href="/terms" class="legal-link">Terms</a>
                    <span>|</span>
                    <span>Version 1.2.5</span>
                </div>
            </div>
        </div>
        <style>
            .author-link { color: #f1f5f9; font-weight: bold; text-decoration: none; font-size: 14px; }
            .author-link:hover { color: #38bdf8; text-decoration: underline; }
            .legal-link { color: #cbd5e1; text-decoration: none; }
            .legal-link:hover { color: #fff; text-decoration: underline; }
        </style>
    </footer>
  `;
}
