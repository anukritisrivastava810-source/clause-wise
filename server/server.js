require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");

const analyzeRoutes = require("./routes/analyze");
const authRoutes = require("./routes/auth");
const uploadRoutes = require("./routes/upload");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.options("*", cors()); // Handle Preflight Requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Connect to Database
connectDB();

// API Routes
app.use("/auth", authRoutes);
app.use("/", uploadRoutes);
app.use("/", analyzeRoutes);

// Basic health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "ClauseWise Auth Backend is running" });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
