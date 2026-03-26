export async function getLatestYear(db) {
  const row = await db.prepare("SELECT MAX(year) as yr FROM naas_ratings").first();
  return row ? row.yr : 2026;
}

export async function searchJournals(db, year, term, min, max) {
  const cleanTerm = term.replace(/-/g, '').toUpperCase();
  
  const query = `
    SELECT 
      m.main_display_name as Name, 
      MAX(v.issn_original) as ISSN, 
      m.master_id,
      MAX(CASE WHEN r.year = ? THEN r.rating END) as latest_score,
      AVG(r.rating) as calculated_avg, 
      COUNT(r.rating) as valid_years
    FROM journal_master m 
    JOIN journal_variants v ON m.master_id = v.master_id
    LEFT JOIN naas_ratings r ON v.issn_clean = r.issn_clean
    WHERE (m.main_display_name LIKE ? OR v.issn_clean LIKE ?)
    GROUP BY m.master_id
    HAVING 
      (? = '' OR latest_score >= CAST(? AS REAL)) AND 
      (? = '' OR latest_score <= CAST(? AS REAL))
    ORDER BY latest_score DESC, calculated_avg DESC
    LIMIT 150
  `;

  const res = await db.prepare(query).bind(
    year, 
    `%${term}%`, 
    `%${cleanTerm}%`, 
    min, min, 
    max, max
  ).all();

  return res.results || [];
}

export async function getJournalMetrics(db, masterId) {
  const journal = await db.prepare("SELECT main_display_name FROM journal_master WHERE master_id = ?").bind(masterId).first();
  const variant = await db.prepare("SELECT issn_original FROM journal_variants WHERE master_id = ? LIMIT 1").bind(masterId).first();
  const ratings = await db.prepare(`
    SELECT r.year, r.rating, r.journal_name_that_year 
    FROM naas_ratings r
    JOIN journal_variants v ON r.issn_clean = v.issn_clean
    WHERE v.master_id = ? ORDER BY r.year ASC
  `).bind(masterId).all();
  
  return {
    name: journal ? journal.main_display_name : "Unknown Journal",
    issn: variant ? variant.issn_original : "N/A",
    ratings: ratings.results || []
  };
}
export async function getGlobalStats(db) {
  // 1. Annual Averages and Counts
  const yearlyTrends = await db.prepare(`
    SELECT year, AVG(rating) as avg_rating, COUNT(*) as journal_count 
    FROM naas_ratings 
    GROUP BY year ORDER BY year ASC
  `).all();

  // 2. Current Tier Distribution (Categorization)
  const latestYear = await getLatestYear(db);
  const distribution = await db.prepare(`
    SELECT 
      CASE 
        WHEN rating >= 9.0 THEN 'Elite (9.0+)'
        WHEN rating >= 7.0 THEN 'High (7.0-8.9)'
        WHEN rating >= 5.0 THEN 'Mid (5.0-6.9)'
        ELSE 'Developing (<5.0)'
      END as tier,
      COUNT(*) as count
    FROM naas_ratings 
    WHERE year = ?
    GROUP BY tier
  `).bind(latestYear).all();

  // 3. Top 10 Journals overall
  const topJournals = await db.prepare(`
    SELECT m.main_display_name as Name, r.rating, v.issn_original as ISSN
    FROM naas_ratings r
    JOIN journal_variants v ON r.issn_clean = v.issn_clean
    JOIN journal_master m ON v.master_id = m.master_id
    WHERE r.year = ?
    ORDER BY r.rating DESC LIMIT 10
  `).bind(latestYear).all();

  return {
    yearlyTrends: yearlyTrends.results,
    distribution: distribution.results,
    topJournals: topJournals.results,
    latestYear
  };
}
