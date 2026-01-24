import { useEffect, useState, useRef } from "react";
import { Button } from "../components/Buttons";
import { Chessboard } from "../components/Chessboard";
import { useSocket } from "../hooks/usesocket";
import { Chess } from "chess.js";


export const INIT_GAME = "INIT_GAME";
export const MOVE = "MOVE";
export const GAME_OVER = "GAME_OVER";
export const DEBUG = "DEBUG";
export const ERROR = "ERROR";


export const Game = () => {
  const socket = useSocket();
  const [chess, setChess] = useState(new Chess());
  const [board, setBoard] = useState(chess.board());
  const chessRef = useRef(chess);

  // Keep ref in sync with state
  useEffect(() => {
    chessRef.current = chess;
  }, [chess]);

  useEffect(() => {
    if (!socket) {
      return;
    }
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log("Received message:", message);
      switch (message.type) {
        case INIT_GAME:
          const newChess = new Chess();
          setChess(newChess);
          setBoard(newChess.board());
          console.log("Game Initiated");
          break;
        case MOVE:
          const move = message.payload;
          console.log("Received move from opponent:", move);
          try {
            // Use ref to get latest chess state
            const updatedChess = new Chess(chessRef.current.fen());
            const result = updatedChess.move(move);

            if (result) {
              setChess(updatedChess);
              setBoard(updatedChess.board());
              console.log("Board updated with opponent's move");
            } else {
              console.error("Invalid move received:", move);
            }
          } catch (e) {
            console.error("Error processing move:", e);
          }
          break;
        case GAME_OVER:
          console.log("Game Over");
          break;
        case DEBUG:
          break;
        case ERROR:
          break;
      }
    };
  }, [socket]);

  if (!socket) {
    return <div>Loading...</div>;
  }
  return (
    <div className="flex justify-center items-start min-h-screen pt-8">
      <div className="flex gap-12 items-start">
        <div className="flex justify-center items-center">
          <Chessboard socket={socket} board={board} />
        </div>

        <div className="bg-green-200 w-[256px] h-[512px] flex justify-center items-start p-8">
          <Button onClick={() => { socket.send(JSON.stringify({ type: INIT_GAME })) }}>Play</Button>
        </div>
      </div>
    </div>
  );
};
