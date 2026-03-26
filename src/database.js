export async function getLatestYear(db) {
  const row = await db.prepare("SELECT MAX(year) as yr FROM naas_ratings").first();
  return row ? row.yr : 2026;
}

export async function searchJournals(db, year, term, min, max) {
  const cleanTerm = term.replace(/-/g, '').toUpperCase();
  const query = `
    SELECT m.main_display_name as Name, MAX(v.issn_original) as ISSN, m.master_id,
      MAX(CASE WHEN r.year = ? THEN r.rating END) as latest_score,
      AVG(r.rating) as calculated_avg, COUNT(r.rating) as valid_years
    FROM journal_master m 
    JOIN journal_variants v ON m.master_id = v.master_id
    LEFT JOIN naas_ratings r ON v.issn_clean = r.issn_clean
    WHERE (m.main_display_name LIKE ? OR v.issn_clean LIKE ?)
    GROUP BY m.master_id
    HAVING (? = '' OR latest_score >= CAST(? AS REAL)) AND (? = '' OR latest_score <= CAST(? AS REAL))
    ORDER BY latest_score DESC, calculated_avg DESC LIMIT 150
  `;
  const res = await db.prepare(query).bind(year, `%${term}%`, `%${cleanTerm}%`, min, min, max, max).all();
  return res.results || [];
}

export async function getJournalMetrics(db, masterId) {
  const journal = await db.prepare("SELECT main_display_name FROM journal_master WHERE master_id = ?").bind(masterId).first();
  const variant = await db.prepare("SELECT issn_original FROM journal_variants WHERE master_id = ? LIMIT 1").bind(masterId).first();
  const ratings = await db.prepare(`
    SELECT r.year, r.rating, r.journal_name_that_year 
    FROM naas_ratings r JOIN journal_variants v ON r.issn_clean = v.issn_clean
    WHERE v.master_id = ? ORDER BY r.year ASC
  `).bind(masterId).all();
  return {
    name: journal ? journal.main_display_name : "Unknown Journal",
    issn: variant ? variant.issn_original : "N/A",
    ratings: ratings.results || []
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
    SELECT COUNT(DISTINCT m.master_id) as count FROM journal_master m
    WHERE m.master_id NOT IN (SELECT v.master_id FROM naas_ratings r JOIN journal_variants v ON r.issn_clean = v.issn_clean WHERE r.year = ?)
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
