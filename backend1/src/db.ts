import { PrismaClient } from '@prisma/client';

export class DatabaseManager {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

    public async addUser(email: string, passwordHash: string, username?: string) {
        return await this.prisma.user.create({
            data: {
                email,
                password: passwordHash,
                username
            }
        });
    }

    public async getUserByEmail(email: string) {
        return await this.prisma.user.findUnique({
            where: { email }
        });
    }

    public async getUserById(id: string) {
        return await this.prisma.user.findUnique({
            where: { id }
        });
    }

    public async addGame(gameId: string, whitePlayerId?: string, blackPlayerId?: string) {
        // Prepare data object, only including IDs if they are valid UUIDs 
        // (assuming guests used random strings that might not be in User table)
        const data: any = {
            id: gameId,
            status: "IN_PROGRESS"
        };

        if (whitePlayerId && this.isValidUUID(whitePlayerId)) data.whitePlayerId = whitePlayerId;
        if (blackPlayerId && this.isValidUUID(blackPlayerId)) data.blackPlayerId = blackPlayerId;

        try {
            return await this.prisma.game.create({ data });
        } catch (e) {
            console.error("Error adding game to DB:", e);
        }
    }

    private isValidUUID(id: string) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        return uuidRegex.test(id);
    }

    public async addMove(gameId: string, move: { from: string, to: string, promotion?: string }) {
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
        } catch (e) {
            console.error("Error adding move to DB:", e);
        }
    }

    public async updateGameResult(gameId: string, winner: string) {
        let result: string;
        if (winner === 'white') result = "WHITE_WINS";
        else if (winner === 'black') result = "BLACK_WINS";
        else result = "DRAW";

        try {
            return await this.prisma.game.update({
                where: { id: gameId },
                data: {
                    status: "FINISHED",
                    result: result as any
                }
            });
        } catch (e) {
            console.error("Error updating game result in DB:", e);
        }
    }

    public async getGames() {
        return await this.prisma.game.findMany({
            include: {
                whitePlayer: true,
                blackPlayer: true,
                moves: true
            }
        });
    }
}

export const db = new DatabaseManager();
