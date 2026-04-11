import dotenv from "dotenv";
import path from "path";

// Load .env file from the root directory
dotenv.config({ path: path.join(__dirname, "../.env") });

import express from "express";
import cors from "cors";
import analysisRoutes from "./routes/analysis";
import authRoutes from "./routes/auth";
import chatRoutes from "./routes/chat";
import connectDB from "./config/database";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api", analysisRoutes);

// Port
const PORT = process.env.PORT || 5001;

// Health Check Route
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "HealthLens API is running 🚀"
  });
});

// Connect to MongoDB, then start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});