"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = exports.DatabaseManager = void 0;
const fs = __importStar(require("fs"));
class DatabaseManager {
    games;
    FILE_PATH = 'games.json';
    constructor() {
        this.games = new Map();
        this.loadGames();
    }
    loadGames() {
        try {
            if (fs.existsSync(this.FILE_PATH)) {
                const data = fs.readFileSync(this.FILE_PATH, 'utf-8');
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
            fs.writeFileSync(this.FILE_PATH, JSON.stringify(Array.from(this.games.values()), null, 2));
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