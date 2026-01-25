export declare class DatabaseManager {
    private prisma;
    constructor();
    addUser(email: string, passwordHash: string, username?: string): Promise<{
        id: string;
        username: string | null;
        email: string;
        password: string;
        createdAt: Date;
    }>;
    getUserByEmail(email: string): Promise<{
        id: string;
        username: string | null;
        email: string;
        password: string;
        createdAt: Date;
    } | null>;
    getUserById(id: string): Promise<{
        id: string;
        username: string | null;
        email: string;
        password: string;
        createdAt: Date;
    } | null>;
    addGame(gameId: string, whitePlayerId?: string, blackPlayerId?: string): Promise<{
        id: string;
        status: string;
        result: string | null;
        createdAt: Date;
        whitePlayerId: string | null;
        blackPlayerId: string | null;
    } | undefined>;
    private isValidUUID;
    addMove(gameId: string, move: {
        from: string;
        to: string;
        promotion?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        gameId: string;
        from: string;
        to: string;
        notation: string | null;
        moveNumber: number;
    } | undefined>;
    updateGameResult(gameId: string, winner: string): Promise<{
        id: string;
        status: string;
        result: string | null;
        createdAt: Date;
        whitePlayerId: string | null;
        blackPlayerId: string | null;
    } | undefined>;
    getGames(): Promise<({
        whitePlayer: {
            id: string;
            username: string | null;
            email: string;
            password: string;
            createdAt: Date;
        } | null;
        blackPlayer: {
            id: string;
            username: string | null;
            email: string;
            password: string;
            createdAt: Date;
        } | null;
        moves: {
            id: string;
            createdAt: Date;
            gameId: string;
            from: string;
            to: string;
            notation: string | null;
            moveNumber: number;
        }[];
    } & {
        id: string;
        status: string;
        result: string | null;
        createdAt: Date;
        whitePlayerId: string | null;
        blackPlayerId: string | null;
    })[]>;
}
export declare const db: DatabaseManager;
//# sourceMappingURL=db.d.ts.map