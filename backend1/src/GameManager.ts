import { WebSocket } from "ws";
import { Game } from "./Game";
import { INIT_GAME, MOVE, DEBUG, ERROR } from "./message";
import { socketManager } from "./SocketManager";
import crypto from "crypto";

export class GameManager {
  private games: Game[] = [];
  private pendingUser: string | null = null;
  private pendingUsername: string | null = null;

  addUser(socket: WebSocket) {
    this.addHandler(socket);

    socket.on("close", () => {
      const userId = socketManager.getUserId(socket);
      socketManager.removeUser(socket);

      // If the pending user disconnects, clear them from the queue
      if (userId && this.pendingUser === userId) {
        console.log(`[GameManager] Pending user ${userId} disconnected. Queue cleared.`);
        this.pendingUser = null;
        this.pendingUsername = null;
      }
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

      // 1. Identification & Sync Mapping
      const userId = message.userId || socketManager.getUserId(socket);
      if (userId) {
        socketManager.addUser(userId, socket);
      }

      // 2. INIT_GAME Handler
      if (message.type === INIT_GAME) {
        if (!userId) {
          socket.send(JSON.stringify({ type: ERROR, payload: "UserId required for INIT_GAME" }));
          return;
        }

        const username = message.payload?.username || message.username || "Guest";
        console.log(`[GameManager] INIT: ${userId} (${username}), Rejoin: ${!!message.isRejoin}, Match: ${!!message.isMatchmaking}`);

        // 2a. Check for Active Session Resumption
        const activeGame = [...this.games].reverse().find(
          g => (g.player1UserId === userId || g.player2UserId === userId) && !g.ended
        );

        if (activeGame) {
          console.log(`[GameManager] Syncing active game ${activeGame.gameId} for user ${userId}`);
          socketManager.broadcast(userId, {
            type: INIT_GAME,
            payload: {
              gameId: activeGame.gameId,
              whitePlayerId: activeGame.player1UserId,
              blackPlayerId: activeGame.player2UserId,
              whitePlayerName: activeGame.player1Name,
              blackPlayerName: activeGame.player2Name,
              fen: activeGame.getFen()
            }
          });
          return; // Session resumed, do not proceed to matchmaking
        }

        // 2b. Rejoin Check (when no active game exists)
        if (message.isRejoin || message.payload?.isRejoin) {
          console.log(`[GameManager] Rejoin requested by ${userId} but no active game found. Idle.`);

          // CRITICAL: If they were in the queue, clear them. 
          // This prevents "auto-matching" after a reload if they were previously searching.
          if (this.pendingUser === userId) {
            console.log(`[GameManager] Clearing user ${userId} from matchmaking pool on reload.`);
            this.pendingUser = null;
            this.pendingUsername = null;
          }
          return; // No game found, stop here.
        }

        // 2c. Explicit Matchmaking (Play Button)
        if (message.isMatchmaking || message.payload?.isMatchmaking) {
          if (this.pendingUser && this.pendingUser !== userId) {
            // Check if pending user's socket is actually still alive
            const pendingSocket = socketManager.getSocket(this.pendingUser);
            if (pendingSocket && pendingSocket.readyState === WebSocket.OPEN) {
              const gameId = crypto.randomUUID();
              const game = new Game(gameId, this.pendingUser, userId, this.pendingUsername || "Guest", username);
              this.games.push(game);

              const p1 = this.pendingUsername || "Guest";
              console.log(`[GameManager] MATCH CREATED: ${gameId} -> ${p1} vs ${username}`);

              this.pendingUser = null;
              this.pendingUsername = null;
            } else {
              console.log(`[GameManager] Pending user ${this.pendingUser} went stale. Replacing with ${userId}`);
              this.pendingUser = userId;
              this.pendingUsername = username;
            }
          } else if (this.pendingUser === userId) {
            console.log(`[GameManager] User ${userId} is already in the queue.`);
          } else {
            this.pendingUser = userId;
            this.pendingUsername = username;
            console.log(`[GameManager] User ${userId} added to pool.`);
          }
        } else {
          console.log(`[GameManager] Request from ${userId} ignored: No isMatchmaking flag.`);
        }
      }

      // 3. MOVE Handler
      if (message.type === MOVE) {
        if (!userId) return;

        const game = [...this.games].reverse().find(
          g => (g.player1UserId === userId || g.player2UserId === userId) && !g.ended
        );

        if (!game) {
          console.log(`[GameManager] MOVE REJECTED: No active game for user ${userId}.`);
          return;
        }

        const movePayload = message.move || message.payload;
        console.log(`[GameManager] BROADCASTING MOVE: User=${userId}, Game=${game.gameId}`);
        game.makeMove(userId, movePayload);
      }
    });
  }
}
