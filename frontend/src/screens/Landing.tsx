import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const Landing = () => {
  const navigate = useNavigate();
  const { user, logout, continueAsGuest } = useAuth();

  return (
    <div className="min-h-screen bg-[#312e2b] flex flex-col items-center justify-center px-4 sm:px-8 py-8 relative">
      {/* Top Bar for Auth */}
      <div className="absolute top-4 sm:top-8 right-4 sm:right-8 flex flex-col sm:flex-row gap-2 sm:gap-4 z-10">
        {!user ? (
          <>
            <button
              onClick={() => navigate("/login")}
              className="px-4 sm:px-6 py-2 text-sm sm:text-base text-white font-semibold border border-gray-600 rounded hover:bg-gray-700 transition-colors min-h-[44px]"
            >
              Log In
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="px-4 sm:px-6 py-2 text-sm sm:text-base bg-[#81b64c] text-white font-bold rounded hover:bg-[#a3d160] transition-colors min-h-[44px]"
            >
              Sign Up
            </button>
          </>
        ) : (
          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-4">
            <span className="text-gray-300 text-sm sm:text-base">Welcome, <span className="text-white font-bold">{user.username || 'Friend'}</span></span>
            <button
              onClick={() => logout()}
              className="px-3 sm:px-4 py-2 text-sm sm:text-base text-gray-400 hover:text-white transition-colors min-h-[44px]"
            >
              Log Out
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16 max-w-6xl w-full mt-16 sm:mt-0">
        {/* Chessboard Section - Left Side */}
        <div className="flex-shrink-0 w-full max-w-[280px] sm:max-w-[350px] lg:max-w-[400px]">
          <img
            src="/chessboard.png"
            alt="Chess Board"
            className="w-full h-auto"
          />
        </div>

        {/* Content Section - Right Side */}
        <div className="flex flex-col items-center text-center max-w-2xl px-4">
          <h1 className="text-white text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4 sm:mb-6 leading-[1.2] tracking-tight">
            Play Chess Online on the <span className="text-[#81b64c]">#2 Site (Midun's)!</span>
          </h1>

          <div className="text-gray-400 text-base sm:text-lg mb-6 sm:mb-10 space-y-1">
            <p className="text-gray-100 font-semibold text-lg sm:text-xl mb-2 sm:mb-3">Ready to Get Checkmated?</p>
            <p>It may happen to anyone.</p>
            <p>Our last loss was so embarrassing…</p>
            <p className="italic text-gray-500 mt-3 sm:mt-4 border-l-2 border-[#81b64c]/30 pl-3 sm:pl-4 py-1">
              …we stopped playing and started building.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:gap-4 items-center w-full sm:w-auto">
            {user ? (
              <button
                onClick={() => navigate("/game")}
                className="w-full sm:w-auto px-8 sm:px-10 py-3 sm:py-4 text-xl sm:text-2xl bg-[#81b64c] hover:bg-[#a3d160] text-white font-extrabold rounded-xl transition-all min-h-[44px]"
              >
                Play Online
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate("/login")}
                  className="w-full sm:w-auto px-8 sm:px-10 py-3 sm:py-4 text-xl sm:text-2xl bg-[#81b64c] hover:bg-[#a3d160] text-white font-extrabold rounded-xl transition-all min-h-[44px]"
                >
                  Play Online
                </button>
                <button
                  onClick={() => {
                    continueAsGuest();
                    navigate("/game");
                  }}
                  className="w-full sm:w-auto px-6 sm:px-8 py-2 sm:py-3 text-base sm:text-lg bg-[#262626] border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white font-bold rounded-xl transition-all hover:bg-[#2a2a2a] min-h-[44px]"
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
