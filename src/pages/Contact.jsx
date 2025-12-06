import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Mail, ArrowLeft, Send, MessageSquare, MapPin, Phone } from 'lucide-react';
import usePageTitle from '../hooks/usePageTitle';

const Contact = () => {
    usePageTitle('Contact Us');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simulate form submission
        setTimeout(() => {
            setIsSubmitting(false);
            setSubmitted(true);
            setFormData({ name: '', email: '', subject: '', message: '' });
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-[#0a0a14]">
            <Navbar />

            {/* Background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:100px_100px]"></div>
            <div className="absolute top-[20%] left-[20%] w-[300px] h-[300px] bg-pink-600/10 rounded-full blur-[150px]"></div>
            <div className="absolute bottom-[20%] right-[10%] w-[250px] h-[250px] bg-indigo-600/10 rounded-full blur-[150px]"></div>

            <div className="relative z-10 pt-24 pb-16 px-4 lg:px-6">
                <div className="max-w-4xl mx-auto">
                    {/* Back Link */}
                    <Link to="/" className="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm mb-6 transition-colors">
                        <ArrowLeft size={16} /> Back to Home
                    </Link>

                    {/* Header */}
                    <div className="text-center mb-8 lg:mb-12">
                        <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center mx-auto mb-4">
                            <MessageSquare size={28} className="text-white" />
                        </div>
                        <h1 className="text-2xl lg:text-4xl font-bold text-white mb-2">Get in Touch</h1>
                        <p className="text-white/50 text-sm lg:text-base">Have questions? We'd love to hear from you.</p>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
                        {/* Contact Info */}
                        <div className="lg:col-span-1 space-y-4">
                            <div className="bg-[#13131f] border border-white/10 rounded-xl p-4 lg:p-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                                        <Mail size={18} className="text-indigo-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-white">Email</h3>
                                        <p className="text-white/50 text-xs lg:text-sm">support@scholararchive.com</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-[#13131f] border border-white/10 rounded-xl p-4 lg:p-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                                        <Phone size={18} className="text-purple-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-white">Phone</h3>
                                        <p className="text-white/50 text-xs lg:text-sm">+91 98765 43210</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-[#13131f] border border-white/10 rounded-xl p-4 lg:p-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center">
                                        <MapPin size={18} className="text-pink-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-white">Location</h3>
                                        <p className="text-white/50 text-xs lg:text-sm">Hyderabad, India</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="lg:col-span-2">
                            <div className="bg-[#13131f] border border-white/10 rounded-xl lg:rounded-2xl p-6 lg:p-8">
                                {submitted ? (
                                    <div className="text-center py-8">
                                        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                                            <Send size={28} className="text-green-400" />
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-2">Message Sent!</h3>
                                        <p className="text-white/50 text-sm">We'll get back to you within 24 hours.</p>
                                        <button
                                            onClick={() => setSubmitted(false)}
                                            className="mt-4 text-indigo-400 text-sm hover:underline"
                                        >
                                            Send another message
                                        </button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block mb-1.5 text-xs lg:text-sm font-medium text-white/60">Name</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    className="w-full h-11 px-4 bg-[#1a1a2e] border border-white/10 rounded-xl text-white text-sm placeholder-white/30 focus:outline-none focus:border-indigo-500/50 transition-all"
                                                    placeholder="Your name"
                                                />
                                            </div>
                                            <div>
                                                <label className="block mb-1.5 text-xs lg:text-sm font-medium text-white/60">Email</label>
                                                <input
                                                    type="email"
                                                    required
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    className="w-full h-11 px-4 bg-[#1a1a2e] border border-white/10 rounded-xl text-white text-sm placeholder-white/30 focus:outline-none focus:border-indigo-500/50 transition-all"
                                                    placeholder="your@email.com"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block mb-1.5 text-xs lg:text-sm font-medium text-white/60">Subject</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.subject}
                                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                                className="w-full h-11 px-4 bg-[#1a1a2e] border border-white/10 rounded-xl text-white text-sm placeholder-white/30 focus:outline-none focus:border-indigo-500/50 transition-all"
                                                placeholder="How can we help?"
                                            />
                                        </div>
                                        <div>
                                            <label className="block mb-1.5 text-xs lg:text-sm font-medium text-white/60">Message</label>
                                            <textarea
                                                required
                                                rows={4}
                                                value={formData.message}
                                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                                className="w-full px-4 py-3 bg-[#1a1a2e] border border-white/10 rounded-xl text-white text-sm placeholder-white/30 focus:outline-none focus:border-indigo-500/50 transition-all resize-none"
                                                placeholder="Tell us more about your inquiry..."
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full h-12 bg-gradient-to-r from-pink-500 to-rose-600 text-white font-semibold rounded-xl shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                    Sending...
                                                </>
                                            ) : (
                                                <>
                                                    <Send size={18} />
                                                    Send Message
                                                </>
                                            )}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
