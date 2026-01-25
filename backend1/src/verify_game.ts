import { Game } from "./Game";
import { WebSocket } from "ws";
import { INIT_GAME, MOVE, GAME_OVER } from "./message";
import { socketManager } from "./SocketManager";

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

    const p1Id = "p1";
    const p2Id = "p2";

    // --- TEST 1: Normal Move ---
    {
        console.log("\n--- Test 1: Normal Move (e2->e4) ---");
        const p1 = new MockSocket() as unknown as WebSocket;
        const p2 = new MockSocket() as unknown as WebSocket;

        socketManager.addUser(p1Id, p1);
        socketManager.addUser(p2Id, p2);

        const game = new Game("test-1", p1Id, p2Id);

        // Assert Initial Messages
        const p1Init = (p1 as any).sentMessages.find((m: any) => m.type === INIT_GAME);
        if (!p1Init) console.error("❌ P1 didn't receive INIT_GAME");

        game.makeMove(p1Id, { from: "e2", to: "e4" });

        // Check P2 received MOVE
        const p1Move = (p1 as any).sentMessages.find((m: any) => m.type === MOVE);
        const p2Move = (p2 as any).sentMessages.find((m: any) => m.type === MOVE);

        if (p1Move && p2Move && p2Move.payload.move.from === "e2" && p2Move.payload.move.to === "e4") {
            console.log("✅ PASSED: Both players received move e2->e4");
        } else {
            console.log("❌ FAILED: Players did not receive correct move", JSON.stringify((p2 as any).sentMessages));
        }
    }

    // --- TEST 2: Invalid Move ---
    {
        console.log("\n--- Test 2: Invalid Move ---");
        const p1 = new MockSocket() as unknown as WebSocket;
        const p2 = new MockSocket() as unknown as WebSocket;

        socketManager.addUser(p1Id, p1);
        socketManager.addUser(p2Id, p2);

        const game = new Game("test-2", p1Id, p2Id);

        // Move white e2-e4
        game.makeMove(p1Id, { from: "e2", to: "e4" });
        (p2 as any).clear(); // Clear p2 messages to check for new ones

        // Black tries invalid move (moving white piece or invalid square)
        // e7-e5 is valid. Let's try moving white pawn a2-a3 as black
        game.makeMove(p2Id, { from: "a2", to: "a3" });

        if ((p2 as any).sentMessages.length === 0) {
            console.log("✅ PASSED: Invalid move rejected");
        } else {
            console.log("❌ FAILED: Invalid move seemingly accepted", JSON.stringify((p2 as any).sentMessages));
        }
    }

    // --- TEST 4: Fool's Mate (Game Over) ---
    {
        console.log("\n--- Test 4: Fool's Mate (Game Over) ---");
        const p1 = new MockSocket() as unknown as WebSocket;
        const p2 = new MockSocket() as unknown as WebSocket;

        socketManager.addUser(p1Id, p1);
        socketManager.addUser(p2Id, p2);

        const game = new Game("test-mate", p1Id, p2Id);

        // 1. f3 e5 2. g4 Qh4#
        game.makeMove(p1Id, { from: "f2", to: "f3" });
        game.makeMove(p2Id, { from: "e7", to: "e5" });
        game.makeMove(p1Id, { from: "g2", to: "g4" });
        game.makeMove(p2Id, { from: "d8", to: "h4" }); // Mate

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
