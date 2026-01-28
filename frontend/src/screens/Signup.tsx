import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Signup = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const { signup } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            await signup(email, password, username);
            navigate('/');
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="min-h-screen bg-[#383838] flex items-center justify-center px-4 py-8">
            <div className="bg-[#262626] p-6 sm:p-8 rounded-lg shadow-2xl w-full max-w-md border border-gray-700">
                <div className="flex flex-col items-center mb-6 sm:mb-8">
                    <img src="/chessboard.png" alt="Logo" className="w-14 h-14 sm:w-16 sm:h-16 mb-3 sm:mb-4" />
                    <h2 className="text-2xl sm:text-3xl font-bold text-white">Create Account</h2>
                    <p className="text-gray-400 mt-2 text-sm sm:text-base">Join the largest chess community</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                    {error && (
                        <div className="bg-red-500/20 border border-red-500 text-red-100 px-4 py-2 rounded text-sm">
                            {error}
                        </div>
                    )}
                    <div>
                        <label className="block text-gray-300 mb-2 text-sm">Username (Optional)</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-[#1a1a1a] border border-gray-700 text-white p-3 rounded focus:outline-none focus:border-green-500 transition-colors min-h-[44px]"
                            placeholder="grandmaster_midun"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-300 mb-2 text-sm">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-[#1a1a1a] border border-gray-700 text-white p-3 rounded focus:outline-none focus:border-green-500 transition-colors"
                            placeholder="you@example.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-300 mb-2 text-sm">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-[#1a1a1a] border border-gray-700 text-white p-3 rounded focus:outline-none focus:border-green-500 transition-colors"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded transition-colors text-base sm:text-lg min-h-[44px]"
                    >
                        Sign Up
                    </button>
                </form>

                <div className="mt-8 text-center text-gray-400 text-sm">
                    Already have an account?{' '}
                    <Link to="/login" className="text-green-500 hover:text-green-400 font-semibold">
                        Log In
                    </Link>
                </div>

                <div className="mt-4 text-center">
                    <Link to="/" className="text-gray-500 hover:text-gray-400 text-sm">
                        Back to Landing
                    </Link>
                </div>
            </div>
        </div>
    );
};
