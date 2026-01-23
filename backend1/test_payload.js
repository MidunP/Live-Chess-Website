const WebSocket = require('ws');

const WS_URL = 'ws://localhost:8080';

function connect(name) {
    return new Promise((resolve) => {
        const ws = new WebSocket(WS_URL);
        ws.on('open', () => resolve(ws));
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

async function runPayloadTest() {
    console.log("Testing User Payload Format...");

    const p1 = await connect("P1");
    const p2 = await connect("P2");

    p1.send(JSON.stringify({ type: 'INIT_GAME' }));
    p2.send(JSON.stringify({ type: 'INIT_GAME' }));

    await waitForMessage(p1, 'INIT_GAME');
    await waitForMessage(p2, 'INIT_GAME');

    // TEST USER FORMAT
    const userMove = {
        type: "MOVE",
        payload: {
            from: "e2",
            to: "e4"
        }
    };

    console.log("Sending move with 'payload' key:", JSON.stringify(userMove));
    p1.send(JSON.stringify(userMove));

    const received = await waitForMessage(p2, 'MOVE');
    if (received && received.payload.from === 'e2' && received.payload.to === 'e4') {
        console.log("SUCCESS: Server accepted 'payload' key!");
    } else {
        console.log("FAILURE: Server ignored 'payload' key.");
    }

    p1.close();
    p2.close();
}

runPayloadTest();
