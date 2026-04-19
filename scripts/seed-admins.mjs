/**
 * Upserts admin accounts from env:
 *   ADMIN_SEED_PASSWORD_FAHAD — fahad2albassam@gmail.com
 *   ADMIN_SEED_PASSWORD_OBAI — obayyassine@gmail.com
 *
 * Also upserts canonical rows in the `categories` collection (Brakes, Engine, …)
 * so the admin category Select has backend data before any products exist.
 *
 * Run from repo root:
 *   node --env-file=.env.local scripts/seed-admins.mjs
 */

import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";

const COLLECTION = "admins";

const ACCOUNTS = [
  { email: "fahad2albassam@gmail.com", envKey: "ADMIN_SEED_PASSWORD_FAHAD" },
  { email: "obayyassine@gmail.com", envKey: "ADMIN_SEED_PASSWORD_OBAI" },
];

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("Missing MONGODB_URI. Use: node --env-file=.env.local scripts/seed-admins.mjs");
  process.exit(1);
}

const missingEnv = ACCOUNTS.filter((a) => !process.env[a.envKey] || !String(process.env[a.envKey]).trim());
if (missingEnv.length) {
  console.error(
    "Seed aborted — set these env vars (non-empty, not committed):\n  " +
      missingEnv.map((m) => m.envKey).join("\n  ")
  );
  process.exit(2);
}

const client = new MongoClient(uri);

try {
  await client.connect();
  const db = client.db();
  const admins = db.collection(COLLECTION);

  await admins.createIndex({ email: 1 }, { unique: true });

  const now = new Date();

  for (const acc of ACCOUNTS) {
    const plain = String(process.env[acc.envKey]).trim();
    const email = acc.email.toLowerCase();
    const passwordHash = await bcrypt.hash(plain, 12);

    const existing = await admins.findOne({ email });
    if (existing) {
      await admins.updateOne(
        { email },
        { $set: { email, passwordHash, role: "admin", updatedAt: now } }
      );
      console.log(`[updated] ${email}`);
    } else {
      await admins.insertOne({
        email,
        passwordHash,
        role: "admin",
        createdAt: now,
        updatedAt: now,
      });
      console.log(`[created] ${email}`);
    }
  }

  const DEFAULT_CATEGORY_NAMES = [
    "Brakes",
    "Engine",
    "Filters",
    "Fluids",
    "Ignition",
    "Sensors",
    "Suspension",
    "Wipers",
  ];
  const cats = db.collection("categories");
  let catUpserts = 0;
  for (const name of DEFAULT_CATEGORY_NAMES) {
    const r = await cats.updateOne(
      { name },
      { $setOnInsert: { name, createdAt: now }, $set: { updatedAt: now } },
      { upsert: true }
    );
    if (r.upsertedCount) {
      catUpserts += 1;
    }
  }
  console.log(
    `[categories] ensured ${DEFAULT_CATEGORY_NAMES.length} canonical labels (${catUpserts} new, rest already present).`
  );

  console.log("Admin seed completed OK.");
} catch (e) {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
} finally {
  await client.close().catch(() => {});
}
