import { WebSocket } from "ws";

export class SocketManager {
    private static instance: SocketManager;
    private userToSocket: Map<string, WebSocket> = new Map();
    private socketToUser: Map<WebSocket, string> = new Map();

    private constructor() { }

    public static getInstance() {
        if (!this.instance) {
            this.instance = new SocketManager();
        }
        return this.instance;
    }

    public addUser(userId: string, socket: WebSocket) {
        this.userToSocket.set(userId, socket);
        this.socketToUser.set(socket, userId);
    }

    public removeUser(socket: WebSocket) {
        const userId = this.socketToUser.get(socket);
        if (userId) {
            this.userToSocket.delete(userId);
            this.socketToUser.delete(socket);
        }
    }

    public getSocket(userId: string) {
        return this.userToSocket.get(userId);
    }

    public getUserId(socket: WebSocket) {
        return this.socketToUser.get(socket);
    }

    public broadcast(userId: string, message: any) {
        const socket = this.userToSocket.get(userId);
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify(message));
        }
    }
}

export const socketManager = SocketManager.getInstance();
