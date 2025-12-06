import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Loader, ArrowRight, ArrowLeft, GraduationCap, Sparkles, CheckCircle } from 'lucide-react';
import usePageTitle from '../hooks/usePageTitle';

const Login = () => {
    usePageTitle('Sign In');
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { setAuth } = useAuth();

    // Get the redirect URL from query params (if coming from a protected route)
    const redirectUrl = searchParams.get('redirect') || '/dashboard';

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || 'Login failed');
            }
            setAuth(data.token, data.user);
            // Navigate to the redirect URL (shared link or dashboard)
            navigate(redirectUrl);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const benefits = [
        'Organize all your study materials',
        'Share resources with classmates',
        'Track exam schedules easily',
        'Access anywhere, anytime'
    ];

    return (
        <div className="min-h-screen flex flex-col">
            {/* Minimal Back Navigation */}
            <Link
                to="/"
                className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all backdrop-blur-sm"
            >
                <ArrowLeft size={16} />
                <span className="text-sm font-medium">Back to Home</span>
            </Link>

            {/* Main Content */}
            <div className="flex-1 flex">
                {/* Left Panel - Branding */}
                <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#0a0a14]">
                    {/* Full Background Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-purple-900/30 to-[#0a0a14]"></div>
                    <div className="absolute top-[20%] left-[20%] w-[400px] h-[400px] bg-indigo-500/30 rounded-full blur-[150px]"></div>
                    <div className="absolute bottom-[20%] right-[20%] w-[300px] h-[300px] bg-purple-500/30 rounded-full blur-[120px]"></div>

                    {/* Grid Pattern */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:60px_60px]"></div>

                    {/* Content */}
                    <div className="relative z-10 flex flex-col justify-center px-16 py-12">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-3 mb-12">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                                <GraduationCap size={28} className="text-white" />
                            </div>
                            <span className="text-2xl font-bold text-white">ScholarArchive</span>
                        </Link>

                        {/* Heading */}
                        <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
                            Welcome back to your<br />
                            <span className="text-gradient">Academic Hub</span>
                        </h1>

                        <p className="text-lg text-white/50 mb-10 max-w-md">
                            Continue where you left off. Your study materials are waiting for you.
                        </p>

                        {/* Benefits */}
                        <div className="space-y-4">
                            {benefits.map((benefit, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                                        <CheckCircle size={14} className="text-indigo-400" />
                                    </div>
                                    <span className="text-white/70">{benefit}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Panel - Form */}
                <div className="flex-1 flex items-center justify-center px-6 py-12 bg-[#0d0d1a]">
                    <div className="w-full max-w-md">
                        {/* Mobile Logo */}
                        <div className="lg:hidden flex justify-center mb-8">
                            <Link to="/" className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                                    <GraduationCap size={28} className="text-white" />
                                </div>
                                <span className="text-2xl font-bold text-white">ScholarArchive</span>
                            </Link>
                        </div>

                        {/* Form Card */}
                        <div className="bg-[#13131f] border border-white/10 rounded-2xl p-8 md:p-10 shadow-2xl">
                            {/* Header */}
                            <div className="text-center mb-8">
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-4">
                                    <Sparkles size={14} className="text-indigo-400" />
                                    <span className="text-xs font-medium text-indigo-300">Secure Login</span>
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-2">Sign in to your account</h2>
                                <p className="text-white/50 text-sm">Enter your credentials to continue</p>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse flex-shrink-0"></div>
                                    {error}
                                </div>
                            )}

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-white/70 mb-2">Email Address</label>
                                    <div className="relative flex items-center">
                                        <div className="absolute left-4 flex items-center pointer-events-none">
                                            <Mail size={18} className="text-white/40" />
                                        </div>
                                        <input
                                            type="email"
                                            name="email"
                                            required
                                            className="w-full h-12 pl-12 pr-4 bg-[#1a1a2e] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                            placeholder="you@example.com"
                                            value={formData.email}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-white/70 mb-2">Password</label>
                                    <div className="relative flex items-center">
                                        <div className="absolute left-4 flex items-center pointer-events-none">
                                            <Lock size={18} className="text-white/40" />
                                        </div>
                                        <input
                                            type="password"
                                            name="password"
                                            required
                                            className="w-full h-12 pl-12 pr-4 bg-[#1a1a2e] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                            placeholder="••••••••"
                                            value={formData.password}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-12 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 mt-6"
                                >
                                    {loading ? (
                                        <>
                                            <Loader className="animate-spin" size={20} />
                                            <span>Signing in...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Sign In</span>
                                            <ArrowRight size={20} />
                                        </>
                                    )}
                                </button>
                            </form>

                            {/* Divider */}
                            <div className="my-8 flex items-center gap-4">
                                <div className="flex-1 h-px bg-white/10"></div>
                                <span className="text-white/30 text-sm">or</span>
                                <div className="flex-1 h-px bg-white/10"></div>
                            </div>

                            {/* Footer */}
                            <p className="text-center text-white/50">
                                Don't have an account?{' '}
                                <Link to={redirectUrl !== '/dashboard' ? `/signup?redirect=${encodeURIComponent(redirectUrl)}` : '/signup'} className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors">
                                    Create Account
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
