import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const Landing = () => {
  const navigate = useNavigate();
  const { user, logout, continueAsGuest } = useAuth();

  return (
    <div className="min-h-screen bg-[#383838] flex flex-col items-center justify-center px-8 relative">
      {/* Top Bar for Auth */}
      <div className="absolute top-8 right-8 flex gap-4">
        {!user ? (
          <>
            <button
              onClick={() => navigate("/login")}
              className="px-6 py-2 text-white font-semibold border border-gray-600 rounded hover:bg-gray-700 transition-colors"
            >
              Log In
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="px-6 py-2 bg-green-500 text-white font-bold rounded hover:bg-green-600 transition-colors"
            >
              Sign Up
            </button>
          </>
        ) : (
          <div className="flex items-center gap-4">
            <span className="text-gray-300">Welcome, <span className="text-white font-bold">{user.username || 'Friend'}</span></span>
            <button
              onClick={() => logout()}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Log Out
            </button>
          </div>
        )}
      </div>

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

          <div className="flex flex-col gap-4 items-center">
            {user ? (
              <button
                onClick={() => navigate("/game")}
                className="px-8 py-3 text-xl bg-green-500 hover:bg-green-700 text-white font-bold rounded shadow-lg transition-all transform hover:scale-105"
              >
                Play Online
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    navigate("/login")
                  }}
                  className="px-8 py-3 text-xl bg-green-500 hover:bg-green-700 text-white font-bold rounded shadow-lg transition-all"
                >
                  Play Online
                </button>
                <button
                  onClick={() => {
                    continueAsGuest();
                    navigate("/game");
                  }}
                  className="px-6 py-2 text-lg bg-[#262626] border border-gray-600 hover:bg-[#333333] text-white font-semibold rounded transition-all"
                >
                  Play as Guest
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
