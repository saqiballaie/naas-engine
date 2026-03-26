export async function getLatestYear(db) {
  const row = await db.prepare("SELECT MAX(year) as yr FROM naas_ratings").first();
  return row ? row.yr : 2024;
}

export async function searchJournals(db, year, term, min, max) {
  const cleanTerm = term.replace(/-/g, '').toUpperCase();
  
  // We use a Subquery to ensure we filter specifically on the LATEST year's rating
  return await db.prepare(`
    SELECT 
      m.main_display_name as Name, 
      v.issn_original as ISSN, 
      v.master_id,
      (SELECT rating FROM naas_ratings WHERE issn_clean = v.issn_clean AND year = ?) as latest_score,
      AVG(r.rating) as calculated_avg, 
      COUNT(r.rating) as valid_years
    FROM journal_master m 
    JOIN journal_variants v ON m.master_id = v.master_id
    LEFT JOIN naas_ratings r ON v.issn_clean = r.issn_clean
    WHERE (m.main_display_name LIKE ? OR v.issn_clean LIKE ?)
    GROUP BY m.master_id
    HAVING 
      (latest_score >= ? OR ? = '') AND 
      (latest_score <= ? OR ? = '')
    ORDER BY latest_score DESC, calculated_avg DESC
    LIMIT 100
  `).bind(year, `%${term}%`, `%${cleanTerm}%`, min, min, max, max).all();
}

export async function getJournalMetrics(db, masterId) {
  const journal = await db.prepare("SELECT main_display_name FROM journal_master WHERE master_id = ?").bind(masterId).first();
  const variant = await db.prepare("SELECT issn_original FROM journal_variants WHERE master_id = ? LIMIT 1").bind(masterId).first();
  const ratings = await db.prepare(`
    SELECT r.year, r.rating, r.journal_name_that_year FROM naas_ratings r
    JOIN journal_variants v ON r.issn_clean = v.issn_clean
    WHERE v.master_id = ? ORDER BY r.year ASC
  `).bind(masterId).all();
  
  return { name: journal.main_display_name, issn: variant.issn_original, ratings: ratings.results };
}
