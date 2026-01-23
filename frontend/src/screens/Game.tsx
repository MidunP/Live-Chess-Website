import { useEffect, useState } from "react";
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

  useEffect(() => {
    if (!socket) {
      return;
    }
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log(message);
      switch (message.type) {
        case INIT_GAME:
          const newChess = new Chess();
          setChess(newChess);
          setBoard(newChess.board());
          console.log("Game Initiated");
          break;
        case MOVE:
          const move = message.payload;
          chess.move(move);
          setBoard(chess.board());
          break;
        case GAME_OVER:
          break;
        case DEBUG:
          break;
        case ERROR:
          break;
      }
    };
  }, [socket, chess]);

  if (!socket) {
    return <div>Loading...</div>;
  }
  return (
    <div className="justify-center flex">
      <div className="pt-8 max-w-screen-lg w-full">
        <div className="grid grid-cols-6 gap-4 w-full">
          <div className="col-span-4 bg-red-200 w-full">
            <Chessboard board={board} />
          </div>

          <div className="col-span-2 bg-green-200 w-full">
            <Button onClick={() => { socket.send(JSON.stringify({ type: INIT_GAME })) }}>Play</Button>
          </div>
        </div>
      </div>
    </div>
  );
};
