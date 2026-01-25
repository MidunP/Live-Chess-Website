import { useEffect, useState, useCallback } from "react";
import { Button } from "../components/Buttons";
import { Chessboard } from "../components/Chessboard";
import { GameOverModal } from "../components/GameOverModal";
import { useSocket } from "../hooks/usesocket";
import { Chess } from "chess.js";
import { v4 as uuidv4 } from 'uuid';

export const INIT_GAME = "INIT_GAME";
export const MOVE = "MOVE";
export const GAME_OVER = "GAME_OVER";
export const DEBUG = "DEBUG";
export const ERROR = "ERROR";

// Get or create a persistent userId for this browser session
const getUserId = () => {
  let id = sessionStorage.getItem('chess_user_id');
  if (!id) {
    id = uuidv4();
    sessionStorage.setItem('chess_user_id', id);
  }
  return id;
};

export const Game = () => {
  const socket = useSocket();
  const [chess] = useState(new Chess());
  const [board, setBoard] = useState(chess.board());
  const [userId] = useState(getUserId());
  const [playerColor, setPlayerColor] = useState<'white' | 'black' | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);

  useEffect(() => {
    console.log("Current User ID:", userId);
  }, [userId]);

  // Handle local move with optimistic update
  const handleMove = useCallback((move: { from: string; to: string }) => {
    // Check if it's our turn
    const currentTurn = chess.turn(); // 'w' or 'b'
    const ourTurn = (currentTurn === 'w' && playerColor === 'white') ||
      (currentTurn === 'b' && playerColor === 'black');

    if (!ourTurn) {
      console.log("Not your turn!", { currentTurn, playerColor });
      return;
    }

    // Optimistic update - apply move locally first for immediate feedback
    try {
      const result = chess.move(move);
      if (result) {
        setBoard(chess.board());  // Update display immediately

        // Send to server
        socket?.send(JSON.stringify({
          type: MOVE,
          userId,
          payload: move
        }));
        console.log("Move sent:", move);
      }
    } catch (e) {
      console.error("Invalid move:", e);
    }
  }, [chess, playerColor, socket, userId]);

  useEffect(() => {
    if (!socket) return;

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log("Received message:", message);

      switch (message.type) {
        case INIT_GAME:
          // Determine our color based on the game assignment
          const { whitePlayerId, blackPlayerId, fen } = message.payload;
          if (whitePlayerId === userId) {
            setPlayerColor('white');
            console.log("You are playing WHITE");
          } else if (blackPlayerId === userId) {
            setPlayerColor('black');
            console.log("You are playing BLACK");
          }

          if (fen) {
            chess.load(fen);
          } else {
            chess.reset();
          }
          setBoard(chess.board());
          setGameStarted(true);
          console.log("Game Initiated", message.payload);
          break;

        case MOVE:
          const { move, fen: newFen } = message.payload;
          console.log("Received move from server:", move);

          // Sync with server's authoritative state
          if (newFen) {
            chess.load(newFen);
          } else if (move) {
            try {
              chess.move(move);
            } catch (e) {
              console.error("Error applying move:", e);
            }
          }
          setBoard(chess.board());
          break;

        case GAME_OVER:
          console.log("Game Over", message.payload);
          setWinner(message.payload.winner);
          setShowGameOverModal(true);
          break;
      }
    };
  }, [socket, chess, userId]);

  if (!socket) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="text-white text-xl animate-pulse">Connecting to server...</div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-start min-h-screen pt-8" style={{ backgroundColor: '#2b2b2b' }}>
      <div className="flex gap-12 items-start">
        <div className="flex flex-col items-center gap-4">
          {playerColor && (
            <div className={`px-4 py-2 rounded-full text-white font-bold ${playerColor === 'white' ? 'bg-gray-200 text-gray-900' : 'bg-gray-800 border border-gray-600'
              }`}>
              You are playing {playerColor.toUpperCase()}
            </div>
          )}
          <Chessboard
            board={board}
            chess={chess}
            playerColor={playerColor}
            onMove={handleMove}
          />
          {!gameStarted && chess.turn() === 'w' && (
            <div className="text-gray-400 text-sm">White to move</div>
          )}
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm w-[256px] h-[640px] flex flex-col justify-start items-center p-8 rounded-xl border border-gray-700">
          {!gameStarted ? (
            <>
              <Button onClick={() => {
                socket.send(JSON.stringify({
                  type: INIT_GAME,
                  userId
                }))
              }}>Play</Button>
              <p className="text-gray-400 text-center mt-4 text-sm">
                Click to find an opponent
              </p>
            </>
          ) : (
            <div className="text-center">
              <p className="text-white font-semibold mb-2">Game in Progress</p>
              <p className="text-gray-400 text-sm">
                {chess.turn() === 'w' ? "White's turn" : "Black's turn"}
              </p>
            </div>
          )}
        </div>
      </div>

      <GameOverModal
        isOpen={showGameOverModal}
        winner={winner}
        onClose={() => setShowGameOverModal(false)}
        onRematch={() => {
          setShowGameOverModal(false);
          socket?.send(JSON.stringify({ type: INIT_GAME, userId }));
        }}
      />
    </div>
  );
};
