import { MongoClient } from "mongodb"
import { env } from "@/app/env"

if (!env.MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable")
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  const globalWithMongo = global as typeof global & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(env.MONGODB_URI)
    globalWithMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(env.MONGODB_URI)
  clientPromise = client.connect()
}

export default clientPromise

// Helper function to get the database
export async function getDatabase() {
  const client = await clientPromise
  return client.db("workstationDB")
}

// Helper function to get collections
export async function getCollection(collectionName: string) {
  const db = await getDatabase()
  return db.collection(collectionName)
}
