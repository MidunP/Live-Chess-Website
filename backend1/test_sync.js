const WebSocket = require('ws');

const URL = 'ws://localhost:8080';

async function simulate() {
    const player1Id = 'player-1-' + Math.random();
    const player2Id = 'player-2-' + Math.random();

    const ws1 = new WebSocket(URL);
    const ws2 = new WebSocket(URL);

    let gameId;

    ws1.on('open', () => {
        console.log('Player 1 connected');
        ws1.send(JSON.stringify({ type: 'INIT_GAME', userId: player1Id, isMatchmaking: true }));
    });

    ws2.on('open', () => {
        console.log('Player 2 connected');
        ws2.send(JSON.stringify({ type: 'INIT_GAME', userId: player2Id, isMatchmaking: true }));
    });

    ws1.on('message', (data) => {
        const msg = JSON.parse(data);
        console.log('Player 1 received:', msg.type);
        if (msg.type === 'INIT_GAME') {
            gameId = msg.payload.gameId;
            console.log('Match Found! GameID:', gameId);
            // Player 1 moves e2-e4
            setTimeout(() => {
                ws1.send(JSON.stringify({
                    type: 'MOVE',
                    userId: player1Id,
                    payload: { from: 'e2', to: 'e4' }
                }));
            }, 1000);
        }
        if (msg.type === 'MOVE') {
            console.log('Player 1 saw MOVE:', msg.payload.move);
        }
    });

    ws2.on('message', (data) => {
        const msg = JSON.parse(data);
        console.log('Player 2 received:', msg.type);
        if (msg.type === 'MOVE') {
            console.log('Player 2 saw MOVE sync! SUCCESS');
            process.exit(0);
        }
    });

    setTimeout(() => {
        console.log('Timeout reached. Sync failed.');
        process.exit(1);
    }, 10000);
}

simulate();
