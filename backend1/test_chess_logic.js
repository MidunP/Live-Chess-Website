const { Chess } = require('chess.js');

const chess = new Chess();
console.log("Initial position");

try {
    const move = { from: 'e2', to: 'e4', promotion: 'q' };
    console.log("Attempting move:", move);
    const result = chess.move(move);
    if (result) {
        console.log("Move successful:", result);
    } else {
        console.log("Move failed (returned null)");
    }
} catch (e) {
    console.log("Move threw error:", e.message);
}
