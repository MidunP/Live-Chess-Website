"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameManager = void 0;
const ws_1 = require("ws");
const Game_1 = require("./Game");
const message_1 = require("./message");
const SocketManager_1 = require("./SocketManager");
const crypto_1 = __importDefault(require("crypto"));
class GameManager {
    games = [];
    pendingUser = null;
    pendingUsername = null;
    addUser(socket) {
        this.addHandler(socket);
        socket.on("close", () => {
            const userId = SocketManager_1.socketManager.getUserId(socket);
            SocketManager_1.socketManager.removeUser(socket);
            // If the pending user disconnects, clear them from the queue
            if (userId && this.pendingUser === userId) {
                console.log(`[GameManager] Pending user ${userId} disconnected. Queue cleared.`);
                this.pendingUser = null;
                this.pendingUsername = null;
            }
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
            // 1. Identification & Sync Mapping
            const userId = message.userId || SocketManager_1.socketManager.getUserId(socket);
            if (userId) {
                SocketManager_1.socketManager.addUser(userId, socket);
            }
            // 2. INIT_GAME Handler
            if (message.type === message_1.INIT_GAME) {
                if (!userId) {
                    socket.send(JSON.stringify({ type: message_1.ERROR, payload: "UserId required for INIT_GAME" }));
                    return;
                }
                const username = message.payload?.username || message.username || "Guest";
                console.log(`[GameManager] INIT: ${userId} (${username}), Rejoin: ${!!message.isRejoin}, Match: ${!!message.isMatchmaking}`);
                // 2a. Check for Active Session Resumption
                const activeGame = [...this.games].reverse().find(g => (g.player1UserId === userId || g.player2UserId === userId) && !g.ended);
                if (activeGame && !message.isMatchmaking && !message.payload?.isMatchmaking) {
                    console.log(`[GameManager] Syncing active game ${activeGame.gameId} for user ${userId}`);
                    SocketManager_1.socketManager.broadcast(userId, {
                        type: message_1.INIT_GAME,
                        payload: {
                            gameId: activeGame.gameId,
                            whitePlayerId: activeGame.player1UserId,
                            blackPlayerId: activeGame.player2UserId,
                            whitePlayerName: activeGame.player1Name,
                            blackPlayerName: activeGame.player2Name,
                            fen: activeGame.getFen(),
                            moves: activeGame.getMoves()
                        }
                    });
                    return; // Session resumed
                }
                // If explicitly matchmaking while in a game, auto-resign the old one
                if (activeGame && (message.isMatchmaking || message.payload?.isMatchmaking)) {
                    console.log(`[GameManager] User ${userId} starting new game, auto-resigning ${activeGame.gameId}`);
                    activeGame.ended = true;
                    const winner = userId === activeGame.player1UserId ? "black" : "white";
                    activeGame.broadcast({
                        type: message_1.GAME_OVER,
                        payload: {
                            winner,
                            reason: "resignation (started new game)"
                        }
                    });
                }
                // 2b. Rejoin Check (when no active game exists)
                if (message.isRejoin || message.payload?.isRejoin) {
                    console.log(`[GameManager] Rejoin requested by ${userId} but no active game found. Idle.`);
                    // NOTE: Do NOT clear the matchmaking queue here.
                    // The user may have clicked Play and then the socket re-handshaked.
                    // Clearing them here would break guest matchmaking.
                    return; // No game found, stop here.
                }
                // 2c. Explicit Matchmaking (Play Button)
                if (message.isMatchmaking || message.payload?.isMatchmaking) {
                    if (this.pendingUser && this.pendingUser !== userId) {
                        // Check if pending user's socket is actually still alive
                        const pendingSocket = SocketManager_1.socketManager.getSocket(this.pendingUser);
                        if (pendingSocket && pendingSocket.readyState === ws_1.WebSocket.OPEN) {
                            const gameId = crypto_1.default.randomUUID();
                            const game = new Game_1.Game(gameId, this.pendingUser, userId, this.pendingUsername || "Guest", username);
                            this.games.push(game);
                            const p1 = this.pendingUsername || "Guest";
                            console.log(`[GameManager] MATCH CREATED: ${gameId} -> ${p1} vs ${username}`);
                            this.pendingUser = null;
                            this.pendingUsername = null;
                        }
                        else {
                            console.log(`[GameManager] Pending user ${this.pendingUser} went stale. Replacing with ${userId}`);
                            this.pendingUser = userId;
                            this.pendingUsername = username;
                        }
                    }
                    else if (this.pendingUser === userId) {
                        console.log(`[GameManager] User ${userId} is already in the queue.`);
                    }
                    else {
                        this.pendingUser = userId;
                        this.pendingUsername = username;
                        console.log(`[GameManager] User ${userId} added to pool.`);
                    }
                }
                else {
                    console.log(`[GameManager] Request from ${userId} ignored: No isMatchmaking flag.`);
                }
            }
            // 3. MOVE Handler
            if (message.type === message_1.MOVE) {
                if (!userId)
                    return;
                const game = [...this.games].reverse().find(g => (g.player1UserId === userId || g.player2UserId === userId) && !g.ended);
                if (!game) {
                    console.log(`[GameManager] MOVE REJECTED: No active game for user ${userId}.`);
                    socket.send(JSON.stringify({ type: message_1.ERROR, payload: "Move rejected: No active game found." }));
                    return;
                }
                const movePayload = message.move || message.payload;
                console.log(`[GameManager] BROADCASTING MOVE: User=${userId}, Game=${game.gameId}`);
                game.makeMove(userId, movePayload);
            }
            // 4. RESIGN Handler
            if (message.type === message_1.RESIGN) {
                if (!userId)
                    return;
                const game = [...this.games].reverse().find(g => (g.player1UserId === userId || g.player2UserId === userId) && !g.ended);
                if (game) {
                    game.ended = true;
                    const winner = userId === game.player1UserId ? "black" : "white";
                    game.broadcast({
                        type: message_1.GAME_OVER,
                        payload: {
                            winner,
                            reason: "resignation"
                        }
                    });
                }
                else {
                    socket.send(JSON.stringify({ type: message_1.ERROR, payload: "Resignation rejected: No active game found." }));
                }
            }
        });
    }
}
exports.GameManager = GameManager;
//# sourceMappingURL=GameManager.js.map