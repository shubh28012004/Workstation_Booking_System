export const env = {
  // ✅ MySQL Database connection (Authentication)
  MYSQL_HOST: process.env.MYSQL_HOST || "bookmydesk.cz2uim60se0g.ap-south-1.rds.amazonaws.com",
  MYSQL_PORT: process.env.MYSQL_PORT || "3306",
  MYSQL_DATABASE: process.env.MYSQL_DATABASE || "logindata",
  MYSQL_USER: process.env.MYSQL_USER || "admin",
  MYSQL_PASSWORD: process.env.MYSQL_PASSWORD || "test1234",

  // ✅ MongoDB connection (Booking data) — Updated with valid shard addresses
  MONGODB_URI:
    process.env.MONGO_URI ||
    "mongodb://hetsavalia43:3Grw80br0Rxd7sRo@ac-peboap7-shard-00-00.hxlxfuh.mongodb.net:27017,ac-peboap7-shard-00-01.hxlxfuh.mongodb.net:27017,ac-peboap7-shard-00-02.hxlxfuh.mongodb.net:27017/?ssl=true&replicaSet=atlas-vcd62e-shard-0&authSource=admin&retryWrites=true&w=majority&appName=bookmydesk",

  // ✅ Email SMTP configuration
  EMAIL_HOST: "smtp.gmail.com",
  EMAIL_PORT: 587,
  EMAIL_USER: process.env.EMAIL_USER || "BookMyDeskSIT@gmail.com",
  EMAIL_PASS: process.env.EMAIL_PASS || "wktw ijbi ltuo mvon",

  // ✅ Chatbot API URL (RAG model hosted via FastAPI)
  CHATBOT_API_URL: process.env.CHATBOT_API_URL || "https://1f21-103-68-38-66.ngrok-free.app/chat",
}
