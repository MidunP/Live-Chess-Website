const WebSocket = require('ws');
const fs = require('fs');

const WS_URL = 'ws://localhost:8080';
let gameId = null;

function connect() {
    return new Promise((resolve) => {
        const ws = new WebSocket(WS_URL);
        ws.on('open', () => resolve(ws));
    });
}

async function runTest() {
    console.log("Starting persistence test...");

    const p1 = await connect();
    const p2 = await connect();

    console.log("Players connected. Sending INIT_GAME...");
    p1.send(JSON.stringify({ type: 'INIT_GAME' }));
    p2.send(JSON.stringify({ type: 'INIT_GAME' }));

    // Wait for INIT_GAME handling
    await new Promise(r => setTimeout(r, 1000));

    // P1 makes a move
    const move = { from: 'e2', to: 'e4' };
    console.log("Player 1 making move:", move);
    p1.send(JSON.stringify({ type: 'MOVE', move }));

    // Wait for move execution/saving
    await new Promise(r => setTimeout(r, 1000));

    console.log("Disconnecting...");
    p1.close();
    p2.close();

    // Check games.json
    setTimeout(() => {
        if (fs.existsSync('games.json')) {
            const data = fs.readFileSync('games.json', 'utf-8');
            const games = JSON.parse(data);
            console.log("Loaded games.json. Found", games.length, "games.");
            if (games.length > 0 && games[games.length - 1].moves.length > 0) {
                console.log("SUCCESS: Game recorded with moves.");
                console.log(JSON.stringify(games[games.length - 1], null, 2));
            } else {
                console.log("FAILURE: Game found but no moves recorded?");
            }
        } else {
            console.log("FAILURE: games.json not found.");
        }
    }, 1000);
}

runTest();
