import { useState, useRef } from "react";
import type { Color, PieceSymbol, Square } from "chess.js";
import { Chess } from "chess.js";

interface ChessboardProps {
    board: ({
        square: Square;
        type: PieceSymbol;
        color: Color;
    } | null)[][];
    chess: Chess;
    playerColor: 'white' | 'black' | null;
    onMove: (move: { from: string; to: string; promotion?: string }) => void;
}

export const Chessboard = ({ board, chess, playerColor, onMove }: ChessboardProps) => {
    const [from, setFrom] = useState<Square | null>(null);
    const [legalMoves, setLegalMoves] = useState<string[]>([]);
    const [promotionMove, setPromotionMove] = useState<{ from: Square; to: Square } | null>(null);
    const dragImageRef = useRef<HTMLDivElement>(null);

    // Check if move is a promotion
    const isPromotion = (from: Square, to: Square): boolean => {
        const piece = chess.get(from);
        if (!piece || piece.type !== 'p') return false;
        if (piece.color === 'w' && to[1] === '8') return true;
        if (piece.color === 'b' && to[1] === '1') return true;
        return false;
    };

    // Check if player can move this piece
    const canMovePiece = (pieceColor: Color): boolean => {
        if (!playerColor) return false;
        const currentTurn = chess.turn();
        const isOurPiece = (pieceColor === 'w' && playerColor === 'white') ||
            (pieceColor === 'b' && playerColor === 'black');
        const isOurTurn = (currentTurn === 'w' && playerColor === 'white') ||
            (currentTurn === 'b' && playerColor === 'black');
        return isOurPiece && isOurTurn;
    };

    const handleSquareClick = (square: Square, piece: { type: PieceSymbol; color: Color } | null) => {
        if (!from) {
            if (piece && canMovePiece(piece.color)) {
                setFrom(square);
                const moves = chess.moves({ square, verbose: true });
                setLegalMoves(moves.map(m => m.to));
            }
        } else {
            if (from === square) {
                setFrom(null);
                setLegalMoves([]);
                return;
            }

            if (legalMoves.includes(square)) {
                if (isPromotion(from, square)) {
                    setPromotionMove({ from, to: square });
                } else {
                    onMove({ from, to: square });
                    setFrom(null);
                    setLegalMoves([]);
                }
            } else {
                if (piece && canMovePiece(piece.color)) {
                    setFrom(square);
                    const moves = chess.moves({ square, verbose: true });
                    setLegalMoves(moves.map(m => m.to));
                } else {
                    setFrom(null);
                    setLegalMoves([]);
                }
            }
        }
    };

    const handleDragStart = (e: React.DragEvent, square: Square, piece: { type: PieceSymbol; color: Color } | null) => {
        if (!piece || !canMovePiece(piece.color)) {
            e.preventDefault();
            return;
        }

        e.dataTransfer.setData('text/plain', square);
        e.dataTransfer.effectAllowed = 'move';

        // Create custom drag image using the piece image
        const dragImage = document.createElement('img');
        dragImage.src = `/${piece.color === "b" ? piece.type : `${piece.type.toUpperCase()} copy`}.png`;
        dragImage.style.cssText = `
            position: absolute;
            left: -1000px;
            width: 60px;
            height: 60px;
            pointer-events: none;
            z-index: 1000;
        `;
        document.body.appendChild(dragImage);
        e.dataTransfer.setDragImage(dragImage, 30, 30);
        setTimeout(() => document.body.removeChild(dragImage), 0);

        setFrom(square);
        const moves = chess.moves({ square, verbose: true });
        setLegalMoves(moves.map(m => m.to));
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDragEnd = () => {
    };

    const handleDrop = (e: React.DragEvent, toSquare: Square) => {
        e.preventDefault();
        const fromSquare = e.dataTransfer.getData('text/plain') as Square;

        if (fromSquare && fromSquare !== toSquare && legalMoves.includes(toSquare)) {
            if (isPromotion(fromSquare, toSquare)) {
                setPromotionMove({ from: fromSquare, to: toSquare });
            } else {
                onMove({ from: fromSquare, to: toSquare });
            }
        }

        setFrom(null);
        setLegalMoves([]);
    };

    const handlePromotionSelect = (pieceType: string) => {
        if (promotionMove) {
            onMove({ from: promotionMove.from, to: promotionMove.to, promotion: pieceType });
            setPromotionMove(null);
            setFrom(null);
            setLegalMoves([]);
        }
    };

    const displayBoard = playerColor === 'black' ? [...board].reverse().map(row => [...row].reverse()) : board;

    const promotionPieces = [
        { type: 'q', label: 'Queen' },
        { type: 'r', label: 'Rook' },
        { type: 'b', label: 'Bishop' },
        { type: 'n', label: 'Knight' }
    ];

    return (
        <div className="relative">
            {/* Promotion Overlay */}
            {promotionMove && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-sm">
                    <div className="bg-[#262626] p-6 rounded-xl shadow-2xl border border-gray-700 flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-200">
                        <h3 className="text-white text-lg font-bold">Choose Promotion</h3>
                        <div className="flex gap-4">
                            {promotionPieces.map((p) => (
                                <button
                                    key={p.type}
                                    onClick={() => handlePromotionSelect(p.type)}
                                    className="w-20 h-20 bg-[#383838] hover:bg-[#444444] rounded-lg flex items-center justify-center transition-all transform hover:scale-110 active:scale-95 border border-gray-600 shadow-lg"
                                >
                                    <img
                                        src={`/${playerColor === 'black' ? p.type : `${p.type.toUpperCase()} copy`}.png`}
                                        alt={p.label}
                                        className="w-14 h-14 object-contain"
                                    />
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => {
                                setPromotionMove(null);
                                setFrom(null);
                                setLegalMoves([]);
                            }}
                            className="text-gray-400 hover:text-white text-sm font-medium transition-colors"
                        >
                            Cancel Move
                        </button>
                    </div>
                </div>
            )}

            <div ref={dragImageRef} className="absolute -left-[9999px]" />

            <div className={`shadow-2xl rounded-sm overflow-hidden border-2 border-gray-800 ${promotionMove ? 'blur-[2px]' : ''}`}>
                {displayBoard.map((row, i) => {
                    const actualRow = playerColor === 'black' ? 7 - i : i;
                    return (
                        <div key={i} className="flex">
                            {row.map((_, j) => {
                                const actualCol = playerColor === 'black' ? 7 - j : j;
                                const squareRepresentation = (String.fromCharCode(97 + actualCol) + "" + (8 - actualRow)) as Square;

                                const isDark = (actualRow + actualCol) % 2 !== 0;
                                const isSelected = from === squareRepresentation;
                                const isLegalMove = legalMoves.includes(squareRepresentation);

                                const isCheck = chess.isCheck();
                                let isKingInCheck = false;
                                if (isCheck) {
                                    const turn = chess.turn();
                                    const pieceAtSquare = board[actualRow][actualCol];
                                    if (pieceAtSquare && pieceAtSquare.type === 'k' && pieceAtSquare.color === turn) {
                                        isKingInCheck = true;
                                    }
                                }

                                const piece = board[actualRow][actualCol];
                                const canDrag = !!piece && canMovePiece(piece.color);

                                return (
                                    <div
                                        key={j}
                                        className={`w-[80px] h-[80px] flex justify-center items-center relative text-2xl font-bold 
                                            ${isDark ? 'bg-[#769656]' : 'bg-[#eeeed2]'} 
                                            ${isSelected ? 'bg-yellow-200 opacity-90' : ''} 
                                            ${isKingInCheck ? 'bg-red-500 ring-4 ring-red-600 ring-inset shadow-[0_0_20px_rgba(239,68,68,0.5)] z-10' : ''} 
                                            ${canDrag ? 'cursor-grab active:cursor-grabbing' : 'text-black'}`}
                                        draggable={canDrag}
                                        onDragStart={(e) => handleDragStart(e, squareRepresentation, piece)}
                                        onDragOver={handleDragOver}
                                        onDragEnd={handleDragEnd}
                                        onDrop={(e) => handleDrop(e, squareRepresentation)}
                                        onClick={() => handleSquareClick(squareRepresentation, piece)}
                                    >
                                        {piece ? (
                                            <img
                                                className="w-14 h-14 object-contain select-none transition-transform active:scale-95 pointer-events-none"
                                                src={`/${piece.color === "b" ? piece.type : `${piece.type.toUpperCase()} copy`}.png`}
                                                alt={`${piece.color}${piece.type}`}
                                                style={{
                                                    filter: piece.color === 'w'
                                                        ? 'drop-shadow(0px 0px 1px black) drop-shadow(0px 0px 1px black)'
                                                        : 'drop-shadow(0px 1px 2px rgba(0,0,0,0.5))'
                                                }}
                                            />
                                        ) : ""}

                                        {isLegalMove && (
                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                <div className={`rounded-full ${piece ? 'w-16 h-16 border-4 border-black opacity-10' : 'w-4 h-4 bg-black opacity-10'
                                                    }`} />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
