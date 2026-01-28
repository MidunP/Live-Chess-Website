export const Button = ({ onClick, children, disabled, className }: { onClick: () => void, children: React.ReactNode, disabled?: boolean, className?: string }) => {
    return (
        <button
            disabled={disabled}
            onClick={onClick}
            className={`px-8 py-4 text-2xl font-bold rounded transition-all w-full
                ${disabled
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed border border-white/5'
                    : 'bg-green-500 hover:bg-green-600 text-white shadow-[0_0_20px_rgba(34,197,94,0.3)] active:scale-95'} ${className || ''}`}
        >
            {children}
        </button>
    );
};
