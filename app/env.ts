export const env = {
  // We'll simulate the database, so these are placeholders
  DATABASE_URL: process.env.DATABASE_URL || "simulated-postgres",
  MONGODB_URI: process.env.MONGODB_URI || "simulated-mongodb",
}
