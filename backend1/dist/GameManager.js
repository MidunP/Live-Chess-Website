"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameManager = void 0;
const Game_1 = require("./Game");
const message_1 = require("./message");
const crypto_1 = __importDefault(require("crypto"));
class GameManager {
    games = [];
    pendingUser = null;
    addUser(socket) {
        this.addHandler(socket);
        socket.on("close", () => {
            if (this.pendingUser === socket) {
                this.pendingUser = null;
            }
        });
    }
    addHandler(socket) {
        socket.on("message", (data) => {
            let message;
            // JSON safety
            try {
                message = JSON.parse(data.toString());
            }
            catch {
                socket.send(JSON.stringify({
                    type: message_1.ERROR,
                    payload: "Invalid JSON",
                }));
                return;
            }
            console.log("📩 Received:", message);
            // INIT GAME
            if (message.type === message_1.INIT_GAME) {
                if (this.pendingUser) {
                    const gameId = crypto_1.default.randomUUID();
                    const game = new Game_1.Game(gameId, this.pendingUser, socket);
                    this.games.push(game);
                    this.pendingUser = null;
                }
                else {
                    this.pendingUser = socket;
                }
                return;
            }
            // MOVE ✅ (this is the missing / important part)
            if (message.type === message_1.MOVE) {
                console.log("inside move");
                const game = this.games.find(g => g.player1 === socket || g.player2 === socket);
                if (!game) {
                    console.log("❌ Game not found for this player");
                    return;
                }
                // IMPORTANT: pass message.move
                game.makeMove(socket, message.move);
            }
        });
    }
}
exports.GameManager = GameManager;
//# sourceMappingURL=GameManager.js.map