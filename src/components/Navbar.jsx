import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Menu, X, GraduationCap, LayoutDashboard, Sparkles, Search, Command } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    // Scroll-aware background effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isDashboard = window.location.pathname.startsWith('/dashboard') ||
        window.location.pathname.startsWith('/subjects') ||
        window.location.pathname.startsWith('/timetable') ||
        window.location.pathname.startsWith('/resources') ||
        window.location.pathname.startsWith('/settings') ||
        window.location.pathname.startsWith('/profile') ||
        window.location.pathname.startsWith('/my-shares') ||
        window.location.pathname.startsWith('/shared');
    const isAuthPage = window.location.pathname === '/login' || window.location.pathname === '/signup';
    const isHome = window.location.pathname === '/';

    return (
        <nav className={`fixed top-0 left-0 right-0 z-[60] h-[72px] flex items-center px-4 lg:px-6 transition-all duration-500 ${isDashboard || isScrolled
            ? 'bg-[#0a0a14]/95 backdrop-blur-xl shadow-lg shadow-black/30'
            : 'bg-transparent'
            }`}>
            <div className="w-full flex justify-between items-center container mx-auto">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 group-hover:scale-105 transition-all duration-300">
                        <img src="/logo.png" alt="ScholarArchive Logo" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent">
                        ScholarArchive
                    </span>
                </Link>

                {/* Desktop Actions */}
                <div className="hidden md:flex items-center gap-2">
                    {user ? (
                        <div className="flex items-center gap-3">
                            {/* Search Button - Show on dashboard pages */}
                            {isDashboard && (
                                <button
                                    onClick={() => {
                                        const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true });
                                        document.dispatchEvent(event);
                                    }}
                                    className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/50 hover:text-white transition-all"
                                    title="Search (Ctrl+K)"
                                >
                                    <Search size={16} />
                                    <span className="text-sm hidden lg:inline">Search...</span>
                                    <div className="hidden lg:flex items-center gap-0.5 ml-1 px-1.5 py-0.5 bg-white/5 rounded text-[10px] text-white/30">
                                        <Command size={10} />K
                                    </div>
                                </button>
                            )}
                            {/* Dashboard Link - Show on Home/Landing page */}
                            {isHome && (
                                <Link
                                    to="/dashboard"
                                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-medium text-sm shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-300"
                                >
                                    <LayoutDashboard size={18} />
                                    <span>Dashboard</span>
                                </Link>
                            )}
                            {/* User Profile */}
                            <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <span className="font-medium text-white/90 text-sm hidden lg:block">{user.name}</span>
                            </div>
                            {/* Logout Button */}
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-4 py-2.5 text-red-400 hover:text-white hover:bg-red-500/20 rounded-xl transition-all duration-300 font-medium text-sm border border-transparent hover:border-red-500/30"
                            >
                                <LogOut size={18} />
                                <span className="hidden lg:inline">Sign Out</span>
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <a href="/#features" className="px-4 py-2 font-medium text-white/60 hover:text-white transition-all rounded-lg hover:bg-white/5">Features</a>
                            <a href="/#about" className="px-4 py-2 font-medium text-white/60 hover:text-white transition-all rounded-lg hover:bg-white/5">About</a>
                            {!isAuthPage && (
                                <div className="flex items-center gap-2 ml-2">
                                    <Link to="/login" className="px-5 py-2.5 font-medium text-white/80 hover:text-white transition-colors rounded-xl hover:bg-white/5">
                                        Login
                                    </Link>
                                    <Link
                                        to="/signup"
                                        className="group relative px-6 py-2.5 font-semibold text-white rounded-xl overflow-hidden"
                                    >
                                        {/* Button background */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 group-hover:from-indigo-600 group-hover:to-purple-700 transition-all duration-300" />
                                        {/* Glow effect */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                                        {/* Button text */}
                                        <span className="relative flex items-center gap-2">
                                            <Sparkles size={16} />
                                            Get Started
                                        </span>
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className="md:hidden p-2.5 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="absolute top-[72px] left-0 right-0 bg-[#0a0a14]/98 backdrop-blur-xl border-b border-white/10 p-4 md:hidden flex flex-col gap-3 shadow-2xl">
                        {user ? (
                            <>
                                <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
                                        <User size={24} />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-white">{user.name}</p>
                                        <p className="text-xs text-white/50">{user.email}</p>
                                    </div>
                                </div>
                                {/* Mobile Search Button */}
                                {isDashboard && (
                                    <button
                                        onClick={() => {
                                            setIsMenuOpen(false);
                                            const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true });
                                            document.dispatchEvent(event);
                                        }}
                                        className="flex items-center justify-center gap-2 w-full p-3.5 bg-white/5 border border-white/10 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all"
                                    >
                                        <Search size={18} />
                                        <span>Search</span>
                                    </button>
                                )}
                                {/* Dashboard Link for Mobile */}
                                {isHome && (
                                    <Link
                                        to="/dashboard"
                                        className="flex items-center justify-center gap-2 w-full p-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <LayoutDashboard size={18} />
                                        Go to Dashboard
                                    </Link>
                                )}
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center justify-center gap-2 w-full p-3.5 text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl font-medium"
                                >
                                    <LogOut size={18} />
                                    Sign Out
                                </button>
                            </>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {!isAuthPage && (
                                    <>
                                        <Link
                                            to="/login"
                                            className="w-full p-3.5 text-center text-white/80 font-medium bg-white/5 border border-white/10 rounded-xl"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Login
                                        </Link>
                                        <Link
                                            to="/signup"
                                            className="w-full p-3.5 text-center text-white font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Get Started Free
                                        </Link>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
