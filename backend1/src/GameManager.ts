import { WebSocket } from "ws";
import { Game } from "./Game";
import { INIT_GAME, MOVE, DEBUG, ERROR } from "./message";
import { socketManager } from "./SocketManager";
import crypto from "crypto";

export class GameManager {
  private games: Game[] = [];
  private pendingUser: string | null = null;

  addUser(socket: WebSocket) {
    this.addHandler(socket);

    socket.on("close", () => {
      socketManager.removeUser(socket);
    });
  }

  private addHandler(socket: WebSocket) {
    socket.on("message", (data) => {
      let message: any;

      try {
        message = JSON.parse(data.toString());
      } catch {
        socket.send(JSON.stringify({ type: ERROR, payload: "Invalid JSON" }));
        return;
      }

      // Record/Update the connection for the user
      const userId = message.userId || socketManager.getUserId(socket);
      if (userId) {
        socketManager.addUser(userId, socket);
      }

      // INIT GAME
      if (message.type === INIT_GAME) {
        if (!userId) {
          socket.send(JSON.stringify({ type: ERROR, payload: "UserId required for INIT_GAME" }));
          return;
        }

        console.log(`INIT_GAME received from ${userId}`);

        if (this.pendingUser && this.pendingUser !== userId) {
          // Check if the pending user's socket is still open
          const pendingSocket = socketManager.getSocket(this.pendingUser);
          if (pendingSocket && pendingSocket.readyState === WebSocket.OPEN) {
            const gameId = crypto.randomUUID();
            const game = new Game(gameId, this.pendingUser, userId);
            this.games.push(game);
            this.pendingUser = null;
            console.log(`Match found! Game ${gameId} created between ${this.pendingUser} and ${userId}`);
          } else {
            console.log(`Pending user ${this.pendingUser} disconnected. New pending user: ${userId}`);
            this.pendingUser = userId;
          }
        } else {
          this.pendingUser = userId;
          console.log(`User ${userId} is now pending`);
        }
      }

      if (message.type === MOVE) {
        if (!userId) return;

        const game = this.games.find(
          g => g.player1UserId === userId || g.player2UserId === userId
        );

        if (!game) {
          console.log(`No active game found for user ${userId}`);
          return;
        }

        game.makeMove(userId, message.move || message.payload);
      }
    });
  }
}

