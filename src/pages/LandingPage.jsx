import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Shield, Zap, Globe, CheckCircle, ArrowRight } from 'lucide-react';

const LandingPage = () => {
    return (
        <div className="min-h-screen flex flex-col">
            {/* Navbar is handled in App.jsx, but we might want a transparent one here if we weren't using the global one. 
                Since App.jsx renders Navbar globally, we'll rely on that. */}

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-6 overflow-hidden">
                {/* Background Blobs */}
                <div className="absolute top-20 left-[-10%] w-[50%] h-[50%] bg-purple-400/30 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-10 right-[-10%] w-[50%] h-[50%] bg-blue-400/30 rounded-full blur-[120px] animate-pulse delay-1000"></div>

                <div className="container mx-auto max-w-6xl relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/40 border border-white/50 backdrop-blur-md shadow-sm mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="text-sm font-semibold text-gray-700">v2.0 is now live</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 tracking-tight animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                        Master Your <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-600 to-blue-600">
                            Academic Journey
                        </span>
                    </h1>

                    <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                        Organize your syllabus, resources, and schedule in one beautiful, intelligent workspace. Designed for modern students.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                        <Link to="/signup" className="px-8 py-4 bg-primary text-white rounded-full font-bold text-lg shadow-lg shadow-blue-500/30 hover:bg-primary-hover hover:shadow-blue-500/50 hover:-translate-y-1 transition-all flex items-center gap-2">
                            Get Started Free <ArrowRight size={20} />
                        </Link>
                        <Link to="/login" className="px-8 py-4 bg-white/50 text-gray-700 border border-white/50 rounded-full font-bold text-lg hover:bg-white/80 transition-all backdrop-blur-sm">
                            Live Demo
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-20 px-6">
                <div className="container mx-auto max-w-6xl">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Shield,
                                title: "Secure & Private",
                                desc: "Your academic data is encrypted and isolated. Only you have access to your resources."
                            },
                            {
                                icon: Zap,
                                title: "AI Powered",
                                desc: "Upload your syllabus PDF and let our AI automatically organize your subjects and units."
                            },
                            {
                                icon: Globe,
                                title: "Access Anywhere",
                                desc: "Cloud-synced resources mean you can study from your laptop, tablet, or phone."
                            }
                        ].map((feature, i) => (
                            <div key={i} className="glass-card p-8 hover:bg-white/60 transition-all duration-300 group">
                                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <feature.icon size={28} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-3">{feature.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Preview Section */}
            <section className="py-20 px-6 relative">
                <div className="container mx-auto max-w-6xl">
                    <div className="glass-panel p-4 rounded-3xl shadow-2xl border-4 border-white/20 transform rotate-1 hover:rotate-0 transition-transform duration-500">
                        <div className="bg-gray-100 rounded-2xl overflow-hidden aspect-video relative group">
                            <div className="absolute inset-0 flex items-center justify-center bg-black/5 group-hover:bg-black/10 transition-colors">
                                <p className="text-gray-400 font-medium">App Dashboard Preview</p>
                            </div>
                            {/* Placeholder for an actual screenshot if we had one */}
                            <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-200"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-6 border-t border-white/20 bg-white/30 backdrop-blur-md mt-auto">
                <div className="container mx-auto max-w-6xl flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
                            <BookOpen size={18} />
                        </div>
                        <span className="font-bold text-gray-800">StudyArch</span>
                    </div>
                    <p className="text-gray-500 text-sm">© 2024 StudyArch. Built for students.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
