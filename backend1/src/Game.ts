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
    move: {
      from: string;
      to: string;
    }
  ) {
    console.log("inside makemove");

    // Turn check (before move)
    console.log(this.board.moves().length % 2);

    if (this.board.moves().length % 2 === 0 && socket !== this.player1) {
      return;
    }

    if (this.board.moves().length % 2 === 1 && socket !== this.player2) {
      return;
    }

    console.log("did not early return");

    // Try move
    let result;
    try {
      result = this.board.move(move);
      if (!result) return;
    } catch (e) {
      console.log(e);
      return;
    }

    console.log("move succeeded");

    // Send MOVE only to opponent
    console.log(this.board.moves().length % 2);

    if (this.board.moves().length % 2 === 0) {
      console.log("sent1");
      this.safeSend(this.player2, {
        type: MOVE,
        payload: move
      });
    } else {
      console.log("sent2");
      this.safeSend(this.player1, {
        type: MOVE,
        payload: move
      });
    }

    db.addMove(this.gameId, move);

    // Game over handling
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
