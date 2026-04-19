import { MongoClient, type Db } from "mongodb";

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let prodClientPromise: Promise<MongoClient> | undefined;

function requireUri(): string {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "Missing MONGODB_URI. Add it to .env.local and to Vercel → Settings → Environment Variables.",
    );
  }
  return uri;
}

export function getClientPromise(): Promise<MongoClient> {
  if (process.env.NODE_ENV === "development") {
    if (!globalThis._mongoClientPromise) {
      globalThis._mongoClientPromise = new MongoClient(requireUri()).connect();
    }
    return globalThis._mongoClientPromise;
  }
  if (!prodClientPromise) {
    prodClientPromise = new MongoClient(requireUri()).connect();
  }
  return prodClientPromise;
}

export async function getDb(name?: string): Promise<Db> {
  const client = await getClientPromise();
  return client.db(name);
}
