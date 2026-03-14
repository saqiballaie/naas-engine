import { connect } from '@tidbcloud/serverless';

export default {
  async fetch(request, env) {
    const conn = connect({ url: env.DATABASE_URL });

    try {
      const { searchParams } = new URL(request.url);
      const query = searchParams.get('q') || "";

      // SQL Search query
      const rows = await conn.execute(
        "SELECT * FROM journals WHERE journal_name LIKE ? LIMIT 10",
        [`%${query}%`]
      );

      return new Response(JSON.stringify(rows), {
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*" 
        }
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
  }
};
