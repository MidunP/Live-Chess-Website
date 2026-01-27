import { useEffect, useState, useCallback } from "react";
import { Button } from "../components/Buttons";
import { Chessboard } from "../components/Chessboard";
import { GameOverModal } from "../components/GameOverModal";
import { MovesTable } from "../components/MovesTable";
import { useSocket } from "../hooks/usesocket";
import { Chess } from "chess.js";
import { useAuth } from "../context/AuthContext";

export const INIT_GAME = "INIT_GAME";
export const MOVE = "MOVE";
export const GAME_OVER = "GAME_OVER";
export const DEBUG = "DEBUG";
export const ERROR = "ERROR";
export const RESIGN = "RESIGN";

const MOVE_SOUND_URL = "https://lichess1.org/assets/sound/standard/Move.mp3";
const moveAudio = new Audio(MOVE_SOUND_URL);

const playMoveSound = () => {
  moveAudio.currentTime = 0;
  moveAudio.play().catch(e => console.error("Error playing sound:", e));
};

export const Game = () => {
  const { user } = useAuth();
  const socket = useSocket();
  const [chess] = useState(new Chess());
  const [board, setBoard] = useState(chess.board());
  const userId = user?.id;
  const [playerColor, setPlayerColor] = useState<'white' | 'black' | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [gameReason, setGameReason] = useState<string | undefined>(undefined);
  const [whitePlayerName, setWhitePlayerName] = useState<string>("White");
  const [blackPlayerName, setBlackPlayerName] = useState<string>("Black");
  const [moves, setMoves] = useState<{ from: string; to: string }[]>([]);

  // Function to add a move to the table avoiding duplicates
  const addMoveToTable = useCallback((move: { from: string; to: string }) => {
    setMoves(prev => {
      const lastMove = prev[prev.length - 1];
      if (lastMove && lastMove.from === move.from && lastMove.to === move.to) {
        return prev;
      }
      return [...prev, move];
    });
  }, []);

  // Re-sync UI with internal engine - CRITICAL BUFFIX for sync issues
  const syncBoard = useCallback(() => {
    setBoard(JSON.parse(JSON.stringify(chess.board())));
  }, [chess]);

  // Handle local move with optimistic update
  const handleMove = useCallback((move: { from: string; to: string; promotion?: string }) => {
    // Check if it's our turn
    const currentTurn = chess.turn(); // 'w' or 'b'
    const ourTurn = (currentTurn === 'w' && playerColor === 'white') ||
      (currentTurn === 'b' && playerColor === 'black');

    if (!ourTurn) {
      console.log("Not your turn!");
      return;
    }

    try {
      const result = chess.move(move);
      if (result) {
        syncBoard();  // Force React to see a new object

        // Send to server
        socket?.send(JSON.stringify({
          type: MOVE,
          userId,
          payload: {
            from: move.from,
            to: move.to,
            promotion: move.promotion || "q"
          }
        }));
        playMoveSound();
        addMoveToTable({ from: move.from, to: move.to });
      }
    } catch (e) {
      console.error("Invalid move:", e);
    }
  }, [chess, playerColor, socket, userId, syncBoard]);

  // Auto-rejoin / Session handshake - CRITICAL BUFFIX
  useEffect(() => {
    if (socket && userId) {
      console.log("[Sync] Handshaking with server...");
      socket.send(JSON.stringify({
        type: INIT_GAME,
        userId,
        username: user?.username || "Guest",
        isRejoin: true
      }));
    }
  }, [socket, userId, user?.username]);

  // Message Handler
  useEffect(() => {
    if (!socket) return;

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log("Received message:", message);

      switch (message.type) {
        case INIT_GAME:
          const { whitePlayerId, blackPlayerId, fen, whitePlayerName: p1Name, blackPlayerName: p2Name } = message.payload;
          setWhitePlayerName(p1Name || "White");
          setBlackPlayerName(p2Name || "Black");

          if (whitePlayerId === userId) {
            setPlayerColor('white');
          } else if (blackPlayerId === userId) {
            setPlayerColor('black');
          }

          if (message.payload.moves) {
            chess.reset();
            message.payload.moves.forEach((m: any) => {
              try {
                chess.move(m);
              } catch (e) {
                console.error("Error replaying move:", m, e);
              }
            });
            setMoves(message.payload.moves);
          } else {
            if (fen) {
              chess.load(fen);
            } else {
              chess.reset();
            }
            setMoves([]); // Clear moves on new game
          }
          syncBoard();
          setGameStarted(true);
          break;

        case MOVE:
          const { move: moveData, fen: newFen } = message.payload;
          try {
            if (newFen) {
              chess.load(newFen);
            } else if (moveData) {
              chess.move(moveData);
            }
            syncBoard();
            playMoveSound();
            if (moveData) {
              addMoveToTable({ from: moveData.from, to: moveData.to });
            }
          } catch (e) {
            console.error("Move sync error:", e);
          }
          break;

        case GAME_OVER:
          setWinner(message.payload.winner);
          setGameReason(message.payload.reason);
          setShowGameOverModal(true);
          break;
      }
    };
  }, [socket, chess, userId, syncBoard]);

  if (!socket) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#2b2b2b]">
        <div className="text-white text-xl animate-pulse">Connecting to server...</div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-start min-h-screen pt-8" style={{ backgroundColor: '#2b2b2b' }}>
      <div className="flex gap-12 items-start">
        <div className="flex flex-col items-center gap-4">
          <div className="w-full flex justify-between items-center bg-gray-800/80 px-4 py-2 rounded-lg border border-gray-700 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center text-gray-900 font-bold">W</div>
              <span className="text-white font-semibold">{whitePlayerName}</span>
            </div>
            <div className="text-gray-400 font-bold">VS</div>
            <div className="flex items-center gap-2">
              <span className="text-white font-semibold">{blackPlayerName}</span>
              <div className="w-8 h-8 bg-gray-700 rounded flex items-center justify-center text-white font-bold border border-gray-600">B</div>
            </div>
          </div>

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
          {gameStarted && (
            <div className="text-gray-400 text-sm mt-2">
              {chess.turn() === 'w' ? "White's turn" : "Black's turn"}
            </div>
          )}
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm w-[280px] h-[640px] flex flex-col justify-start items-center p-6 rounded-xl border border-gray-700">
          {!gameStarted ? (
            <div className="flex flex-col items-center justify-center h-full">
              <Button onClick={() => {
                socket.send(JSON.stringify({
                  type: INIT_GAME,
                  userId,
                  username: user?.username || "Guest",
                  isMatchmaking: true // BUFFIX: Explicit matchmaking only on Play button
                }))
              }}>Play</Button>
              <p className="text-gray-400 text-center mt-4 text-sm">
                Click to find an opponent
              </p>
            </div>
          ) : (
            <div className="flex flex-col h-full w-full">
              <div className="flex-1 overflow-hidden mb-4">
                <MovesTable moves={moves} />
              </div>

              <div className="pt-4 border-t border-gray-700 flex flex-col items-center">
                <p className="text-white font-semibold mb-1">Game in Progress</p>
                <p className="text-gray-400 text-xs mb-4">
                  {chess.turn() === 'w' ? "White's turn" : "Black's turn"}
                </p>

                <button
                  onClick={() => {
                    if (window.confirm("Resign this game?")) {
                      socket.send(JSON.stringify({
                        type: RESIGN,
                        userId
                      }));
                      chess.reset();
                      syncBoard();
                      setGameStarted(false);
                      setPlayerColor(null);
                      setMoves([]);
                    }
                  }}
                  className="text-red-400 hover:text-red-500 text-xs font-semibold underline"
                >
                  Resign
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <GameOverModal
        isOpen={showGameOverModal}
        winner={winner}
        reason={gameReason}
        onClose={() => setShowGameOverModal(false)}
        onRematch={() => {
          setShowGameOverModal(false);
          socket?.send(JSON.stringify({
            type: INIT_GAME,
            userId,
            isMatchmaking: true
          }));
        }}
      />
    </div>
  );
};
