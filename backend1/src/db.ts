import fs from 'fs';

interface GameData {
    id: string;
    player1: string; // socket ID or placeholder
    player2: string;
    moves: any[];
    winner?: string;
    startTime: number;
}

export class DatabaseManager {
    private games: Map<string, GameData>;
    private FILE_PATH = 'games.json';

    constructor() {
        this.games = new Map();
        this.loadGames();
    }

    private loadGames() {
        try {
            if (fs.existsSync(this.FILE_PATH)) {
                const data = fs.readFileSync(this.FILE_PATH, 'utf-8');
                const parsed = JSON.parse(data);
                if (Array.isArray(parsed)) {
                    parsed.forEach((game: GameData) => {
                        this.games.set(game.id, game);
                    });
                }
            }
        } catch (e) {
            console.error("Error loading games:", e);
        }
    }

    private saveGames() {
        try {
            fs.writeFileSync(this.FILE_PATH, JSON.stringify(Array.from(this.games.values()), null, 2));
        } catch (e) {
            console.error("Error saving games:", e);
        }
    }

    public addGame(gameId: string) {
        this.games.set(gameId, {
            id: gameId,
            player1: "white",
            player2: "black",
            moves: [],
            startTime: Date.now()
        });
        this.saveGames();
    }

    public addMove(gameId: string, move: any) {
        const game = this.games.get(gameId);
        if (game) {
            game.moves.push(move);
            this.saveGames();
        }
    }

    public updateGameResult(gameId: string, winner: string) {
        const game = this.games.get(gameId);
        if (game) {
            game.winner = winner;
            this.saveGames();
        }
    }

    public getGames() {
        return Array.from(this.games.values());
    }
}

export const db = new DatabaseManager();
