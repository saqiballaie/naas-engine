export function renderFooter() {
  return `
    <footer style="margin-top: 50px; background: #1e293b; color: #f8f9fa; padding: 50px 20px 30px;">
        <div style="max-width: 1100px; margin: 0 auto;">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 40px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 40px;">
                
                <div>
                    <h3 style="color: #ffffff; margin-bottom: 15px; font-size: 20px;">NAAS Insights Engine</h3>
                    <p style="font-size: 14px; color: #94a3b8; line-height: 1.6;">Analytical platform for longitudinal performance metrics and trend evaluations of scientific agricultural journals.</p>
                </div>
                
                <div>
                    <h4 style="font-size: 12px; text-transform: uppercase; color: #64748b; margin-bottom: 8px; letter-spacing: 0.5px;">Project Lead</h4>
                    
                    <p style="margin: 0 0 4px 0; color: #38bdf8; font-weight: bold; font-size: 16px;">Dr. Saqib Parvaze Allaie</p>
                    
                    <p style="margin: 0 0 6px 0; color: #fcd34d; font-size: 13px; font-weight: 500;">Subject Matter Specialist (Agricultural Engineering)</p>
                    
                    <p style="margin: 0 0 12px 0; font-size: 12px; color: #cbd5e1; line-height: 1.5;">
                        Krishi Vigyan Kendra (KVK), Shamli<br>
                        Sardar Vallabhbhai Patel University of Agriculture and Technology<br>
                        Meerut, Uttar Pradesh
                    </p>
                    
                    <a href="https://www.linkedin.com/in/saqibparvaze" target="_blank" class="linkedin-btn">
                        <svg width="12" height="12" fill="currentColor" viewBox="0 0 16 16" style="margin-right: 5px;"><path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z"/></svg>
                        Connect on LinkedIn
                    </a>
                </div>
                
                <div>
                    <h4 style="font-size: 12px; text-transform: uppercase; color: #64748b; margin-bottom: 8px; letter-spacing: 0.5px;">Co-Developer</h4>
                    
                    <p style="margin: 0 0 4px 0; color: #38bdf8; font-weight: bold; font-size: 16px;">Dr. Sabah Parvaze</p>
                    
                    <p style="margin: 0 0 6px 0; color: #fcd34d; font-size: 13px; font-weight: 500;">Assistant Professor (Agricultural Engineering)</p>
                    
                    <p style="margin: 0 0 12px 0; font-size: 12px; color: #cbd5e1; line-height: 1.5;">
                        College of Agricultural Engineering and Technology (CoAE&T)<br>
                        Sher-e-Kashmir University of Agricultural Sciences and Technology<br>
                        Kashmir, J&K
                    </p>
                    
                    <a href="https://www.linkedin.com/in/sabah-parvaze-67a769ab/" target="_blank" class="linkedin-btn">
                        <svg width="12" height="12" fill="currentColor" viewBox="0 0 16 16" style="margin-right: 5px;"><path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z"/></svg>
                        Connect on LinkedIn
                    </a>
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
                    <span>Version 1.2.6</span>
                </div>
            </div>
        </div>

        <style>
            /* Standalone LinkedIn Button Styling */
            .linkedin-btn { 
                display: inline-flex; 
                align-items: center;
                color: #0ea5e9; 
                font-size: 12px; 
                text-decoration: none; 
                font-weight: 600; 
                background: rgba(14, 165, 233, 0.1); 
                padding: 6px 12px; 
                border-radius: 4px; 
                border: 1px solid rgba(14, 165, 233, 0.2); 
                transition: all 0.2s ease-in-out; 
            }
            .linkedin-btn:hover { 
                background: rgba(14, 165, 233, 0.2); 
                color: #38bdf8; 
                border-color: rgba(56, 189, 248, 0.4);
            }
            /* Legal Links Styling */
            .legal-link { color: #cbd5e1; text-decoration: none; transition: color 0.2s; }
            .legal-link:hover { color: #ffffff; text-decoration: underline; }
        </style>
    </footer>
  `;
}
