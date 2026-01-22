"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const GameManager_1 = require("./GameManager");
const wss = new ws_1.WebSocketServer({ port: 8080 });
const gameManager = new GameManager_1.GameManager();
console.log("🚀 Chess server running on ws://localhost:8080");
wss.on("connection", (socket) => {
    console.log("👤 New player connected");
    gameManager.addUser(socket);
});
//# sourceMappingURL=index.js.map