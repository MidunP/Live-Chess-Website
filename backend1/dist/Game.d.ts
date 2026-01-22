import { WebSocket } from "ws";
export declare class Game {
    player1: WebSocket;
    player2: WebSocket;
    gameId: string;
    private board;
    constructor(gameId: string, player1: WebSocket, player2: WebSocket);
    makeMove(socket: WebSocket, move: {
        from: string;
        to: string;
    }): void;
    private safeSend;
}
//# sourceMappingURL=Game.d.ts.map