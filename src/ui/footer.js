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
                    <p style="margin: 0 0 5px 0;">
                        <a href="https://www.linkedin.com/in/saqibparvaze/" target="_blank" rel="noopener noreferrer" class="author-link">Dr. Saqib Parvaze Allaie</a>
                    </p>
                    <p style="margin: 0; font-size: 12px; color: #cbd5e1; line-height: 1.5;">
                        Subject Matter Specialist (Agricultural Engineering)<br>
                        Krishi Vigyan Kendra (KVK), Shamli<br>
                        Sardar Vallabhbhai Patel University of Agriculture and Technology
                    </p>
                </div>
                <div>
                    <h4 style="font-size: 12px; text-transform: uppercase; color: #64748b; margin-bottom: 8px;">Co-Developer</h4>
                    <p style="margin: 0 0 5px 0;">
                        <a href="https://www.linkedin.com/in/sabah-parvaze-67a769ab/" target="_blank" rel="noopener noreferrer" class="author-link">Dr. Sabah Parvaze</a>
                    </p>
                    <p style="margin: 0; font-size: 12px; color: #cbd5e1; line-height: 1.5;">
                        Assistant Professor (Agricultural Engineering)<br>
                        College of Agricultural Engineering and Technology (CoAE&T)<br>
                        Sher-e-Kashmir University of Agricultural Sciences and Technology of Kashmir
                    </p>
                </div>
            </div>
            
            <div style="margin-top: 25px; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 15px; font-size: 12px; color: #94a3b8;">
                <div style="font-weight: 500;">
                    &copy; ${new Date().getFullYear()} Dr. Saqib Parvaze Allaie & Dr. Sabah Parvaze. All Rights Reserved.
                </div>
                <div style="display: flex; gap: 15px; align-items: center;">
                    <a href="/disclaimer" class="legal-link">Disclaimer</a>
                    <span>|</span>
                    <a href="/terms" class="legal-link">Terms of Use</a>
                    <span>|</span>
                    <span>Version 1.2.2</span>
                </div>
            </div>
        </div>
        
        <style>
            .author-link { color: #f1f5f9; font-weight: bold; text-decoration: none; display: inline-flex; align-items: center; gap: 5px; transition: color 0.2s ease; font-size: 14px; }
            .author-link::after { content: '🔗'; font-size: 10px; opacity: 0.6; transition: opacity 0.2s ease; }
            .author-link:hover { color: #38bdf8; text-decoration: underline; }
            .author-link:hover::after { opacity: 1; }
            
            .legal-link { color: #cbd5e1; text-decoration: none; transition: color 0.2s ease; }
            .legal-link:hover { color: #ffffff; text-decoration: underline; }
        </style>
    </footer>
  `;
}
