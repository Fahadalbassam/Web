import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error(
    "MONGODB_URI is not set. From repo root run:\n  node --env-file=.env.local scripts/mongo-ping.mjs",
  );
  process.exit(1);
}

const client = new MongoClient(uri);
try {
  await client.connect();
  await client.db("admin").command({ ping: 1 });
  console.log("MongoDB: connection OK (admin ping succeeded).");
} catch (err) {
  console.error("MongoDB: connection failed.");
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
} finally {
  await client.close().catch(() => {});
}
