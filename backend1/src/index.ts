import { WebSocketServer } from "ws";
import { GameManager } from "./GameManager";

const wss = new WebSocketServer({ port: 8080 });
const gameManager = new GameManager();

console.log("🚀 Chess server running on ws://localhost:8080");

wss.on("connection", (socket) => {
  console.log("👤 New player connected");
  gameManager.addUser(socket);
});
