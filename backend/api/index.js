import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "../routes/auth.js";
import adminRoutes from "../routes/admin.js";

dotenv.config();

const app = express();

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "DELETE"],
}));

app.use(express.json());

app.use("/api", authRoutes);
app.use("/api", adminRoutes);

app.get("/", (req, res) => {
  res.send("Backend running");
});

// Connect MongoDB
if (!mongoose.connections[0].readyState) {
  mongoose.connect(process.env.MONGO_URI);
}

// ✅ IMPORTANT: Export app (NO app.listen)
export default app;