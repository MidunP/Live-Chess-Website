import { Chess } from "chess.js";
import { INIT_GAME, MOVE, GAME_OVER } from "./message";
import { db } from "./db";
import { socketManager } from "./SocketManager";

export class Game {
  public player1UserId: string;
  public player2UserId: string;
  public gameId: string;
  private board: Chess;

  constructor(gameId: string, player1UserId: string, player2UserId: string) {
    this.gameId = gameId;
    this.player1UserId = player1UserId;
    this.player2UserId = player2UserId;
    this.board = new Chess();

    db.addGame(this.gameId);

    this.broadcast({
      type: INIT_GAME,
      payload: {
        gameId: this.gameId,
        whitePlayerId: this.player1UserId,
        blackPlayerId: this.player2UserId,
        fen: this.board.fen()
      }
    });
  }

  public broadcast(message: any) {
    socketManager.broadcast(this.player1UserId, message);
    socketManager.broadcast(this.player2UserId, message);
  }

  makeMove(
    userId: string,
    move: { from: string; to: string; promotion?: string }
  ) {
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
    } catch (e) {
      console.log("Move error:", e);
      return;
    }

    console.log("Move succeeded, broadcasting to all");

    // ✅ BROADCAST TO BOTH PLAYERS
    this.broadcast({
      type: MOVE,
      payload: {
        move: normalizedMove,
        fen: this.board.fen()
      }
    });

    db.addMove(this.gameId, normalizedMove);

    // ✅ GAME OVER
    if (this.board.isGameOver()) {
      const winner = this.board.turn() === "w" ? "black" : "white";
      db.updateGameResult(this.gameId, winner);

      this.broadcast({
        type: GAME_OVER,
        payload: { winner }
      });
    }
  }
}
