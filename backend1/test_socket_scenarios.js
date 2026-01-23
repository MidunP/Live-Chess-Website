const WebSocket = require('ws');

const WS_URL = 'ws://localhost:8080';

function connect(name) {
    return new Promise((resolve) => {
        const ws = new WebSocket(WS_URL);
        ws.on('open', () => {
            console.log(`[${name}] Connected`);
            resolve(ws);
        });
        ws.on('error', (e) => console.log(`[${name}] Error:`, e.message));
    });
}

function waitForMessage(ws, type, timeoutMs = 2000) {
    return new Promise((resolve) => {
        const timeout = setTimeout(() => {
            ws.off('message', listener);
            resolve(null);
        }, timeoutMs);

        const listener = (data) => {
            const msg = JSON.parse(data);
            if (msg.type === type) {
                clearTimeout(timeout);
                ws.off('message', listener);
                resolve(msg);
            }
        };
        ws.on('message', listener);
    });
}

async function runScenarios() {
    console.log("=== Starting Socket Logic Scenarios ===");

    const p1 = await connect("P1 (White)");
    const p2 = await connect("P2 (Black)");

    // SETUP: Start Game
    p1.send(JSON.stringify({ type: 'INIT_GAME' }));
    p2.send(JSON.stringify({ type: 'INIT_GAME' }));
    await waitForMessage(p1, 'INIT_GAME');
    await waitForMessage(p2, 'INIT_GAME');
    console.log("-> Game Started");

    // SCENARIO 1: White makes a VALID move (e2 -> e4)
    console.log("\n[Test 1] White updates board: e2 -> e4 (Valid)");
    const validMove = { from: 'e2', to: 'e4' };
    p1.send(JSON.stringify({ type: 'MOVE', move: validMove }));

    const p2RecvValues = await waitForMessage(p2, 'MOVE');
    if (p2RecvValues && p2RecvValues.payload.from === 'e2' && p2RecvValues.payload.to === 'e4') {
        console.log("✅ PASS: P2 received the generic move");
    } else {
        console.log("❌ FAIL: P2 did not receive the move");
    }

    // SCENARIO 2: Black tries INVALID move (e7 -> e6 is valid, but let's try pushing a rook through pawns or something invalid logic)
    // Actually, let's try moving a pawn diagonally without capture: h7 -> g6 (Invalid)
    console.log("\n[Test 2] Black attempts invalid move: h7 -> g6 (Invalid)");
    const invalidMove = { from: 'h7', to: 'g6' };
    p2.send(JSON.stringify({ type: 'MOVE', move: invalidMove }));

    const p1RecvInvalid = await waitForMessage(p1, 'MOVE', 1000);
    if (p1RecvInvalid === null) {
        console.log("✅ PASS: P1 received nothing (Server rejected invalid move)");
    } else {
        console.log("❌ FAIL: Server broadcasted an invalid move!");
    }

    // SCENARIO 3: White tries to move out of turn (It is Black's turn now)
    console.log("\n[Test 3] White tries to move during Black's turn");
    const whiteTurnMove = { from: 'd2', to: 'd4' };
    p1.send(JSON.stringify({ type: 'MOVE', move: whiteTurnMove }));

    const p2RecvWrongTurn = await waitForMessage(p2, 'MOVE', 1000);
    if (p2RecvWrongTurn === null) {
        console.log("✅ PASS: P2 received nothing (Server enforced turn order)");
    } else {
        console.log("❌ FAIL: Server allowed move out of turn!");
    }

    // SCENARIO 4: Black makes a VALID move (e7 -> e5)
    console.log("\n[Test 4] Black moves: e7 -> e5 (Valid)");
    const blackValidMove = { from: 'e7', to: 'e5' };
    p2.send(JSON.stringify({ type: 'MOVE', move: blackValidMove }));

    const p1RecvValid = await waitForMessage(p1, 'MOVE');
    if (p1RecvValid) {
        console.log("✅ PASS: P1 received Black's move");
    } else {
        console.log("❌ FAIL: P1 did not receive Black's move");
    }

    console.log("\n=== specific tests complete ===");
    p1.close();
    p2.close();
}

runScenarios();
