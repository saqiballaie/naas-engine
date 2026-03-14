import { MongoClient } from 'mongodb';

let cachedClient = null;

export default {
  async fetch(request, env) {
    // 1. Handle Favicon requests (ignore them to stop logs cluttering)
    if (request.url.includes('favicon.ico')) {
      return new Response(null, { status: 204 });
    }

    try {
      // 2. Validate MongoDB URI exists
      if (!env.MONGODB_URI) {
        return new Response("Error: MONGODB_URI environment variable is missing.", { status: 500 });
      }

      const { searchParams } = new URL(request.url);
      const query = searchParams.get('q') || ""; // Use empty string if no 'q' is provided

      // 3. Connect to MongoDB
      if (!cachedClient) {
        cachedClient = new MongoClient(env.MONGODB_URI);
        await cachedClient.connect();
      }

      const db = cachedClient.db("naas_db");
      const collection = db.collection("journals");

      // 4. If query is empty, return top 5 journals as a placeholder
      // Otherwise, perform the regex search
      const filter = query 
        ? { Name: { $regex: query, $options: 'i' } } 
        : {};

      const results = await collection.find(filter).limit(10).toArray();

      return new Response(JSON.stringify(results), {
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*" 
        }
      });

    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), { 
        status: 500,
        headers: { "Access-Control-Allow-Origin": "*" }
      });
    }
  }
};
