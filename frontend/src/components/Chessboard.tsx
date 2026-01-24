import { useState } from "react";
import type { Color, PieceSymbol, Square } from "chess.js";

const MOVE = "MOVE";

export const Chessboard = ({ board, socket }: {
    board: ({
        square: Square;
        type: PieceSymbol;
        color: Color;
    } | null)[][];
    socket: WebSocket;
}) => {
    const [from, setFrom] = useState<Square | null>(null);


    return (
        <div className="text-white-200">
            {board.map((row, i) => {
                return <div key={i} className="flex">
                    {row.map((square, j) => {
                        const squareRepresentation = (String.fromCharCode(97 + j) + "" + (8 - i)) as Square;

                        const isGreen = (i + j) % 2 === 0;
                        const isSelected = from === squareRepresentation;

                        return <div
                            key={j}
                            className={`w-16 h-16 flex justify-center items-center text-2xl font-bold ${isGreen ? 'bg-green-600' : 'bg-white'
                                } ${isSelected ? 'ring-4 ring-yellow-400' : ''} ${square ? 'cursor-pointer hover:opacity-80' : ''
                                }`}
                            onClick={() => {
                                if (!from) {
                                    // Only allow selecting squares with pieces
                                    if (square) {
                                        setFrom(squareRepresentation);
                                        console.log("Selected piece at:", squareRepresentation);
                                    }
                                } else {
                                    // Send move to server
                                    socket.send(JSON.stringify({
                                        type: MOVE,
                                        payload: {
                                            from,
                                            to: squareRepresentation,
                                        }
                                    }));
                                    console.log({
                                        from,
                                        to: squareRepresentation,
                                    });
                                    setFrom(null);
                                }
                            }}
                        >
                            {square ? square.type : ""}
                        </div>
                    })}
                </div>
            })}
        </div>
    );
};
