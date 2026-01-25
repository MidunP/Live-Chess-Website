"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const ws_1 = require("ws");
const GameManager_1 = require("./GameManager");
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("./db");
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
const server = http_1.default.createServer(app);
const wss = new ws_1.WebSocketServer({ server });
const gameManager = new GameManager_1.GameManager();
// Authentication Endpoints
app.post("/signup", async (req, res) => {
    const { email, password, username } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
    }
    try {
        const existingUser = await db_1.db.getUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }
        const passwordHash = await bcryptjs_1.default.hash(password, 10);
        const user = await db_1.db.addUser(email, passwordHash, username);
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, JWT_SECRET);
        res.status(201).json({ token, user: { id: user.id, email: user.email, username: user.username } });
    }
    catch (e) {
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
        const user = await db_1.db.getUserByEmail(email);
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        const isValid = await bcryptjs_1.default.compare(password, user.password);
        if (!isValid) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, JWT_SECRET);
        res.json({ token, user: { id: user.id, email: user.email, username: user.username } });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ message: "Internal server error" });
    }
});
wss.on("connection", (socket) => {
    console.log("👤 New player connected");
    gameManager.addUser(socket);
});
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`🚀 Chess server running on http://localhost:${PORT}`);
    console.log(`🔌 WebSocket server running on same port`);
});
//# sourceMappingURL=index.js.map