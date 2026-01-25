"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketManager = exports.SocketManager = void 0;
const ws_1 = require("ws");
class SocketManager {
    static instance;
    // Map userId to a Set of active WebSockets
    userToSockets = new Map();
    socketToUser = new Map();
    constructor() { }
    static getInstance() {
        if (!this.instance) {
            this.instance = new SocketManager();
        }
        return this.instance;
    }
    addUser(userId, socket) {
        console.log(`[SocketManager] Linking user ${userId} to a new socket.`);
        // Add to the set of sockets for this user
        if (!this.userToSockets.has(userId)) {
            this.userToSockets.set(userId, new Set());
        }
        this.userToSockets.get(userId).add(socket);
        // Inverse mapping
        this.socketToUser.set(socket, userId);
        console.log(`[SocketManager] User ${userId} now has ${this.userToSockets.get(userId).size} active socket(s).`);
    }
    removeUser(socket) {
        const userId = this.socketToUser.get(socket);
        if (userId) {
            console.log(`[SocketManager] Socket closed for user ${userId}`);
            const sockets = this.userToSockets.get(userId);
            if (sockets) {
                sockets.delete(socket);
                if (sockets.size === 0) {
                    this.userToSockets.delete(userId);
                    console.log(`[SocketManager] All sockets closed for user ${userId}. Mapping cleared.`);
                }
                else {
                    console.log(`[SocketManager] User ${userId} still has ${sockets.size} active socket(s).`);
                }
            }
            this.socketToUser.delete(socket);
        }
    }
    getSocket(userId) {
        // Return the first available open socket for basic checks
        const sockets = this.userToSockets.get(userId);
        if (sockets && sockets.size > 0) {
            return Array.from(sockets)[0];
        }
        return null;
    }
    getUserId(socket) {
        return this.socketToUser.get(socket);
    }
    broadcast(userId, message) {
        const sockets = this.userToSockets.get(userId);
        if (sockets && sockets.size > 0) {
            console.log(`[SocketManager] Broadcasting ${message.type} to user ${userId} (${sockets.size} tabs)`);
            const messageStr = JSON.stringify(message);
            sockets.forEach(socket => {
                if (socket.readyState === ws_1.WebSocket.OPEN) {
                    socket.send(messageStr);
                }
            });
        }
        else {
            console.log(`[SocketManager] Broadcast failed for ${userId}: No active sockets found.`);
        }
    }
}
exports.SocketManager = SocketManager;
exports.socketManager = SocketManager.getInstance();
//# sourceMappingURL=SocketManager.js.map