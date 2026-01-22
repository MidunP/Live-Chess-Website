interface GameData {
    id: string;
    player1: string;
    player2: string;
    moves: any[];
    winner?: string;
    startTime: number;
}
export declare class DatabaseManager {
    private games;
    private FILE_PATH;
    constructor();
    private loadGames;
    private saveGames;
    addGame(gameId: string): void;
    addMove(gameId: string, move: any): void;
    updateGameResult(gameId: string, winner: string): void;
    getGames(): GameData[];
}
export declare const db: DatabaseManager;
export {};
//# sourceMappingURL=db.d.ts.map