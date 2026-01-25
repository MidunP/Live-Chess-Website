export declare class Game {
    player1UserId: string;
    player2UserId: string;
    gameId: string;
    player1Name: string;
    player2Name: string;
    ended: boolean;
    private board;
    constructor(gameId: string, player1UserId: string, player2UserId: string, player1Name?: string, player2Name?: string);
    getFen(): string;
    broadcast(message: any): void;
    makeMove(userId: string, move: {
        from: string;
        to: string;
        promotion?: string;
    }): void;
}
//# sourceMappingURL=Game.d.ts.map