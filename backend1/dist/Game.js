"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
const ws_1 = require("ws");
const chess_js_1 = require("chess.js");
const message_1 = require("./message");
const db_1 = require("./db");
class Game {
    player1;
    player2;
    gameId;
    board;
    constructor(gameId, player1, player2) {
        this.gameId = gameId;
        this.player1 = player1;
        this.player2 = player2;
        this.board = new chess_js_1.Chess();
        db_1.db.addGame(this.gameId);
        this.safeSend(this.player1, {
            type: message_1.INIT_GAME,
            payload: { color: "white" }
        });
        this.safeSend(this.player2, {
            type: message_1.INIT_GAME,
            payload: { color: "black" }
        });
    }
    makeMove(socket, move) {
        // Validation
        console.log("inside makemove");
        console.log("received move:", move);
        if (!move || !move.from || !move.to) {
            console.log("❌ Invalid move payload:", move);
            return;
        }
        const turn = this.board.turn(); // "w" | "b"
        if (turn === "w" && socket !== this.player1) {
            console.log("❌ Not player 1's turn");
            return;
        }
        if (turn === "b" && socket !== this.player2) {
            console.log("❌ Not player 2's turn");
            return;
        }
        const normalizedMove = {
            from: move.from,
            to: move.to,
            promotion: move.promotion ?? "q"
        };
        let result;
        try {
            result = this.board.move(normalizedMove);
        }
        catch (e) {
            console.error("Error making move:", e);
            return;
        }
        if (!result) {
            console.log("❌ Invalid move according to chess rules");
            return;
        }
        console.log("✅ Move succeeded:", normalizedMove);
        // ✅ SEND MOVE TO OPPONENT ONLY
        const opponent = turn === "w" ? this.player2 : this.player1;
        this.safeSend(opponent, {
            type: message_1.MOVE,
            payload: normalizedMove
        });
        db_1.db.addMove(this.gameId, normalizedMove);
        // ✅ GAME OVER HANDLING
        if (this.board.isGameOver()) {
            const winner = this.board.turn() === "w" ? "black" : "white";
            db_1.db.updateGameResult(this.gameId, winner);
            this.safeSend(this.player1, {
                type: message_1.GAME_OVER,
                payload: { winner }
            });
            this.safeSend(this.player2, {
                type: message_1.GAME_OVER,
                payload: { winner }
            });
        }
    }
    safeSend(ws, message) {
        if (ws.readyState === ws_1.WebSocket.OPEN) {
            ws.send(JSON.stringify(message));
        }
    }
}
exports.Game = Game;
//# sourceMappingURL=Game.js.map