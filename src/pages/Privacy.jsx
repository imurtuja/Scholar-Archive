import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Shield, ArrowLeft } from 'lucide-react';
import usePageTitle from '../hooks/usePageTitle';

const Privacy = () => {
    usePageTitle('Privacy Policy');
    return (
        <div className="min-h-screen bg-[#0a0a14]">
            <Navbar />

            {/* Background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:100px_100px]"></div>
            <div className="absolute top-[10%] left-[10%] w-[300px] h-[300px] bg-indigo-600/10 rounded-full blur-[150px]"></div>

            <div className="relative z-10 pt-24 pb-16 px-4 lg:px-6">
                <div className="max-w-3xl mx-auto">
                    {/* Back Link */}
                    <Link to="/" className="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm mb-6 transition-colors">
                        <ArrowLeft size={16} /> Back to Home
                    </Link>

                    {/* Header */}
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <Shield size={24} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-bold text-white">Privacy Policy</h1>
                            <p className="text-white/50 text-sm">Last updated: December 2024</p>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="bg-[#13131f] border border-white/10 rounded-xl lg:rounded-2xl p-6 lg:p-8 space-y-6">
                        <section>
                            <h2 className="text-lg font-semibold text-white mb-3">Information We Collect</h2>
                            <p className="text-white/60 text-sm lg:text-base leading-relaxed">
                                We collect information you provide directly to us, such as when you create an account,
                                upload study materials, or contact us for support. This includes your name, email address,
                                institution details, and any content you upload to our platform.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold text-white mb-3">How We Use Your Information</h2>
                            <ul className="text-white/60 text-sm lg:text-base space-y-2">
                                <li className="flex items-start gap-2">
                                    <span className="text-indigo-400 mt-1">•</span>
                                    To provide, maintain, and improve our services
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-indigo-400 mt-1">•</span>
                                    To personalize your experience and content
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-indigo-400 mt-1">•</span>
                                    To send you updates and notifications about your account
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-indigo-400 mt-1">•</span>
                                    To respond to your comments and questions
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold text-white mb-3">Data Security</h2>
                            <p className="text-white/60 text-sm lg:text-base leading-relaxed">
                                We take reasonable measures to help protect your personal information from loss, theft,
                                misuse, unauthorized access, disclosure, alteration, and destruction. All data is encrypted
                                in transit and at rest.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold text-white mb-3">Your Rights</h2>
                            <p className="text-white/60 text-sm lg:text-base leading-relaxed">
                                You have the right to access, update, or delete your personal information at any time.
                                You can do this through your account settings or by contacting us directly.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold text-white mb-3">Contact Us</h2>
                            <p className="text-white/60 text-sm lg:text-base leading-relaxed">
                                If you have any questions about this Privacy Policy, please contact us at{' '}
                                <a href="mailto:privacy@scholararchive.com" className="text-indigo-400 hover:underline">
                                    privacy@scholararchive.com
                                </a>
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Privacy;
