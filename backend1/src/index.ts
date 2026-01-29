import "dotenv/config";
import { WebSocketServer } from "ws";
import { GameManager } from "./GameManager";
import express from "express";
import http from "http";
import cors from "cors";
import path from "path";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "./db";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

const app = express();
app.use(express.json());
app.use(cors());

// Serve static files from the frontend/dist directory
const frontendPath = path.join(__dirname, "../../frontend/dist");
app.use(express.static(frontendPath));

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const gameManager = new GameManager();

// Authentication Endpoints
app.post("/signup", async (req, res) => {
  const { email, password, username } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  try {
    const existingUser = await db.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await db.addUser(email, passwordHash, username);

    const token = jwt.sign({ userId: user.id }, JWT_SECRET);
    res.status(201).json({ token, user: { id: user.id, email: user.email, username: user.username } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  try {
    const user = await db.getUserByEmail(email);
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET);
    res.json({ token, user: { id: user.id, email: user.email, username: user.username } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Internal server error" });
  }
});

wss.on("connection", (socket) => {
  console.log("👤 New player connected");
  gameManager.addUser(socket);
});

// Fallback to index.html for client-side routing (React Router)
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`🚀 Chess server running on http://localhost:${PORT}`);
  console.log(`🔌 WebSocket server running on same port`);
});
