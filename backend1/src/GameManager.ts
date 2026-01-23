import { WebSocket } from "ws";
import { Game } from "./Game";
import { INIT_GAME, MOVE, DEBUG, ERROR } from "./message";
import crypto from "crypto";

export class GameManager {
  private games: Game[] = [];
  private pendingUser: WebSocket | null = null;

  addUser(socket: WebSocket) {
    this.addHandler(socket);

    socket.on("close", () => {
      if (this.pendingUser === socket) {
        this.pendingUser = null;
      }
    });
  }

  private addHandler(socket: WebSocket) {
    socket.on("message", (data) => {
      let message: any;

      // JSON safety
      try {
        message = JSON.parse(data.toString());
      } catch {
        socket.send(
          JSON.stringify({
            type: ERROR,
            payload: "Invalid JSON",
          })
        );
        return;
      }



      // INIT GAME
      if (message.type === INIT_GAME) {
        if (this.pendingUser) {
          const gameId = crypto.randomUUID();
          const game = new Game(gameId, this.pendingUser, socket);
          this.games.push(game);
          this.pendingUser = null;
        } else {
          this.pendingUser = socket;
        }
      }

      if (message.type === MOVE) {

        const game = this.games.find(
          g => g.player1 === socket || g.player2 === socket
        );

        if (!game) {
          return;
        }


        // IMPORTANT: pass message.move or message.payload
        game.makeMove(socket, message.move || message.payload);
      }
    });
  }
}

