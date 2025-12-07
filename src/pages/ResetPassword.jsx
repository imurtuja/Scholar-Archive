import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, ArrowLeft, Loader, CheckCircle, AlertCircle, Key } from 'lucide-react';
import usePageTitle from '../hooks/usePageTitle';

const ResetPassword = () => {
    usePageTitle('Reset Password');
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword: password })
            });

            const data = await res.json();

            if (res.ok) {
                setSuccess(true);
            } else {
                setError(data.message || 'Failed to reset password');
            }
        } catch (err) {
            setError('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="min-h-screen bg-[#0a0a14] flex items-center justify-center px-4">
                <div className="text-center">
                    <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <AlertCircle size={32} className="text-red-400" />
                    </div>
                    <h1 className="text-xl font-bold text-white mb-2">Invalid Reset Link</h1>
                    <p className="text-white/50 mb-6">This password reset link is invalid or has expired.</p>
                    <Link
                        to="/forgot-password"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors"
                    >
                        Request New Link
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a14] flex items-center justify-center px-4">
            {/* Background effects */}
            <div className="fixed inset-0 bg-gradient-to-br from-indigo-900/20 via-[#0a0a14] to-purple-900/20" />
            <div className="absolute top-[20%] left-[30%] w-[300px] h-[300px] bg-indigo-500/20 rounded-full blur-[150px]" />
            <div className="absolute bottom-[20%] right-[30%] w-[200px] h-[200px] bg-purple-500/20 rounded-full blur-[120px]" />

            <div className="relative w-full max-w-md">
                <div className="bg-[#13131f] border border-white/10 rounded-2xl p-8 shadow-2xl">
                    {!success ? (
                        <>
                            {/* Header */}
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/30">
                                    <Key size={32} className="text-white" />
                                </div>
                                <h1 className="text-2xl font-bold text-white mb-2">Reset Password</h1>
                                <p className="text-white/50 text-sm">
                                    Enter your new password below.
                                </p>
                            </div>

                            {/* Error */}
                            {error && (
                                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm flex items-center gap-3">
                                    <AlertCircle size={20} />
                                    {error}
                                </div>
                            )}

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-white/70 mb-2">New Password</label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                            <Lock size={18} className="text-white/40" />
                                        </div>
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            minLength={6}
                                            placeholder="••••••••"
                                            className="w-full h-12 pl-12 pr-4 bg-[#1a1a2e] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-white/70 mb-2">Confirm Password</label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                            <Lock size={18} className="text-white/40" />
                                        </div>
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                            minLength={6}
                                            placeholder="••••••••"
                                            className="w-full h-12 pl-12 pr-4 bg-[#1a1a2e] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-12 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <>
                                            <Loader className="animate-spin" size={20} />
                                            <span>Resetting...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Key size={18} />
                                            <span>Reset Password</span>
                                        </>
                                    )}
                                </button>
                            </form>
                        </>
                    ) : (
                        /* Success State */
                        <div className="text-center py-4">
                            <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <CheckCircle size={32} className="text-green-400" />
                            </div>
                            <h2 className="text-xl font-bold text-white mb-2">Password Reset!</h2>
                            <p className="text-white/50 text-sm mb-6">
                                Your password has been reset successfully. You can now login with your new password.
                            </p>
                            <Link
                                to="/login"
                                className="inline-flex items-center justify-center gap-2 w-full h-12 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all"
                            >
                                Go to Login
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
