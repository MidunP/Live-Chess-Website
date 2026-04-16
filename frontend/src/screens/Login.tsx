import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await login(email, password);
            navigate('/game');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#383838] flex items-center justify-center px-4">
            <div className="bg-[#262626] p-8 rounded-lg shadow-2xl w-full max-w-md border border-gray-700">
                <div className="flex flex-col items-center mb-8">
                    <img src="/chessboard.png" alt="Logo" className="w-16 h-16 mb-4" />
                    <h2 className="text-3xl font-bold text-white">Welcome Back</h2>
                    <p className="text-gray-400 mt-2">Log in to play chess with friends</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-500/20 border border-red-500 text-red-100 px-4 py-2 rounded text-sm">
                            {error}
                        </div>
                    )}
                    <div>
                        <label className="block text-gray-300 mb-2 text-sm">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-[#1a1a1a] border border-gray-700 text-white p-3 rounded focus:outline-none focus:border-green-500 transition-colors disabled:opacity-50"
                            placeholder="Enter your email"
                            required
                            disabled={isLoading}
                        />
                    </div>
                    <div>
                        <label className="block text-gray-300 mb-2 text-sm">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-[#1a1a1a] border border-gray-700 text-white p-3 rounded focus:outline-none focus:border-green-500 transition-colors disabled:opacity-50"
                            placeholder="••••••••"
                            required
                            disabled={isLoading}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-green-500 hover:bg-green-600 disabled:bg-green-800 disabled:cursor-wait text-white font-bold py-3 rounded transition-colors text-lg"
                    >
                        {isLoading ? 'Logging In... (Backend may take 50s to wake)' : 'Log In'}
                    </button>
                </form>

                <div className="mt-8 text-center text-gray-400 text-sm">
                    Don't have an account?{' '}
                    <Link to="/signup" className="text-green-500 hover:text-green-400 font-semibold">
                        Sign Up
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
