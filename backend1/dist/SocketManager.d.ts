import { WebSocket } from "ws";
export declare class SocketManager {
    private static instance;
    private userToSocket;
    private socketToUser;
    private constructor();
    static getInstance(): SocketManager;
    addUser(userId: string, socket: WebSocket): void;
    removeUser(socket: WebSocket): void;
    getSocket(userId: string): WebSocket | undefined;
    getUserId(socket: WebSocket): string | undefined;
    broadcast(userId: string, message: any): void;
}
export declare const socketManager: SocketManager;
//# sourceMappingURL=SocketManager.d.ts.map