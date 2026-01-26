import { useRef, useEffect } from 'react';

interface Move {
    from: string;
    to: string;
}

export const MovesTable = ({ moves }: { moves: Move[] }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [moves]);

    return (
        <div className="w-full flex flex-col h-full">
            <h2 className="text-white font-bold text-center mb-4 text-lg">Moves Table</h2>
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar" ref={scrollRef}>
                <table className="w-full text-sm text-left text-gray-300">
                    <thead className="text-xs uppercase bg-gray-700/50 text-gray-400 sticky top-0">
                        <tr>
                            <th className="px-4 py-2 text-center border-r border-gray-600">From</th>
                            <th className="px-4 py-2 text-center">To</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700/50">
                        {moves.map((move, index) => (
                            <tr
                                key={index}
                                className={`${index % 2 === 0 ? 'bg-gray-800/30' : 'bg-gray-800/10'} hover:bg-gray-700/30 transition-colors`}
                            >
                                <td className="px-4 py-3 text-center font-mono border-r border-gray-700/50">{move.from}</td>
                                <td className="px-4 py-3 text-center font-mono">{move.to}</td>
                            </tr>
                        ))}
                        {moves.length === 0 && (
                            <tr>
                                <td colSpan={2} className="px-4 py-8 text-center text-gray-500 italic">
                                    No moves yet
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
