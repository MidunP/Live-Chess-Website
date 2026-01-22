"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = exports.DatabaseManager = void 0;
const fs_1 = __importDefault(require("fs"));
class DatabaseManager {
    games;
    FILE_PATH = 'games.json';
    constructor() {
        this.games = new Map();
        this.loadGames();
    }
    loadGames() {
        try {
            if (fs_1.default.existsSync(this.FILE_PATH)) {
                const data = fs_1.default.readFileSync(this.FILE_PATH, 'utf-8');
                const parsed = JSON.parse(data);
                if (Array.isArray(parsed)) {
                    parsed.forEach((game) => {
                        this.games.set(game.id, game);
                    });
                }
            }
        }
        catch (e) {
            console.error("Error loading games:", e);
        }
    }
    saveGames() {
        try {
            fs_1.default.writeFileSync(this.FILE_PATH, JSON.stringify(Array.from(this.games.values()), null, 2));
        }
        catch (e) {
            console.error("Error saving games:", e);
        }
    }
    addGame(gameId) {
        this.games.set(gameId, {
            id: gameId,
            player1: "white",
            player2: "black",
            moves: [],
            startTime: Date.now()
        });
        this.saveGames();
    }
    addMove(gameId, move) {
        const game = this.games.get(gameId);
        if (game) {
            game.moves.push(move);
            this.saveGames();
        }
    }
    updateGameResult(gameId, winner) {
        const game = this.games.get(gameId);
        if (game) {
            game.winner = winner;
            this.saveGames();
        }
    }
    getGames() {
        return Array.from(this.games.values());
    }
}
exports.DatabaseManager = DatabaseManager;
exports.db = new DatabaseManager();
//# sourceMappingURL=db.js.map