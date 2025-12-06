import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { FileText, ArrowLeft } from 'lucide-react';
import usePageTitle from '../hooks/usePageTitle';

const Terms = () => {
    usePageTitle('Terms of Service');
    return (
        <div className="min-h-screen bg-[#0a0a14]">
            <Navbar />

            {/* Background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:100px_100px]"></div>
            <div className="absolute top-[10%] right-[10%] w-[300px] h-[300px] bg-purple-600/10 rounded-full blur-[150px]"></div>

            <div className="relative z-10 pt-24 pb-16 px-4 lg:px-6">
                <div className="max-w-3xl mx-auto">
                    {/* Back Link */}
                    <Link to="/" className="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm mb-6 transition-colors">
                        <ArrowLeft size={16} /> Back to Home
                    </Link>

                    {/* Header */}
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                            <FileText size={24} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-bold text-white">Terms of Service</h1>
                            <p className="text-white/50 text-sm">Last updated: December 2024</p>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="bg-[#13131f] border border-white/10 rounded-xl lg:rounded-2xl p-6 lg:p-8 space-y-6">
                        <section>
                            <h2 className="text-lg font-semibold text-white mb-3">Acceptance of Terms</h2>
                            <p className="text-white/60 text-sm lg:text-base leading-relaxed">
                                By accessing and using ScholarArchive, you accept and agree to be bound by the terms
                                and provisions of this agreement. If you do not agree to these terms, please do not
                                use our services.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold text-white mb-3">User Accounts</h2>
                            <ul className="text-white/60 text-sm lg:text-base space-y-2">
                                <li className="flex items-start gap-2">
                                    <span className="text-purple-400 mt-1">•</span>
                                    You must provide accurate and complete information when creating an account
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-purple-400 mt-1">•</span>
                                    You are responsible for maintaining the security of your account
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-purple-400 mt-1">•</span>
                                    You must not share your account credentials with others
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-purple-400 mt-1">•</span>
                                    You must be at least 13 years old to use this service
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold text-white mb-3">Content Guidelines</h2>
                            <p className="text-white/60 text-sm lg:text-base leading-relaxed mb-3">
                                When uploading content to ScholarArchive, you agree that:
                            </p>
                            <ul className="text-white/60 text-sm lg:text-base space-y-2">
                                <li className="flex items-start gap-2">
                                    <span className="text-purple-400 mt-1">•</span>
                                    You own or have the right to share the content
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-purple-400 mt-1">•</span>
                                    Content must be educational and appropriate
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-purple-400 mt-1">•</span>
                                    No copyrighted materials without permission
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold text-white mb-3">Prohibited Activities</h2>
                            <p className="text-white/60 text-sm lg:text-base leading-relaxed">
                                You may not use ScholarArchive for any illegal purposes, to harass others,
                                to distribute malware, or to infringe on intellectual property rights.
                                Violation of these terms may result in account termination.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold text-white mb-3">Limitation of Liability</h2>
                            <p className="text-white/60 text-sm lg:text-base leading-relaxed">
                                ScholarArchive is provided "as is" without warranties of any kind. We are not
                                liable for any damages arising from your use of our services.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Terms;
