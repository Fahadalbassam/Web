/**
 * Creates recommended MongoDB indexes. Run:
 *   node --env-file=.env.local scripts/ensure-indexes.mjs
 */

import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("Missing MONGODB_URI");
  process.exit(1);
}

const client = new MongoClient(uri);
try {
  await client.connect();
  const db = client.db();
  await db.collection("products").createIndex({ slug: 1 }, { unique: true });
  await db.collection("admins").createIndex({ email: 1 }, { unique: true });
  await db.collection("categories").createIndex({ name: 1 }, { unique: true });
  console.log("Indexes ensured.");
} catch (e) {
  console.error(e);
  process.exit(1);
} finally {
  await client.close().catch(() => {});
}
