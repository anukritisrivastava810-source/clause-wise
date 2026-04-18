const mongoose = require("mongoose");

const connectDB = async () => {
  const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/clausewise";

  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB -> clausewise");
  } catch (err) {
    console.warn("MongoDB connection failed! If you want to use database features, please ensure MongoDB is running.");
    console.error("Error details:", err.message);
    // Don't exit process to allow fallback/graceful failure in local dev
  }
};

module.exports = connectDB;
