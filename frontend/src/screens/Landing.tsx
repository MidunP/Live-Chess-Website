import { useNavigate } from "react-router-dom";

export const Landing = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#383838] flex items-center justify-center px-8">
      <div className="flex items-center gap-16 max-w-6xl">
        {/* Chessboard Section - Left Side */}
        <div className="flex-shrink-0">
          <img
            src="/chessboard.png"
            alt="Chess Board"
            className="w-[400px] h-auto"
          />
        </div>

        {/* Content Section - Right Side */}
        <div className="flex flex-col items-center text-center">
          <h1 className="text-white text-5xl font-bold mb-4 leading-tight">
            Play Chess Online<br />
            on the #2 Site (Midun's)!
          </h1>

          <p className="text-gray-300 text-base mb-8">
            Join my fanboy server<br />
            kpr's largest chess community
          </p>

          <button onClick={() => {
            navigate("/game")
          }} className="px-8 py-4 text-2xl bg-green-500 hover:bg-green-700 text-white font-bold rounded">
            Play Online
          </button>
        </div>
      </div>
    </div>
  );
};
