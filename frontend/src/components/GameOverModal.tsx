import React from 'react';

interface GameOverModalProps {
    winner: string | null;
    reason?: string;
    isOpen: boolean;
    onClose: () => void;
    onRematch?: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({ winner, reason, isOpen, onClose, onRematch }) => {
    if (!isOpen) return null;

    const isDraw = winner === 'draw' || !winner;
    const displayWinner = winner && winner !== 'draw' ? winner.charAt(0).toUpperCase() + winner.slice(1) : 'No one';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 px-4">
            <div className="bg-[#262421] w-full max-w-[400px] rounded-xl shadow-2xl border border-gray-700 overflow-hidden transform animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="relative p-4 sm:p-6 text-center border-b border-gray-800">
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
                        {isDraw ? "It's a Draw!" : `${displayWinner} Won!`}
                    </h2>
                    <p className="text-gray-400 text-xs sm:text-sm">{reason ? reason.charAt(0).toUpperCase() + reason.slice(1) : 'Game Finished'}</p>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-8 flex flex-col items-center gap-4 sm:gap-6">
                    {/* Avatar/Icon Placeholder (Like Martin in the image) */}
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-700 rounded-full flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                        <span className="text-3xl sm:text-4xl">🏆</span>
                    </div>

                    <div className="text-center">
                        <p className="text-gray-200 font-medium text-sm sm:text-base">
                            "Great game! How about a rematch?"
                        </p>
                    </div>

                    {/* Stats Preview (Placeholder) */}
                    <div className="flex gap-8 py-2">
                        <div className="text-center">
                            <div className="text-blue-400 font-bold flex items-center gap-1 justify-center">
                                <span>!</span> 1
                            </div>
                            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Great</p>
                        </div>
                        <div className="text-center">
                            <div className="text-yellow-400 font-bold flex items-center gap-1 justify-center">
                                <span>★</span> 8
                            </div>
                            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Best</p>
                        </div>
                        <div className="text-center">
                            <div className="text-green-400 font-bold flex items-center gap-1 justify-center">
                                <span>👍</span> 3
                            </div>
                            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Excellent</p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="p-4 sm:p-6 bg-[#1f1e1b] flex flex-col gap-3">
                    <button
                        onClick={onClose}
                        className="w-full py-3 sm:py-4 bg-[#81b64c] hover:bg-[#a3d16e] text-white font-bold text-lg sm:text-xl rounded-lg shadow-[0_4px_0_rgb(69,98,41)] active:translate-y-1 active:shadow-none transition-all min-h-[44px]"
                    >
                        Game Review
                    </button>

                    <div className="flex gap-3">
                        <button
                            onClick={onRematch}
                            className="flex-1 py-3 bg-[#3c3a37] hover:bg-[#4d4b48] text-gray-200 font-bold rounded-lg transition-colors text-sm sm:text-base min-h-[44px]"
                        >
                            Rematch
                        </button>
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 bg-[#3c3a37] hover:bg-[#4d4b48] text-gray-200 font-bold rounded-lg transition-colors text-sm sm:text-base min-h-[44px]"
                        >
                            New Game
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
