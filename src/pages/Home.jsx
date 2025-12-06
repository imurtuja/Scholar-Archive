import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Calendar, FileText, Shield, Sparkles, BookOpen, Clock, Users, Share2, Upload, FolderOpen, Zap, CheckCircle, Star } from 'lucide-react';
import usePageTitle from '../hooks/usePageTitle';

const Home = () => {
    usePageTitle('Your Academic Hub');
    const { user } = useAuth();

    const highlights = [
        { icon: Zap, title: 'Free Forever', desc: 'No hidden costs' },
        { icon: Shield, title: 'Secure Storage', desc: 'Your data is safe' },
        { icon: Sparkles, title: 'Easy to Use', desc: 'Simple interface' }
    ];

    const bentoFeatures = [
        {
            id: 1,
            icon: Upload,
            title: 'Upload Resources',
            desc: 'Upload notes, syllabus, and question papers. Everything organized by subject.',
            gradient: 'from-blue-500 via-indigo-500 to-violet-500',
            size: 'large' // Takes 2 columns
        },
        {
            id: 2,
            icon: Share2,
            title: 'Share & Collaborate',
            desc: 'Share with classmates instantly.',
            gradient: 'from-purple-500 via-pink-500 to-rose-500',
            size: 'small'
        },
        {
            id: 3,
            icon: Calendar,
            title: 'Exam Timetables',
            desc: 'Never miss an exam with smart reminders.',
            gradient: 'from-amber-500 via-orange-500 to-red-500',
            size: 'small'
        },
        {
            id: 4,
            icon: FolderOpen,
            title: 'Smart Organization',
            desc: 'Access all materials sorted by year, semester, and subject with powerful search.',
            gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
            size: 'large'
        }
    ];

    return (
        <div className="min-h-screen relative overflow-hidden bg-[#0a0a14]">
            <Navbar />

            {/* Background Effects */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:80px_80px]"></div>

            {/* Animated Orbs */}
            <div className="absolute top-[5%] left-[5%] lg:left-[10%] w-[200px] lg:w-[500px] h-[200px] lg:h-[500px] bg-indigo-600/20 rounded-full blur-[100px] lg:blur-[180px] animate-pulse"></div>
            <div className="absolute top-[40%] right-[2%] lg:right-[5%] w-[150px] lg:w-[400px] h-[150px] lg:h-[400px] bg-purple-600/15 rounded-full blur-[100px] lg:blur-[150px]"></div>
            <div className="absolute bottom-[10%] left-[20%] lg:left-[30%] w-[150px] lg:w-[350px] h-[150px] lg:h-[350px] bg-blue-600/10 rounded-full blur-[80px] lg:blur-[120px]"></div>

            {/* Hero Section */}
            <section className="pt-28 lg:pt-40 pb-16 lg:pb-24 px-4 lg:px-6 relative z-10">
                <div className="max-w-5xl mx-auto text-center">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 mb-8 backdrop-blur-sm">
                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                        <span className="text-sm font-medium text-white/80">New Academic Year 2025</span>
                    </div>

                    {/* Main Heading */}
                    <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6 lg:mb-8 tracking-tight">
                        <span className="text-white">Your Personal</span>
                        <br />
                        <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                            Academic Archive
                        </span>
                    </h1>

                    {/* Subtitle */}
                    <p className="text-lg lg:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
                        Upload, organize, and share your study materials.
                        <span className="text-white/70"> Everything in one beautiful space.</span>
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                        {user ? (
                            <Link
                                to="/dashboard"
                                className="group relative px-8 py-4 rounded-2xl font-semibold text-lg inline-flex items-center justify-center gap-3 overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 group-hover:from-indigo-600 group-hover:to-purple-700 transition-all duration-300" />
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                                <span className="relative flex items-center gap-2 text-white">
                                    <Zap size={20} />
                                    Go to Dashboard
                                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </span>
                            </Link>
                        ) : (
                            <>
                                <Link
                                    to="/signup"
                                    className="group relative px-8 py-4 rounded-2xl font-semibold text-lg inline-flex items-center justify-center gap-2 overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 group-hover:from-indigo-600 group-hover:to-purple-700 transition-all duration-300" />
                                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                                    <span className="relative flex items-center gap-2 text-white">
                                        <Sparkles size={20} />
                                        Get Started Free
                                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                    </span>
                                </Link>
                                <Link
                                    to="/login"
                                    className="px-8 py-4 rounded-2xl font-semibold text-lg text-white/80 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all inline-flex items-center justify-center gap-2"
                                >
                                    Sign In
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Feature Highlights */}
                    <div className="flex flex-wrap justify-center gap-6 lg:gap-10">
                        {highlights.map((item, index) => (
                            <div key={index} className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <item.icon size={18} className="text-indigo-400" />
                                </div>
                                <div className="text-left">
                                    <div className="text-sm font-semibold text-white">{item.title}</div>
                                    <div className="text-xs text-white/40">{item.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Bento Grid Features */}
            <section id="features" className="py-24 px-4 lg:px-6 relative z-10">
                <div className="max-w-6xl mx-auto">
                    {/* Section Header */}
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
                            Everything you need to <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">excel</span>
                        </h2>
                        <p className="text-lg text-white/50 max-w-xl mx-auto">
                            Powerful features designed for students who want to stay organized.
                        </p>
                    </div>

                    {/* Bento Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                        {bentoFeatures.map((feature) => (
                            <div
                                key={feature.id}
                                className={`group relative rounded-2xl lg:rounded-3xl p-5 lg:p-8 overflow-hidden transition-all duration-500 hover:scale-[1.02] ${feature.size === 'large' ? 'lg:col-span-2' : ''
                                    }`}
                            >
                                {/* Card Background */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-[0.08]`} />
                                <div className="absolute inset-0 bg-[#0a0a14]/70 backdrop-blur-sm" />
                                <div className="absolute inset-0 border border-white/10 rounded-2xl lg:rounded-3xl group-hover:border-white/20 transition-colors" />

                                {/* Hover Glow */}
                                <div className={`absolute -inset-1 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-10 blur-2xl transition-opacity duration-500`} />

                                {/* Content */}
                                <div className="relative z-10 flex items-start gap-4 lg:block">
                                    <div className={`w-11 h-11 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0 lg:mb-6`}>
                                        <feature.icon size={20} className="text-white lg:hidden" />
                                        <feature.icon size={26} className="text-white hidden lg:block" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-base lg:text-xl font-bold text-white mb-1 lg:mb-3">{feature.title}</h3>
                                        <p className="text-sm lg:text-base text-white/50 leading-relaxed">{feature.desc}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-24 px-4 lg:px-6 relative z-10">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                            Get started in minutes
                        </h2>
                        <p className="text-lg text-white/50">Three simple steps to organize your academic life</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                        {[
                            { step: '01', title: 'Create Account', desc: 'Sign up with your college details', icon: Users },
                            { step: '02', title: 'Upload Resources', desc: 'Add your notes, papers & syllabus', icon: Upload },
                            { step: '03', title: 'Share & Access', desc: 'Collaborate with classmates', icon: Share2 }
                        ].map((item, i) => (
                            <div key={i} className="relative group">
                                <div className="relative rounded-3xl p-8 bg-gradient-to-br from-white/[0.06] to-transparent border border-white/10 hover:border-white/20 transition-all overflow-hidden">
                                    {/* Step Number */}
                                    <div className="absolute top-6 right-6 text-5xl font-bold text-white/5 group-hover:text-white/10 transition-colors">
                                        {item.step}
                                    </div>

                                    {/* Icon */}
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center mb-6">
                                        <item.icon size={22} className="text-indigo-400" />
                                    </div>

                                    <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                                    <p className="text-white/50">{item.desc}</p>
                                </div>

                                {/* Connector */}
                                {i < 2 && (
                                    <div className="hidden md:block absolute top-1/2 -right-4 lg:-right-5 w-8 lg:w-10 h-0.5 bg-gradient-to-r from-indigo-500/50 to-transparent"></div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section id="about" className="py-24 px-4 lg:px-6 relative z-10">
                <div className="max-w-4xl mx-auto">
                    <div className="relative rounded-3xl p-12 lg:p-16 overflow-hidden">
                        {/* Background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-transparent" />
                        <div className="absolute inset-0 border border-white/10 rounded-3xl" />

                        {/* Glow */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-indigo-500/30 rounded-full blur-[100px]"></div>

                        {/* Content */}
                        <div className="relative z-10 text-center">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-6">
                                <Sparkles size={16} className="text-indigo-400" />
                                <span className="text-sm text-white/70">100% Free to Use</span>
                            </div>

                            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                                Ready to organize your studies?
                            </h2>
                            <p className="text-lg text-white/50 mb-8 max-w-xl mx-auto">
                                Start using ScholarArchive today and take control of your academic materials.
                            </p>

                            {user ? (
                                <Link
                                    to="/dashboard"
                                    className="group relative inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold text-lg overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600" />
                                    <span className="relative text-white flex items-center gap-2">
                                        Open Dashboard
                                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                    </span>
                                </Link>
                            ) : (
                                <Link
                                    to="/signup"
                                    className="group relative inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold text-lg overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600" />
                                    <span className="relative text-white flex items-center gap-2">
                                        Create Free Account
                                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                    </span>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 px-4 lg:px-6 border-t border-white/5 relative z-10">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-white/40 text-sm">
                        © 2025 ScholarArchive. All rights reserved.
                    </div>
                    <div className="flex gap-6 text-white/40 text-sm">
                        <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                        <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
                        <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;
