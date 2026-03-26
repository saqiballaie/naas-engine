export function renderFooter() {
  const currentYear = new Date().getFullYear();
  return `
    <footer style="margin-top: 50px; background: #1e293b; color: #f8f9fa; padding: 50px 20px 30px;">
        <div style="max-width: 1100px; margin: 0 auto;">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 40px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 40px;">
                <div>
                    <h3 style="color: #fff; margin-bottom: 15px; font-size: 20px;">NAAS Insights Engine</h3>
                    <p style="font-size: 14px; color: #94a3b8;">Analytical platform for longitudinal performance metrics of scientific journals.</p>
                </div>
                <div>
                    <h4 style="font-size: 12px; text-transform: uppercase; color: #64748b;">Project Lead</h4>
                    <p style="margin: 0; font-weight: bold; color: #f1f5f9;">Dr. Saqib Parvaze Allaie</p>
                    <p style="margin: 0; font-size: 12px; color: #cbd5e1;">KVK Shamli, SVPUAT</p>
                </div>
                <div>
                    <h4 style="font-size: 12px; text-transform: uppercase; color: #64748b;">Co-Developer</h4>
                    <p style="margin: 0; font-weight: bold; color: #f1f5f9;">Dr. Sabah Parvaze</p>
                    <p style="margin: 0; font-size: 12px; color: #cbd5e1;">CoAE&T, SKUAST-Kashmir</p>
                </div>
            </div>
            <div style="margin-top: 25px; display: flex; justify-content: space-between; font-size: 12px; color: #64748b;">
                <span>&copy; ${currentYear} | Academic & Research Purposes</span>
                <span>Version 1.1.0</span>
            </div>
        </div>
    </footer>
  `;
}
