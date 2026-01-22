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
        console.log("inside makemove");
        // 🔹 MISSING PART (tutorial debug)
        console.log(this.board.moves().length % 2);
        // Turn validation
        if (this.board.moves().length % 2 === 0 && socket !== this.player1) {
            return;
        }
        if (this.board.moves().length % 2 === 1 && socket !== this.player2) {
            return;
        }
        console.log("did not early return");
        let result;
        try {
            result = this.board.move(move);
            if (!result)
                return;
        }
        catch (e) {
            console.log(e);
            return;
        }
        console.log("move succeeded");
        // Send MOVE to BOTH players
        this.safeSend(this.player1, {
            type: message_1.MOVE,
            payload: move
        });
        this.safeSend(this.player2, {
            type: message_1.MOVE,
            payload: move
        });
        db_1.db.addMove(this.gameId, move);
        // Game over
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