"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketManager = exports.SocketManager = void 0;
const ws_1 = require("ws");
class SocketManager {
    static instance;
    userToSocket = new Map();
    socketToUser = new Map();
    constructor() { }
    static getInstance() {
        if (!this.instance) {
            this.instance = new SocketManager();
        }
        return this.instance;
    }
    addUser(userId, socket) {
        this.userToSocket.set(userId, socket);
        this.socketToUser.set(socket, userId);
    }
    removeUser(socket) {
        const userId = this.socketToUser.get(socket);
        if (userId) {
            this.userToSocket.delete(userId);
            this.socketToUser.delete(socket);
        }
    }
    getSocket(userId) {
        return this.userToSocket.get(userId);
    }
    getUserId(socket) {
        return this.socketToUser.get(socket);
    }
    broadcast(userId, message) {
        const socket = this.userToSocket.get(userId);
        if (socket && socket.readyState === ws_1.WebSocket.OPEN) {
            socket.send(JSON.stringify(message));
        }
    }
}
exports.SocketManager = SocketManager;
exports.socketManager = SocketManager.getInstance();
//# sourceMappingURL=SocketManager.js.map