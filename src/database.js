// 1. Get the most recent year available in the database
export async function getLatestYear(db) {
    const res = await db.prepare("SELECT MAX(year) as latest FROM naas_ratings").first();
    return res ? res.latest : 2025;
}

// 2. Get global statistics for the ecosystem view
// Add or replace this function in your src/database.js
export async function getGlobalStats(db) {
    const latestYear = await getLatestYear(db);
    const prevYear = latestYear - 1;

    // 1. Yearly Trends (Averages & Counts per year)
    const trendRes = await db.prepare(`
        SELECT year, AVG(rating) as avg_rating, COUNT(DISTINCT issn_clean) as count 
        FROM naas_ratings 
        GROUP BY year 
        ORDER BY year ASC
    `).all();
    const yearlyTrends = trendRes.results || [];

    // 2. Tier Distribution for the Latest Year
    const distRes = await db.prepare(`
        SELECT 
            CASE 
                WHEN rating >= 9.0 THEN 'Elite (9.0+)'
                WHEN rating >= 6.0 AND rating < 9.0 THEN 'High (6.0 - 8.9)'
                WHEN rating >= 4.0 AND rating < 6.0 THEN 'Mid (4.0 - 5.9)'
                ELSE 'Developing (< 4.0)'
            END as tier,
            COUNT(*) as count
        FROM naas_ratings
        WHERE year = ?
        GROUP BY tier
        ORDER BY count DESC
    `).bind(latestYear).all();
    const distribution = distRes.results || [];

    // Count Unrated (Journals in master that have no rating in latest year)
    const unratedRes = await db.prepare(`
        SELECT COUNT(DISTINCT m.master_id) as count
        FROM journal_master m
        LEFT JOIN journal_variants v ON m.master_id = v.master_id
        LEFT JOIN naas_ratings r ON v.issn_clean = r.issn_clean AND r.year = ?
        WHERE r.rating IS NULL
    `).bind(latestYear).first();
    const unratedCount = unratedRes ? unratedRes.count : 0;

    // 3. Top Performers (Gainers) vs Historical Avg
    const gainersRes = await db.prepare(`
        SELECT m.master_id, m.main_display_name as Name, MAX(v.issn_original) as ISSN, 
               curr.rating as latest_rating, 
               (curr.rating - prev.avg_rating) / prev.avg_rating * 100 as pct_change
        FROM journal_master m
        JOIN journal_variants v ON m.master_id = v.master_id
        JOIN naas_ratings curr ON v.issn_clean = curr.issn_clean AND curr.year = ?
        JOIN (SELECT issn_clean, AVG(rating) as avg_rating FROM naas_ratings WHERE year < ? GROUP BY issn_clean) prev ON curr.issn_clean = prev.issn_clean
        WHERE prev.avg_rating > 0
        GROUP BY m.master_id
        ORDER BY pct_change DESC LIMIT 10
    `).bind(latestYear, latestYear).all();

    // 4. Worst Performers (Declines) vs Historical Avg
    const declinesRes = await db.prepare(`
        SELECT m.master_id, m.main_display_name as Name, MAX(v.issn_original) as ISSN, 
               curr.rating as latest_rating, 
               (curr.rating - prev.avg_rating) / prev.avg_rating * 100 as pct_change
        FROM journal_master m
        JOIN journal_variants v ON m.master_id = v.master_id
        JOIN naas_ratings curr ON v.issn_clean = curr.issn_clean AND curr.year = ?
        JOIN (SELECT issn_clean, AVG(rating) as avg_rating FROM naas_ratings WHERE year < ? GROUP BY issn_clean) prev ON curr.issn_clean = prev.issn_clean
        WHERE prev.avg_rating > 0
        GROUP BY m.master_id
        ORDER BY pct_change ASC LIMIT 10
    `).bind(latestYear, latestYear).all();

    // 5. Added Journals (In latest year, but NOT in any previous year)
    const addedRes = await db.prepare(`
        SELECT m.master_id, m.main_display_name as Name, MAX(v.issn_original) as ISSN, curr.rating
        FROM journal_master m
        JOIN journal_variants v ON m.master_id = v.master_id
        JOIN naas_ratings curr ON v.issn_clean = curr.issn_clean AND curr.year = ?
        LEFT JOIN naas_ratings old ON curr.issn_clean = old.issn_clean AND old.year < ?
        WHERE old.rating IS NULL
        GROUP BY m.master_id
        ORDER BY curr.rating DESC
    `).bind(latestYear, latestYear).all();

    // 6. Removed Journals (Were in previous year, but NOT in latest year)
    const removedRes = await db.prepare(`
        SELECT m.master_id, m.main_display_name as Name, MAX(v.issn_original) as ISSN, prev.rating as prev_rating
        FROM journal_master m
        JOIN journal_variants v ON m.master_id = v.master_id
        JOIN naas_ratings prev ON v.issn_clean = prev.issn_clean AND prev.year = ?
        LEFT JOIN naas_ratings curr ON prev.issn_clean = curr.issn_clean AND curr.year = ?
        WHERE curr.rating IS NULL
        GROUP BY m.master_id
        ORDER BY prev.rating DESC
    `).bind(prevYear, latestYear).all();

    return {
        latestYear,
        yearlyTrends,
        distribution,
        unratedCount,
        topPerformers: gainersRes.results || [],
        worstPerformers: declinesRes.results || [],
        added: addedRes.results || [],
        removed: removedRes.results || []
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

// 4. Get Journal Metrics (Now includes Global Rank)
export async function getJournalMetrics(db, masterId) {
    const master = await db.prepare(`SELECT main_display_name as name FROM journal_master WHERE master_id = ?`).bind(masterId).first();
    
    const ratingsResult = await db.prepare(`
        SELECT r.year, r.rating, v.issn_original as issn
        FROM naas_ratings r
        JOIN journal_variants v ON r.issn_clean = v.issn_clean
        WHERE v.master_id = ?
        ORDER BY r.year ASC
    `).bind(masterId).all();

    const history = ratingsResult.results || [];
    
    const latestRating = history.length > 0 ? history[history.length - 1].rating : null;
    const latestYear = history.length > 0 ? history[history.length - 1].year : null;
    const issn = history.length > 0 ? history[history.length - 1].issn : 'N/A';
    
    let avg = null;
    if (history.length > 0) {
        const sum = history.reduce((acc, row) => acc + row.rating, 0);
        avg = sum / history.length;
    }

    let cv = null;
    if (history.length > 1 && avg > 0) {
        const variance = history.reduce((acc, row) => acc + Math.pow(row.rating - avg, 2), 0) / history.length;
        const stdDev = Math.sqrt(variance);
        cv = (stdDev / avg) * 100; 
    }

    // NEW: Calculate the Exact Rank and Percentile for the Latest Year
    let rank = null;
    let totalJournals = null;
    if (latestYear && latestRating !== null) {
        // Count how many journals have a strictly higher rating this year
        const rankRes = await db.prepare("SELECT COUNT(DISTINCT issn_clean) as count FROM naas_ratings WHERE year = ? AND rating > ?").bind(latestYear, latestRating).first();
        rank = rankRes ? rankRes.count + 1 : 1; // +1 because if 0 are higher, you are rank 1
        
        // Count total journals this year
        const totalRes = await db.prepare("SELECT COUNT(DISTINCT issn_clean) as count FROM naas_ratings WHERE year = ?").bind(latestYear).first();
        totalJournals = totalRes ? totalRes.count : 1;
    }

    return {
        master_id: masterId,
        name: master ? master.name : "Unknown Journal",
        issn: issn,
        latest_rating: latestRating,
        avg_rating: avg,
        cv: cv,
        rank: rank,
        total_journals: totalJournals,
        history: history
    };
}
