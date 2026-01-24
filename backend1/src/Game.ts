import { WebSocket } from "ws";
import { Chess } from "chess.js";
import { INIT_GAME, MOVE, GAME_OVER } from "./message";
import { db } from "./db";

export class Game {
  public player1: WebSocket;
  public player2: WebSocket;
  public gameId: string;
  private board: Chess;

  constructor(gameId: string, player1: WebSocket, player2: WebSocket) {
    this.gameId = gameId;
    this.player1 = player1;
    this.player2 = player2;
    this.board = new Chess();

    db.addGame(this.gameId);

    this.safeSend(this.player1, {
      type: INIT_GAME,
      payload: { color: "white" }
    });

    this.safeSend(this.player2, {
      type: INIT_GAME,
      payload: { color: "black" }
    });
  }

  makeMove(
    socket: WebSocket,
    move: { from: string; to: string; promotion?: string }
  ) {
    console.log("inside makemove");
    console.log("received move:", move);

    // ❌ invalid payload guard
    if (!move || !move.from || !move.to) {
      console.log("Invalid move payload");
      return;
    }

    // ✅ CORRECT TURN CHECK
    const turn = this.board.turn(); // "w" or "b"

    if (turn === "w" && socket !== this.player1) {
      console.log("early return: not white's socket");
      return;
    }

    if (turn === "b" && socket !== this.player2) {
      console.log("early return: not black's socket");
      return;
    }

    console.log("did not early return");

    // ✅ NORMALIZE MOVE (IMPORTANT)
    const normalizedMove = {
      from: move.from,
      to: move.to,
      promotion: move.promotion ?? "q"
    };

    let result;
    try {
      result = this.board.move(normalizedMove);
      if (!result) {
        console.log("Invalid chess move:", normalizedMove);
        return;
      }
    } catch (e) {
      console.log("move error:", e);
      return;
    }

    console.log("move succeeded");

    // ✅ SEND MOVE TO OPPONENT
    const opponent = turn === "w" ? this.player2 : this.player1;
    console.log(`Sending move to opponent (turn was ${turn})`);

    this.safeSend(opponent, {
      type: MOVE,
      payload: normalizedMove
    });
    console.log("Move sent to opponent:", normalizedMove);

    db.addMove(this.gameId, normalizedMove);

    // ✅ GAME OVER
    if (this.board.isGameOver()) {
      const winner = this.board.turn() === "w" ? "black" : "white";
      db.updateGameResult(this.gameId, winner);

      this.safeSend(this.player1, {
        type: GAME_OVER,
        payload: { winner }
      });

      this.safeSend(this.player2, {
        type: GAME_OVER,
        payload: { winner }
      });
    }
  }

  private safeSend(ws: WebSocket, message: any) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }
}
