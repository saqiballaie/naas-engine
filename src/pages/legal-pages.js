export function renderDisclaimer() {
    return `
    <div class="card" style="border-top: 5px solid #dc2626; max-width: 800px; margin: 0 auto;">
        <h2 style="color: #0f172a; margin-top: 0;">Legal Disclaimer</h2>
        <p style="color: #475569; line-height: 1.7; font-size: 15px;">
            The <strong>NAAS Insights Engine</strong> is an independent academic and analytical project developed by Dr. Saqib Parvaze Allaie and Dr. Sabah Parvaze for research and educational purposes.
        </p>
        
        <h3 style="color: #334155; margin-top: 25px; font-size: 18px;">No Official Affiliation</h3>
        <p style="color: #475569; line-height: 1.7; font-size: 15px;">
            This platform is <strong>NOT officially affiliated with, endorsed by, sponsored by, or associated with the National Academy of Agricultural Sciences (NAAS)</strong>. The term "NAAS" is used strictly in a descriptive capacity to identify the origin of the public data being analyzed.
        </p>

        <h3 style="color: #334155; margin-top: 25px; font-size: 18px;">Data Accuracy</h3>
        <p style="color: #475569; line-height: 1.7; font-size: 15px;">
            The ratings, historical scores, and journal names provided on this platform are derived from publicly available documents published by NAAS over various years. While every effort has been made to ensure the accuracy of the transcription and relational mapping of this data (including ISSN reconciliation), the developers assume no liability for errors, omissions, or discrepancies. Researchers should verify final ratings with official NAAS publications before making critical publishing decisions.
        </p>
    </div>
    `;
}

export function renderTerms() {
    return `
    <div class="card" style="border-top: 5px solid var(--primary); max-width: 800px; margin: 0 auto;">
        <h2 style="color: #0f172a; margin-top: 0;">Terms of Use</h2>
        <p style="color: #475569; line-height: 1.7; font-size: 15px;">
            By accessing and using the NAAS Insights Engine, you agree to the following terms and conditions:
        </p>

        <h3 style="color: #334155; margin-top: 25px; font-size: 18px;">1. Intellectual Property & Copyright</h3>
        <p style="color: #475569; line-height: 1.7; font-size: 15px;">
            The source code, user interface design, relational database schemas, analytical algorithms (including the Volatility CV and Recommendation Engine logic), and the overall architecture of the NAAS Insights Engine are the intellectual property of the developers (Dr. Saqib Parvaze Allaie and Dr. Sabah Parvaze), &copy; ${new Date().getFullYear()}. All Rights Reserved. 
            <br><br>
            Unauthorized copying, reproduction, distribution, or reverse-engineering of the application's source code or proprietary algorithms is strictly prohibited.
        </p>

        <h3 style="color: #334155; margin-top: 25px; font-size: 18px;">2. Use of Service & Data Restrictions</h3>
        <p style="color: #475569; line-height: 1.7; font-size: 15px;">
            The platform is provided "as is" and is intended for manual query use by individual researchers and academicians. 
            <strong>Automated data extraction, web scraping, or the use of bots to harvest the database is strictly prohibited</strong> and will result in IP blocking via our Web Application Firewall (WAF).
        </p>

        <h3 style="color: #334155; margin-top: 25px; font-size: 18px;">3. Disclaimer of Warranties</h3>
        <p style="color: #475569; line-height: 1.7; font-size: 15px;">
            The developers provide this tool without warranties of any kind, either express or implied, including but not limited to warranties of merchantability or fitness for a particular purpose. The algorithmic recommendations (e.g., "Highly Recommended", "Caution Advised") are purely statistical heuristics and do not constitute professional academic advisory.
        </p>
    </div>
    `;
}
