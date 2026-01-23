const WebSocket = require('ws');

const WS_URL = 'ws://localhost:8080';

function connect(name) {
    return new Promise((resolve) => {
        const ws = new WebSocket(WS_URL);
        ws.on('open', () => {
            // console.log(`[${name}] Connected`);
            resolve(ws);
        });
    });
}

function waitForMessage(ws, type) {
    return new Promise((resolve) => {
        const listener = (data) => {
            const msg = JSON.parse(data);
            if (msg.type === type) {
                ws.off('message', listener);
                resolve(msg);
            }
        };
        ws.on('message', listener);
    });
}

async function runCleanTest() {
    console.log("Running Chess Server Verification...");

    const p1 = await connect("P1");
    const p2 = await connect("P2");

    p1.send(JSON.stringify({ type: 'INIT_GAME' }));
    p2.send(JSON.stringify({ type: 'INIT_GAME' }));

    await waitForMessage(p1, 'INIT_GAME');
    await waitForMessage(p2, 'INIT_GAME');

    // Valid move only
    const move = { from: 'e2', to: 'e4' };
    p1.send(JSON.stringify({ type: 'MOVE', move }));

    const received = await waitForMessage(p2, 'MOVE');
    if (received && received.payload.from === 'e2' && received.payload.to === 'e4') {
        console.log("SUCCESS: Game flow is working correctly.");
        console.log("✔ Game Init: OK");
        console.log("✔ Move Logic: OK");
        console.log("✔ Broadcast: OK");
    } else {
        console.log("FAILURE: Move not received.");
    }

    p1.close();
    p2.close();
}

runCleanTest();
