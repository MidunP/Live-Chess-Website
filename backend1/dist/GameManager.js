"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameManager = void 0;
const Game_1 = require("./Game");
const message_1 = require("./message");
const SocketManager_1 = require("./SocketManager");
const crypto_1 = __importDefault(require("crypto"));
class GameManager {
    games = [];
    pendingUser = null;
    addUser(socket) {
        this.addHandler(socket);
        socket.on("close", () => {
            SocketManager_1.socketManager.removeUser(socket);
        });
    }
    addHandler(socket) {
        socket.on("message", (data) => {
            let message;
            try {
                message = JSON.parse(data.toString());
            }
            catch {
                socket.send(JSON.stringify({ type: message_1.ERROR, payload: "Invalid JSON" }));
                return;
            }
            // Record/Update the connection for the user
            const userId = message.userId || SocketManager_1.socketManager.getUserId(socket);
            if (userId) {
                SocketManager_1.socketManager.addUser(userId, socket);
            }
            // INIT GAME
            if (message.type === message_1.INIT_GAME) {
                if (!userId) {
                    socket.send(JSON.stringify({ type: message_1.ERROR, payload: "UserId required for INIT_GAME" }));
                    return;
                }
                if (this.pendingUser && this.pendingUser !== userId) {
                    const gameId = crypto_1.default.randomUUID();
                    const game = new Game_1.Game(gameId, this.pendingUser, userId);
                    this.games.push(game);
                    this.pendingUser = null;
                }
                else {
                    this.pendingUser = userId;
                }
            }
            if (message.type === message_1.MOVE) {
                if (!userId)
                    return;
                const game = this.games.find(g => g.player1UserId === userId || g.player2UserId === userId);
                if (!game) {
                    console.log(`No active game found for user ${userId}`);
                    return;
                }
                game.makeMove(userId, message.move || message.payload);
            }
        });
    }
}
exports.GameManager = GameManager;
//# sourceMappingURL=GameManager.js.map