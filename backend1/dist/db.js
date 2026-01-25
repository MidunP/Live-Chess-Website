"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = exports.DatabaseManager = void 0;
const client_1 = require("@prisma/client");
class DatabaseManager {
    prisma;
    constructor() {
        this.prisma = new client_1.PrismaClient();
    }
    async addUser(email, passwordHash, username) {
        return await this.prisma.user.create({
            data: {
                email,
                password: passwordHash,
                username
            }
        });
    }
    async getUserByEmail(email) {
        return await this.prisma.user.findUnique({
            where: { email }
        });
    }
    async getUserById(id) {
        return await this.prisma.user.findUnique({
            where: { id }
        });
    }
    async addGame(gameId, whitePlayerId, blackPlayerId) {
        // Prepare data object, only including IDs if they are valid UUIDs 
        // (assuming guests used random strings that might not be in User table)
        const data = {
            id: gameId,
            status: "IN_PROGRESS"
        };
        if (whitePlayerId && this.isValidUUID(whitePlayerId))
            data.whitePlayerId = whitePlayerId;
        if (blackPlayerId && this.isValidUUID(blackPlayerId))
            data.blackPlayerId = blackPlayerId;
        try {
            return await this.prisma.game.create({ data });
        }
        catch (e) {
            console.error("Error adding game to DB:", e);
        }
    }
    isValidUUID(id) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        return uuidRegex.test(id);
    }
    async addMove(gameId, move) {
        try {
            // Get current move count to set moveNumber
            const moveCount = await this.prisma.move.count({
                where: { gameId }
            });
            return await this.prisma.move.create({
                data: {
                    gameId,
                    from: move.from,
                    to: move.to,
                    notation: `${move.from}-${move.to}`,
                    moveNumber: moveCount + 1
                }
            });
        }
        catch (e) {
            console.error("Error adding move to DB:", e);
        }
    }
    async updateGameResult(gameId, winner) {
        let result;
        if (winner === 'white')
            result = "WHITE_WINS";
        else if (winner === 'black')
            result = "BLACK_WINS";
        else
            result = "DRAW";
        try {
            return await this.prisma.game.update({
                where: { id: gameId },
                data: {
                    status: "FINISHED",
                    result: result
                }
            });
        }
        catch (e) {
            console.error("Error updating game result in DB:", e);
        }
    }
    async getGames() {
        return await this.prisma.game.findMany({
            include: {
                whitePlayer: true,
                blackPlayer: true,
                moves: true
            }
        });
    }
}
exports.DatabaseManager = DatabaseManager;
exports.db = new DatabaseManager();
//# sourceMappingURL=db.js.map