// 1. Get the most recent year available in the database
export async function getLatestYear(db) {
    const res = await db.prepare("SELECT MAX(year) as latest FROM naas_ratings").first();
    return res ? res.latest : 2025;
}

// 2. Get global statistics for the ecosystem view
export async function getGlobalStats(db) {
    const year = await getLatestYear(db);
    const total = await db.prepare("SELECT COUNT(DISTINCT issn_clean) as count FROM naas_ratings WHERE year = ?").bind(year).first();
    const high = await db.prepare("SELECT COUNT(DISTINCT issn_clean) as count FROM naas_ratings WHERE year = ? AND rating >= 6.0").bind(year).first();
    const avgRes = await db.prepare("SELECT AVG(rating) as avg FROM naas_ratings WHERE year = ?").bind(year).first();
    
    return { 
        total: total ? total.count : 0, 
        high: high ? high.count : 0, 
        avg: avgRes && avgRes.avg ? avgRes.avg : 0 
    };
}

// 3. Search journals with Pagination and 10Y Avg
export async function searchJournals(db, year, search, min, max, page = 1) {
    const limit = 50;
    const offset = (page - 1) * limit;

    let whereClause = "";
    let params = [year];

    if (search) {
        whereClause += " AND (m.main_display_name LIKE ? OR v.issn_clean LIKE ?)";
        params.push(`%${search}%`, `%${search.replace(/-/g, '')}%`);
    }
    if (min) { whereClause += " AND r.rating >= ?"; params.push(parseFloat(min)); }
    if (max) { whereClause += " AND r.rating <= ?"; params.push(parseFloat(max)); }

    const query = `
        SELECT 
            m.main_display_name as name, 
            MAX(v.issn_original) as issn, 
            r.rating, 
            m.master_id,
            (SELECT AVG(rating) FROM naas_ratings WHERE issn_clean = v.issn_clean) as avg_rating
        FROM journal_master m
        JOIN journal_variants v ON m.master_id = v.master_id
        JOIN naas_ratings r ON v.issn_clean = r.issn_clean
        WHERE r.year = ? ${whereClause}
        GROUP BY m.master_id
        ORDER BY r.rating DESC, m.main_display_name ASC 
        LIMIT ? OFFSET ?`; 
    
    params.push(limit, offset);

    const results = await db.prepare(query).bind(...params).all();
    return results.results || [];
}

// 4. Get Journal Metrics (Pulls ALL historical data including 2015/2016)
export async function getJournalMetrics(db, masterId) {
    // Fetch Master Info
    const master = await db.prepare(`SELECT main_display_name as name FROM journal_master WHERE master_id = ?`).bind(masterId).first();
    
    // Fetch ALL Historical Ratings (Removed the 2017 limit, ordered chronologically)
    const ratingsResult = await db.prepare(`
        SELECT r.year, r.rating, v.issn_original as issn
        FROM naas_ratings r
        JOIN journal_variants v ON r.issn_clean = v.issn_clean
        WHERE v.master_id = ?
        ORDER BY r.year ASC
    `).bind(masterId).all();

    const history = ratingsResult.results || [];
    
    // Calculate metrics safely
    const latestRating = history.length > 0 ? history[history.length - 1].rating : null;
    const issn = history.length > 0 ? history[history.length - 1].issn : 'N/A';
    
    // Calculate All-Time Average
    let avg = null;
    if (history.length > 0) {
        const sum = history.reduce((acc, row) => acc + row.rating, 0);
        avg = sum / history.length;
    }

    // Calculate Volatility (Coefficient of Variation)
    let cv = null;
    let volatilityStatus = "Stable";
    let volatilityColor = "#16a34a"; // Green
    
    if (history.length > 1 && avg > 0) {
        const variance = history.reduce((acc, row) => acc + Math.pow(row.rating - avg, 2), 0) / history.length;
        const stdDev = Math.sqrt(variance);
        cv = (stdDev / avg) * 100; 
        
        if (cv > 15) {
            volatilityStatus = "Highly Volatile";
            volatilityColor = "#dc2626"; // Red
        } else if (cv > 8) {
            volatilityStatus = "Moderate Fluctuation";
            volatilityColor = "#b45309"; // Orange
        }
    }

    return {
        master_id: masterId,
        name: master ? master.name : "Unknown Journal",
        issn: issn,
        latest_rating: latestRating,
        avg_rating: avg,
        cv: cv,
        volatility_status: volatilityStatus,
        volatility_color: volatilityColor,
        history: history
    };
}
