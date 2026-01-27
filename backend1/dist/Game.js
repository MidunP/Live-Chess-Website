"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
const chess_js_1 = require("chess.js");
const message_1 = require("./message");
const db_1 = require("./db");
const SocketManager_1 = require("./SocketManager");
class Game {
    player1UserId;
    player2UserId;
    gameId;
    player1Name;
    player2Name;
    ended = false;
    board;
    constructor(gameId, player1UserId, player2UserId, player1Name, player2Name) {
        this.gameId = gameId;
        this.player1UserId = player1UserId;
        this.player2UserId = player2UserId;
        this.player1Name = player1Name || "Guest";
        this.player2Name = player2Name || "Guest";
        this.board = new chess_js_1.Chess();
        db_1.db.addGame(this.gameId, this.player1UserId, this.player2UserId);
        this.broadcast({
            type: message_1.INIT_GAME,
            payload: {
                gameId: this.gameId,
                whitePlayerId: this.player1UserId,
                blackPlayerId: this.player2UserId,
                whitePlayerName: this.player1Name,
                blackPlayerName: this.player2Name,
                fen: this.board.fen(),
                moves: []
            }
        });
    }
    getFen() {
        return this.board.fen();
    }
    getMoves() {
        return this.board.history({ verbose: true }).map(m => ({
            from: m.from,
            to: m.to,
            promotion: m.promotion
        }));
    }
    broadcast(message) {
        SocketManager_1.socketManager.broadcast(this.player1UserId, message);
        SocketManager_1.socketManager.broadcast(this.player2UserId, message);
    }
    makeMove(userId, move) {
        console.log(`makeMove called by ${userId}`);
        // ✅ Turn check using userId
        const currentTurn = this.board.turn(); // "w" or "b"
        const authorizedUserId = currentTurn === 'w' ? this.player1UserId : this.player2UserId;
        if (userId !== authorizedUserId) {
            console.log(`Unauthorized move attempt by ${userId}. Expected ${authorizedUserId}`);
            return;
        }
        // ✅ NORMALIZE MOVE
        const normalizedMove = {
            from: move.from,
            to: move.to,
            promotion: move.promotion ?? "q"
        };
        try {
            const result = this.board.move(normalizedMove);
            if (!result) {
                console.log("Invalid chess move:", normalizedMove);
                return;
            }
        }
        catch (e) {
            console.log("Move error:", e);
            return;
        }
        console.log(`Move succeeded in game ${this.gameId}, broadcasting to both players`);
        // ✅ BROADCAST TO BOTH PLAYERS
        this.broadcast({
            type: message_1.MOVE,
            payload: {
                move: normalizedMove,
                fen: this.board.fen()
            }
        });
        db_1.db.addMove(this.gameId, normalizedMove);
        // ✅ GAME OVER
        if (this.board.isGameOver()) {
            this.ended = true;
            let winner = null;
            let reason = "draw";
            if (this.board.isCheckmate()) {
                winner = this.board.turn() === "w" ? "black" : "white";
                reason = "checkmate";
            }
            else if (this.board.isStalemate()) {
                reason = "stalemate";
            }
            else if (this.board.isThreefoldRepetition()) {
                reason = "threefold repetition";
            }
            else if (this.board.isInsufficientMaterial()) {
                reason = "insufficient material";
            }
            else if (this.board.isDraw()) {
                reason = "draw";
            }
            db_1.db.updateGameResult(this.gameId, winner || "draw");
            this.broadcast({
                type: message_1.GAME_OVER,
                payload: {
                    winner,
                    reason
                }
            });
        }
    }
}
exports.Game = Game;
//# sourceMappingURL=Game.js.map