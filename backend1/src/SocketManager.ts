import { WebSocket } from "ws";

export class SocketManager {
    private static instance: SocketManager;
    // Map userId to a Set of active WebSockets
    private userToSockets: Map<string, Set<WebSocket>> = new Map();
    private socketToUser: Map<WebSocket, string> = new Map();

    private constructor() { }

    public static getInstance() {
        if (!this.instance) {
            this.instance = new SocketManager();
        }
        return this.instance;
    }

    public addUser(userId: string, socket: WebSocket) {
        console.log(`[SocketManager] Linking user ${userId} to a new socket.`);

        // Add to the set of sockets for this user
        if (!this.userToSockets.has(userId)) {
            this.userToSockets.set(userId, new Set());
        }
        this.userToSockets.get(userId)!.add(socket);

        // Inverse mapping
        this.socketToUser.set(socket, userId);

        console.log(`[SocketManager] User ${userId} now has ${this.userToSockets.get(userId)!.size} active socket(s).`);
    }

    public removeUser(socket: WebSocket) {
        const userId = this.socketToUser.get(socket);
        if (userId) {
            console.log(`[SocketManager] Socket closed for user ${userId}`);

            const sockets = this.userToSockets.get(userId);
            if (sockets) {
                sockets.delete(socket);
                if (sockets.size === 0) {
                    this.userToSockets.delete(userId);
                    console.log(`[SocketManager] All sockets closed for user ${userId}. Mapping cleared.`);
                } else {
                    console.log(`[SocketManager] User ${userId} still has ${sockets.size} active socket(s).`);
                }
            }
            this.socketToUser.delete(socket);
        }
    }

    public getSocket(userId: string) {
        // Return the first available open socket for basic checks
        const sockets = this.userToSockets.get(userId);
        if (sockets && sockets.size > 0) {
            return Array.from(sockets)[0];
        }
        return null;
    }

    public getUserId(socket: WebSocket) {
        return this.socketToUser.get(socket);
    }

    public broadcast(userId: string, message: any) {
        const sockets = this.userToSockets.get(userId);
        if (sockets && sockets.size > 0) {
            console.log(`[SocketManager] Broadcasting ${message.type} to user ${userId} (${sockets.size} tabs)`);
            const messageStr = JSON.stringify(message);

            sockets.forEach(socket => {
                if (socket.readyState === WebSocket.OPEN) {
                    socket.send(messageStr);
                }
            });
        } else {
            console.log(`[SocketManager] Broadcast failed for ${userId}: No active sockets found.`);
        }
    }
}

export const socketManager = SocketManager.getInstance();
