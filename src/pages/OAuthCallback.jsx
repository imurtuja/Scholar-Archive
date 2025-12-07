import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader, CheckCircle, GraduationCap } from 'lucide-react';

const OAuthCallback = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { setAuth } = useAuth();
    const [status, setStatus] = useState('loading'); // loading, success, error
    const [message, setMessage] = useState('Signing you in...');

    useEffect(() => {
        const handleCallback = async () => {
            const token = searchParams.get('token');
            const redirect = searchParams.get('redirect') || '/dashboard';

            if (!token) {
                setStatus('error');
                setMessage('Authentication failed');
                setTimeout(() => navigate('/login?error=no_token'), 1500);
                return;
            }

            try {
                // Fetch user profile with the token
                const res = await fetch('/api/auth/profile', {
                    headers: {
                        'x-auth-token': token
                    }
                });

                if (!res.ok) {
                    throw new Error('Failed to get user profile');
                }

                const data = await res.json();

                // Set auth state
                setAuth(token, data);

                // Show success briefly
                setStatus('success');
                setMessage('Welcome back!');

                // Navigate to dashboard after short delay for smooth transition
                setTimeout(() => navigate(redirect), 500);
            } catch (err) {
                console.error('OAuth callback error:', err);
                setStatus('error');
                setMessage('Something went wrong');
                setTimeout(() => navigate('/login?error=callback_failed'), 1500);
            }
        };

        handleCallback();
    }, [searchParams, navigate, setAuth]);

    return (
        <div className="min-h-screen bg-[#0d0d1a] flex items-center justify-center">
            <div className="flex flex-col items-center gap-6 animate-fadeIn">
                {/* Logo */}
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30 mb-2">
                    <GraduationCap size={36} className="text-white" />
                </div>

                {/* Status Icon */}
                <div className="relative">
                    {status === 'loading' && (
                        <div className="w-12 h-12 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
                    )}
                    {status === 'success' && (
                        <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center animate-scaleIn">
                            <CheckCircle size={28} className="text-green-400" />
                        </div>
                    )}
                    {status === 'error' && (
                        <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                            <span className="text-red-400 text-2xl">✕</span>
                        </div>
                    )}
                </div>

                {/* Message */}
                <p className={`text-lg font-medium transition-colors ${status === 'success' ? 'text-green-400' :
                        status === 'error' ? 'text-red-400' :
                            'text-white/70'
                    }`}>
                    {message}
                </p>

                {/* Progress dots */}
                {status === 'loading' && (
                    <div className="flex gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                )}
            </div>

            {/* Add animation keyframes */}
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes scaleIn {
                    from { transform: scale(0); }
                    to { transform: scale(1); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }
                .animate-scaleIn {
                    animation: scaleIn 0.3s ease-out;
                }
            `}</style>
        </div>
    );
};

export default OAuthCallback;
