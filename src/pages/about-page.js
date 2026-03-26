export function renderAboutPage() {
    return `
    <div style="max-width: 900px; margin: 0 auto; line-height: 1.7;">
        <div class="card" style="border-top: 5px solid var(--primary); padding: 40px;">
            <h2 style="color: var(--primary); margin-top: 0; font-size: 32px;">About NAAS Insights Engine</h2>
            <p style="font-size: 18px; color: #334155; font-weight: 500;">
                A specialized Integrity & Analytics Portal for the National Agricultural Research System (NARS).
            </p>

            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;">

            <h3 style="color: #0f172a; font-size: 22px;">1. Purpose & Vision</h3>
            <p style="color: #475569;">
                The NAAS rating system is fundamental to academic recruitment and the Career Advancement Scheme (CAS) in India. However, tracking historical changes across decades of PDF documents is labor-intensive and prone to error. This engine digitizes that history to provide <strong>longitudinal transparency</strong>.
            </p>

            <h3 style="color: #0f172a; font-size: 22px; margin-top: 30px;">2. For Recruitment & Selection Boards</h3>
            <p style="color: #475569;">
                This platform serves as a <strong>Verification Tool</strong>. Recruitment panels can instantly validate the NAAS scores claimed by applicants in their API (Academic Performance Indicator) scoresheets. By using ISSN-anchored searches, the system helps distinguish genuine journals from <strong>"Clone Journals"</strong> or predatory publishers that mimic legitimate titles to commit fraud.
            </p>

            <h3 style="color: #0f172a; font-size: 22px; margin-top: 30px;">3. Scientific Impact</h3>
            <p style="color: #475569;">
                By calculating the <strong>Coefficient of Variation (CV)</strong>, we provide a "Volatility Index." This helps young scientists identify stable journals for their high-impact research, avoiding venues where ratings fluctuate unpredictably.
            </p>

            <div style="margin-top: 40px; padding: 25px; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
                <h4 style="margin-top: 0; color: #1e293b;">Institutional Ownership</h4>
                <p style="margin-bottom: 20px; font-size: 14px; color: #64748b;">
                    This is a joint intellectual property developed under the aegis of:
                </p>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div>
                        <strong style="color: var(--primary);">SVPUAT, Meerut</strong><br>
                        <span style="font-size: 13px;">Sardar Vallabhbhai Patel University of Agriculture and Technology</span>
                    </div>
                    <div>
                        <strong style="color: var(--primary);">SKUAST-K, Srinagar</strong><br>
                        <span style="font-size: 13px;">Sher-e-Kashmir University of Agricultural Sciences and Technology of Kashmir</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;
}
