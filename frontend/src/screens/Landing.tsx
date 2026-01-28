import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const Landing = () => {
  const navigate = useNavigate();
  const { user, logout, continueAsGuest } = useAuth();

  return (
    <div className="min-h-screen bg-[#312e2b] flex flex-col items-center justify-center px-8 relative">
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
              className="px-6 py-2 bg-[#81b64c] text-white font-bold rounded hover:bg-[#a3d160] transition-colors"
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
        <div className="flex flex-col items-center text-center max-w-2xl">
          <h1 className="text-white text-5xl font-extrabold mb-6 leading-[1.2] tracking-tight">
            Play Chess Online on the <span className="text-[#81b64c]">#2 Site (Midun's)!</span>
          </h1>

          <div className="text-gray-400 text-lg mb-10 space-y-1">
            <p className="text-gray-100 font-semibold text-xl mb-3">Ready to Get Checkmated?</p>
            <p>It may happen to anyone.</p>
            <p>Our last loss was so embarrassing…</p>
            <p className="italic text-gray-500 mt-4 border-l-2 border-[#81b64c]/30 pl-4 py-1">
              …we stopped playing and started building.
            </p>
          </div>

          <div className="flex flex-col gap-4 items-center">
            {user ? (
              <button
                onClick={() => navigate("/game")}
                className="px-10 py-4 text-2xl bg-[#81b64c] hover:bg-[#a3d160] text-white font-extrabold rounded-xl transition-all"
              >
                Play Online
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate("/login")}
                  className="px-10 py-4 text-2xl bg-[#81b64c] hover:bg-[#a3d160] text-white font-extrabold rounded-xl transition-all"
                >
                  Play Online
                </button>
                <button
                  onClick={() => {
                    continueAsGuest();
                    navigate("/game");
                  }}
                  className="px-8 py-3 text-lg bg-[#262626] border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white font-bold rounded-xl transition-all hover:bg-[#2a2a2a]"
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
