// Add this function to the bottom of src/database.js

export async function getGlobalStats(db) {
  const latestYear = await getLatestYear(db);
  const prevYear = latestYear - 1;

  // 1. Annual Averages and Counts
  const yearlyTrends = await db.prepare(`
    SELECT year, AVG(rating) as avg_rating, COUNT(*) as journal_count 
    FROM naas_ratings 
    GROUP BY year ORDER BY year ASC
  `).all();

  // 2. Current Tier Distribution (Categorization)
  const distribution = await db.prepare(`
    SELECT 
      CASE 
        WHEN rating >= 9.0 THEN 'Elite (9.0+)'
        WHEN rating >= 6.0 THEN 'High (6.0-8.9)'
        WHEN rating >= 4.0 THEN 'Mid (4.0-5.9)'
        ELSE 'Developing (<4.0)'
      END as tier,
      COUNT(DISTINCT issn_clean) as count
    FROM naas_ratings 
    WHERE year = ?
    GROUP BY tier
  `).bind(latestYear).all();

  // 3. Unrated Journals (In master list but no rating this year)
  const unratedCount = await db.prepare(`
    SELECT COUNT(DISTINCT m.master_id) as count
    FROM journal_master m
    WHERE m.master_id NOT IN (
      SELECT v.master_id FROM naas_ratings r 
      JOIN journal_variants v ON r.issn_clean = v.issn_clean 
      WHERE r.year = ?
    )
  `).bind(latestYear).first();

  // 4. Added This Year (Has rating this year, but NOT last year)
  const added = await db.prepare(`
    SELECT m.main_display_name as Name, MAX(r1.rating) as rating, MAX(v.issn_original) as ISSN, m.master_id
    FROM naas_ratings r1
    JOIN journal_variants v ON r1.issn_clean = v.issn_clean
    JOIN journal_master m ON v.master_id = m.master_id
    WHERE r1.year = ? AND r1.issn_clean NOT IN (SELECT issn_clean FROM naas_ratings WHERE year = ?)
    GROUP BY m.master_id ORDER BY rating DESC
  `).bind(latestYear, prevYear).all();

  // 5. Removed This Year (Had rating last year, but NOT this year)
  const removed = await db.prepare(`
    SELECT m.main_display_name as Name, MAX(r0.rating) as prev_rating, MAX(v.issn_original) as ISSN, m.master_id
    FROM naas_ratings r0
    JOIN journal_variants v ON r0.issn_clean = v.issn_clean
    JOIN journal_master m ON v.master_id = m.master_id
    WHERE r0.year = ? AND r0.issn_clean NOT IN (SELECT issn_clean FROM naas_ratings WHERE year = ?)
    GROUP BY m.master_id ORDER BY prev_rating DESC
  `).bind(prevYear, latestYear).all();

  // 6. Top 10 & Worst 10 Performers (Based on % change from historical average)
  const performanceQuery = `
    WITH stats AS (
        SELECT 
            issn_clean, 
            AVG(rating) as avg_rating, 
            MAX(CASE WHEN year = ? THEN rating END) as latest_rating
        FROM naas_ratings
        GROUP BY issn_clean
        HAVING latest_rating IS NOT NULL AND avg_rating > 0 AND COUNT(rating) > 2
    )
    SELECT 
        m.main_display_name as Name, 
        s.latest_rating, 
        s.avg_rating,
        ((s.latest_rating - s.avg_rating) / s.avg_rating * 100) as pct_change,
        MAX(v.issn_original) as ISSN, 
        m.master_id
    FROM stats s
    JOIN journal_variants v ON s.issn_clean = v.issn_clean
    JOIN journal_master m ON v.master_id = m.master_id
    GROUP BY m.master_id
  `;

  const topPerformers = await db.prepare(performanceQuery + ` ORDER BY pct_change DESC LIMIT 10`).bind(latestYear).all();
  const worstPerformers = await db.prepare(performanceQuery + ` ORDER BY pct_change ASC LIMIT 10`).bind(latestYear).all();

  return {
    latestYear,
    prevYear,
    yearlyTrends: yearlyTrends.results || [],
    distribution: distribution.results || [],
    unratedCount: unratedCount ? unratedCount.count : 0,
    added: added.results || [],
    removed: removed.results || [],
    topPerformers: topPerformers.results || [],
    worstPerformers: worstPerformers.results || []
  };
}
