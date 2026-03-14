import { MongoClient } from 'mongodb';

// We move the client outside to keep it "warm" between searches
let cachedClient = null;

export default {
  async fetch(request, env) {
    if (request.url.includes('favicon.ico')) return new Response(null, { status: 204 });

    try {
      const { searchParams } = new URL(request.url);
      const query = searchParams.get('q') || "";

      // Initialize client if it doesn't exist
      if (!cachedClient) {
        cachedClient = new MongoClient(env.MONGODB_URI);
      }

      // Ensure we are connected
      // In 2026, we check the connection state before calling connect()
      try {
        await cachedClient.db("admin").command({ ping: 1 });
      } catch (e) {
        // If ping fails, the topology is closed or new, so we reconnect
        await cachedClient.connect();
      }

      const db = cachedClient.db("naas_db");
      const collection = db.collection("journals");

      const filter = query ? { Name: { $regex: query, $options: 'i' } } : {};
      const results = await collection.find(filter).limit(20).toArray();

      return new Response(JSON.stringify(results), {
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*" 
        }
      });

    } catch (err) {
      // If a major error happens, we reset the cachedClient so the next try is "fresh"
      cachedClient = null;
      return new Response(JSON.stringify({ error: err.message }), { 
        status: 500,
        headers: { "Access-Control-Allow-Origin": "*" }
      });
    }
  }
};
