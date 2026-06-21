const mongoose = require("mongoose");

// Łączymy się z MongoDB. URI bierzemy z .env (z sensownym fallbackiem na localhost).
const connectMongo = async () => {
  const uri = process.env.MONGO_URI || "mongodb://localhost:27017/elearning";
  await mongoose.connect(uri);
  return mongoose.connection;
};

module.exports = connectMongo;
