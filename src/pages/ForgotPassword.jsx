import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader, CheckCircle, AlertCircle, Send } from 'lucide-react';
import usePageTitle from '../hooks/usePageTitle';

const ForgotPassword = () => {
    usePageTitle('Forgot Password');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await res.json();

            if (res.ok) {
                setSuccess(true);
            } else {
                setError(data.message || 'Something went wrong');
            }
        } catch (err) {
            setError('Failed to send reset request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a14] flex items-center justify-center px-4">
            {/* Background effects */}
            <div className="fixed inset-0 bg-gradient-to-br from-indigo-900/20 via-[#0a0a14] to-purple-900/20" />
            <div className="absolute top-[20%] left-[30%] w-[300px] h-[300px] bg-indigo-500/20 rounded-full blur-[150px]" />
            <div className="absolute bottom-[20%] right-[30%] w-[200px] h-[200px] bg-purple-500/20 rounded-full blur-[120px]" />

            <div className="relative w-full max-w-md">
                {/* Back Link */}
                <Link
                    to="/login"
                    className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-6"
                >
                    <ArrowLeft size={18} />
                    <span className="text-sm">Back to Login</span>
                </Link>

                <div className="bg-[#13131f] border border-white/10 rounded-2xl p-8 shadow-2xl">
                    {!success ? (
                        <>
                            {/* Header */}
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/30">
                                    <Mail size={32} className="text-white" />
                                </div>
                                <h1 className="text-2xl font-bold text-white mb-2">Forgot Password?</h1>
                                <p className="text-white/50 text-sm">
                                    Enter your email address and we'll send you a link to reset your password.
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
                                    <label className="block text-sm font-medium text-white/70 mb-2">Email Address</label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                            <Mail size={18} className="text-white/40" />
                                        </div>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            placeholder="you@example.com"
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
                                            <span>Sending...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Send size={18} />
                                            <span>Send Reset Link</span>
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
                            <h2 className="text-xl font-bold text-white mb-2">Check Your Email</h2>
                            <p className="text-white/50 text-sm mb-6">
                                If an account exists for <span className="text-white font-medium">{email}</span>, you'll receive a password reset link shortly.
                            </p>

                            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 mb-6">
                                <p className="text-xs text-indigo-400 font-medium mb-1">📧 Check your inbox</p>
                                <p className="text-white/40 text-xs">
                                    Don't forget to check your spam folder if you don't see the email.
                                </p>
                            </div>

                            <Link
                                to="/login"
                                className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 text-sm font-medium"
                            >
                                <ArrowLeft size={16} />
                                Back to Login
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
