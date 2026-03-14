import { MongoClient } from 'mongodb';

let cachedClient = null;

export default {
  async fetch(request, env) {
    // 1. Handle CORS (So your frontend can talk to this API)
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || "";

    // 2. Connect to MongoDB (Reuse connection if warm)
    if (!cachedClient) {
      cachedClient = new MongoClient(env.MONGODB_URI);
      await cachedClient.connect();
    }

    try {
      const db = cachedClient.db("naas_db");
      const results = await db.collection("journals")
        .find({ Name: { $regex: query, $options: 'i' } })
        .limit(15)
        .toArray();

      return new Response(JSON.stringify(results), {
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
