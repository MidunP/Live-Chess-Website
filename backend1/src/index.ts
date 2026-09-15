import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.join(__dirname, "../.env") });
dotenv.config({ path: path.join(process.cwd(), "backend1/.env") });
dotenv.config({ path: path.join(process.cwd(), ".env") });

import { WebSocketServer } from "ws";
import { GameManager } from "./GameManager";
import express from "express";
import http from "http";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "./db";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

const app = express();
app.use(express.json());

const configuredOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim())
  : ["http://localhost:5173", "http://localhost:3000", "http://localhost:4173"];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or same-origin)
      if (!origin) return callback(null, true);
      if (configuredOrigins.includes(origin) || configuredOrigins.includes("*")) {
        return callback(null, true);
      }
      // Allow any Vercel domain automatically for frontend preview & production deployments
      if (origin.endsWith(".vercel.app")) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Serve static files from the frontend/dist directory if present
const frontendPath = path.join(__dirname, "../../frontend/dist");
app.use(express.static(frontendPath));

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const gameManager = new GameManager();

// Health check endpoint for deployment monitoring (Render/Vercel)
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// Authentication Endpoints
app.post("/signup", async (req, res) => {
  const { email, password, username } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  const cleanEmail = email.trim().toLowerCase();

  try {
    const existingUser = await db.getUserByEmail(cleanEmail);
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await db.addUser(cleanEmail, passwordHash, username?.trim());

    const token = jwt.sign({ userId: user.id }, JWT_SECRET);
    res.status(201).json({ token, user: { id: user.id, email: user.email, username: user.username } });
  } catch (e: any) {
    console.error("[Signup Error]:", e);
    res.status(500).json({ message: "Internal server error: " + (e.message || "signup failed") });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  const cleanEmail = email.trim().toLowerCase();

  try {
    const user = await db.getUserByEmail(cleanEmail);
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET);
    res.json({ token, user: { id: user.id, email: user.email, username: user.username } });
  } catch (e: any) {
    console.error("[Login Error]:", e);
    res.status(500).json({ message: "Internal server error: " + (e.message || "login failed") });
  }
});

wss.on("connection", (socket) => {
  console.log("👤 New player connected");
  gameManager.addUser(socket);
});

// Fallback to index.html for client-side routing (React Router)
app.get(/.*/, (req, res) => {
  const indexPath = path.join(frontendPath, "index.html");
  if (require("fs").existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send("Frontend build index.html not found");
  }
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`🚀 Chess server running on port ${PORT}`);
  console.log(`🔌 WebSocket server running on same port`);
});

