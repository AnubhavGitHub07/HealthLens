import dotenv from "dotenv";
import path from "path";

// Load .env file from the backend root directory
dotenv.config({ path: path.join(process.cwd(), ".env") });

import express from "express";
import cors from "cors";
import analysisRoutes from "./routes/analysis";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
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

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});