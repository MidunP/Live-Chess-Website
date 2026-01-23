const WebSocket = require('ws');

console.log('🧪 Testing Chess Backend Connection...\n');

// Test 1: Connect to server
const ws = new WebSocket('ws://localhost:8080');

ws.on('open', () => {
    console.log('✅ Connected to chess server on ws://localhost:8080');

    // Test 2: Send INIT_GAME message
    console.log('📤 Sending INIT_GAME message...');
    ws.send(JSON.stringify({ type: 'INIT_GAME' }));
});

ws.on('message', (data) => {
    const message = JSON.parse(data.toString());
    console.log('📥 Received message:', message);

    if (message.type === 'INIT_GAME') {
        console.log('✅ INIT_GAME response received');
        console.log('   Player color:', message.payload?.color);

        // Close after successful test
        setTimeout(() => {
            console.log('\n✅ Backend is working correctly!');
            ws.close();
            process.exit(0);
        }, 1000);
    }
});

ws.on('error', (error) => {
    console.error('❌ Connection error:', error.message);
    process.exit(1);
});

ws.on('close', () => {
    console.log('🔌 Connection closed');
});

// Timeout after 5 seconds
setTimeout(() => {
    console.error('❌ Test timeout - server may not be running');
    process.exit(1);
}, 5000);
