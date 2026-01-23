
import { Game } from "./Game";
import { WebSocket } from "ws";
import { INIT_GAME, MOVE, GAME_OVER } from "./message";

// Mock WebSocket
class MockSocket {
    public readyState = WebSocket.OPEN;
    public sentMessages: any[] = [];

    send(data: string) {
        this.sentMessages.push(JSON.parse(data));
    }

    clear() {
        this.sentMessages = [];
    }
}

async function runTests() {
    console.log("Starting Game Logic Verification...");

    // --- TEST 1: Normal Move ---
    {
        console.log("\n--- Test 1: Normal Move (e2->e4) ---");
        const p1 = new MockSocket() as unknown as WebSocket;
        const p2 = new MockSocket() as unknown as WebSocket;
        const game = new Game("test-1", p1, p2);

        // Assert Initial Messages
        const p1Init = (p1 as any).sentMessages.find((m: any) => m.type === INIT_GAME);
        if (!p1Init) console.error("❌ P1 didn't receive INIT_GAME");

        game.makeMove(p1, { from: "e2", to: "e4" });

        // Check P2 received MOVE
        const p2Move = (p2 as any).sentMessages.find((m: any) => m.type === MOVE);
        if (p2Move && p2Move.payload.from === "e2" && p2Move.payload.to === "e4") {
            console.log("✅ PASSED: Black received move e2->e4");
        } else {
            console.log("❌ FAILED: Black did not receive correct move", JSON.stringify((p2 as any).sentMessages));
        }
    }

    // --- TEST 2: Invalid Move ---
    {
        console.log("\n--- Test 2: Invalid Move ---");
        const p1 = new MockSocket() as unknown as WebSocket;
        const p2 = new MockSocket() as unknown as WebSocket;
        const game = new Game("test-2", p1, p2);

        // Move white e2-e4
        game.makeMove(p1, { from: "e2", to: "e4" });
        (p2 as any).clear(); // Clear p2 messages to check for new ones

        // Black tries invalid move (moving white piece or invalid square)
        // e7-e5 is valid. Let's try moving white pawn a2-a3 as black
        game.makeMove(p2, { from: "a2", to: "a3" });

        if ((p2 as any).sentMessages.length === 0 && (p1 as any).sentMessages.find((m: any) => m.payload?.from === "a2") === undefined) {
            console.log("✅ PASSED: Invalid move rejected");
        } else {
            console.log("❌ FAILED: Invalid move seemingly accepted");
        }
    }

    // --- TEST 3: Promotion ---
    {
        console.log("\n--- Test 3: Promotion ---");
        const p1 = new MockSocket() as unknown as WebSocket;
        const p2 = new MockSocket() as unknown as WebSocket;
        const game = new Game("test-prom", p1, p2);

        // We can't easily set up promotion state without playing full game or mocking internal board.
        // But we can check if the code accepts the 'promotion' field without crashing.
        // We will try a move that would require promotion if it were possible, 
        // to see if "promotion" property is passed to chess.js (which might validly reject it if not promotion time).
        // A better check is verifying 'makeMove' signature is compatible.
        // If compilation passes and running this doesn't throw "undefined property" errors, we are good on plumbing.

        try {
            game.makeMove(p1, { from: "e2", to: "e4", promotion: "q" });
            console.log("✅ PASSED: makeMove accepted move with promotion field without error");
        } catch (e) {
            console.log("❌ FAILED: makeMove threw error with promotion field", e);
        }
    }

    // --- TEST 4: Fool's Mate (Game Over) ---
    {
        console.log("\n--- Test 4: Fool's Mate (Game Over) ---");
        const p1 = new MockSocket() as unknown as WebSocket;
        const p2 = new MockSocket() as unknown as WebSocket;
        const game = new Game("test-mate", p1, p2);

        // 1. f3 e5 2. g4 Qh4#
        game.makeMove(p1, { from: "f2", to: "f3" });
        game.makeMove(p2, { from: "e7", to: "e5" });
        game.makeMove(p1, { from: "g2", to: "g4" });
        game.makeMove(p2, { from: "d8", to: "h4" }); // Mate

        // Check for GAME_OVER
        const p1Over = (p1 as any).sentMessages.find((m: any) => m.type === GAME_OVER);
        const p2Over = (p2 as any).sentMessages.find((m: any) => m.type === GAME_OVER);

        if (p1Over && p2Over) {
            console.log("✅ PASSED: GAME_OVER detected for both players");
            console.log("Winner:", p1Over.payload.winner);
        } else {
            console.log("❌ FAILED: GAME_OVER not detected");
            console.log("P1 Messages:", JSON.stringify((p1 as any).sentMessages));
        }
    }

    console.log("\nAll Tests Complete.");
}

runTests().catch(e => console.error("Test Error:", e));
