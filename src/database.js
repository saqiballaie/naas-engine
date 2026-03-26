export async function getLatestYear(db) {
  const row = await db.prepare("SELECT MAX(year) as yr FROM naas_ratings").first();
  return row ? row.yr : 2026;
}

// Add 'page' to the parameters, default to 1
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

export async function getJournalMetrics(db, masterId) {
    // 1. Fetch Master Info
    const master = await db.prepare(`SELECT main_display_name as name FROM journal_master WHERE master_id = ?`).bind(masterId).first();
    
    // 2. Fetch ALL Historical Ratings (Removed year limits, ordered chronologically)
    const ratingsResult = await db.prepare(`
        SELECT r.year, r.rating, v.issn_original as issn
        FROM naas_ratings r
        JOIN journal_variants v ON r.issn_clean = v.issn_clean
        WHERE v.master_id = ?
        ORDER BY r.year ASC
    `).bind(masterId).all();

    const history = ratingsResult.results || [];
    
    // 3. Calculate metrics safely
    const latestRating = history.length > 0 ? history[history.length - 1].rating : null;
    const issn = history.length > 0 ? history[history.length - 1].issn : 'N/A';
    
    // Calculate 10-Year (or all-time) Average
    let avg = null;
    if (history.length > 0) {
        const sum = history.reduce((acc, row) => acc + row.rating, 0);
        avg = sum / history.length;
    }

    // Calculate Volatility (Standard Deviation / Mean)
    let cv = null;
    let volatilityStatus = "Stable";
    let volatilityColor = "#16a34a"; // Green
    
    if (history.length > 1 && avg > 0) {
        const variance = history.reduce((acc, row) => acc + Math.pow(row.rating - avg, 2), 0) / history.length;
        const stdDev = Math.sqrt(variance);
        cv = (stdDev / avg) * 100; // Coefficient of Variation in %
        
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
  
  const altNames = Array.from(historicalNamesSet);

  return {
    name: mainName,
    issn: primaryIssn,
    altIssns: altIssns,
    altNames: altNames,
    ratings: ratingsData
  };
}
export async function getGlobalStats(db) {
  const latestYear = await getLatestYear(db);
  const prevYear = latestYear - 1;

  const yearlyTrends = await db.prepare(`SELECT year, AVG(rating) as avg_rating, COUNT(*) as journal_count FROM naas_ratings GROUP BY year ORDER BY year ASC`).all();

  const distribution = await db.prepare(`
    SELECT CASE WHEN rating >= 9.0 THEN 'Elite (9.0+)' WHEN rating >= 6.0 THEN 'High (6.0-8.9)' WHEN rating >= 4.0 THEN 'Mid (4.0-5.9)' ELSE 'Developing (<4.0)' END as tier, COUNT(DISTINCT issn_clean) as count
    FROM naas_ratings WHERE year = ? GROUP BY tier
  `).bind(latestYear).all();

  const unratedCount = await db.prepare(`
    SELECT COUNT(DISTINCT issn_clean) as count 
    FROM naas_ratings 
    WHERE issn_clean NOT IN (
      SELECT issn_clean 
      FROM naas_ratings 
      WHERE year = ?
    )
  `).bind(latestYear).first();

  const added = await db.prepare(`
    SELECT m.main_display_name as Name, MAX(r1.rating) as rating, MAX(v.issn_original) as ISSN, m.master_id
    FROM naas_ratings r1 JOIN journal_variants v ON r1.issn_clean = v.issn_clean JOIN journal_master m ON v.master_id = m.master_id
    WHERE r1.year = ? AND r1.issn_clean NOT IN (SELECT issn_clean FROM naas_ratings WHERE year = ?)
    GROUP BY m.master_id ORDER BY rating DESC
  `).bind(latestYear, prevYear).all();

  const removed = await db.prepare(`
    SELECT m.main_display_name as Name, MAX(r0.rating) as prev_rating, MAX(v.issn_original) as ISSN, m.master_id
    FROM naas_ratings r0 JOIN journal_variants v ON r0.issn_clean = v.issn_clean JOIN journal_master m ON v.master_id = m.master_id
    WHERE r0.year = ? AND r0.issn_clean NOT IN (SELECT issn_clean FROM naas_ratings WHERE year = ?)
    GROUP BY m.master_id ORDER BY prev_rating DESC
  `).bind(prevYear, latestYear).all();

  const performanceQuery = `
    WITH stats AS (SELECT issn_clean, AVG(rating) as avg_rating, MAX(CASE WHEN year = ? THEN rating END) as latest_rating FROM naas_ratings GROUP BY issn_clean HAVING latest_rating IS NOT NULL AND avg_rating > 0 AND COUNT(rating) > 2)
    SELECT m.main_display_name as Name, s.latest_rating, s.avg_rating, ((s.latest_rating - s.avg_rating) / s.avg_rating * 100) as pct_change, MAX(v.issn_original) as ISSN, m.master_id
    FROM stats s JOIN journal_variants v ON s.issn_clean = v.issn_clean JOIN journal_master m ON v.master_id = m.master_id GROUP BY m.master_id
  `;
  const topPerformers = await db.prepare(performanceQuery + ` ORDER BY pct_change DESC LIMIT 10`).bind(latestYear).all();
  const worstPerformers = await db.prepare(performanceQuery + ` ORDER BY pct_change ASC LIMIT 10`).bind(latestYear).all();

  return {
    latestYear, prevYear,
    yearlyTrends: yearlyTrends.results || [], distribution: distribution.results || [],
    unratedCount: unratedCount ? unratedCount.count : 0, added: added.results || [],
    removed: removed.results || [], topPerformers: topPerformers.results || [], worstPerformers: worstPerformers.results || []
  };
}
