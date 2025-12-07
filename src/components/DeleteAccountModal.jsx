import React, { useState } from 'react';
import { AlertTriangle, Trash2, X, Clock, Shield, Loader } from 'lucide-react';

const DeleteAccountModal = ({ isOpen, onClose, onConfirm }) => {
    const [step, setStep] = useState(1);
    const [confirmText, setConfirmText] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const CONFIRM_PHRASE = 'DELETE MY ACCOUNT';

    const handleClose = () => {
        setStep(1);
        setConfirmText('');
        setError('');
        onClose();
    };

    const handleDelete = async () => {
        if (confirmText !== CONFIRM_PHRASE) {
            setError('Please type the confirmation phrase exactly');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/auth/schedule-deletion', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                }
            });

            const data = await res.json();

            if (res.ok) {
                setStep(3); // Success step
            } else {
                setError(data.message || 'Failed to schedule deletion');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleClose} />

            {/* Modal */}
            <div className="relative w-full max-w-md bg-[#13131f] light-modal border border-red-500/20 rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-red-500/10 px-6 py-4 border-b border-red-500/20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                            <AlertTriangle size={20} className="text-red-400" />
                        </div>
                        <h2 className="text-lg font-bold text-white">Delete Account</h2>
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-white/40 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {step === 1 && (
                        <div className="space-y-4">
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                                <h3 className="font-semibold text-red-400 mb-2">Warning: This action will:</h3>
                                <ul className="text-sm text-white/60 space-y-1">
                                    <li>• Delete all your subjects and syllabus data</li>
                                    <li>• Remove all uploaded resources and notes</li>
                                    <li>• Delete your timetable and exam schedules</li>
                                    <li>• Remove all shared links and analytics</li>
                                </ul>
                            </div>

                            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3">
                                <Clock size={20} className="text-amber-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-medium text-amber-400">14-Day Grace Period</h4>
                                    <p className="text-sm text-white/50 mt-1">
                                        Your account will be scheduled for deletion. You have 14 days to undo this action by logging in again.
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => setStep(2)}
                                className="w-full py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-medium rounded-xl border border-red-500/30 transition-all"
                            >
                                I understand, continue
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4">
                            <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                                <div className="flex items-center gap-2 mb-3">
                                    <Shield size={18} className="text-indigo-400" />
                                    <span className="font-medium text-white">Verification Required</span>
                                </div>
                                <p className="text-sm text-white/50 mb-3">
                                    To confirm deletion, please type:
                                </p>
                                <div className="p-2 bg-white/5 rounded-lg text-center font-mono text-red-400 font-bold">
                                    {CONFIRM_PHRASE}
                                </div>
                            </div>

                            <input
                                type="text"
                                value={confirmText}
                                onChange={(e) => setConfirmText(e.target.value)}
                                placeholder="Type the phrase above"
                                className="w-full h-12 px-4 bg-[#1a1a2e] border border-white/10 rounded-xl text-white focus:outline-none focus:border-red-500/50 transition-all"
                            />

                            {error && (
                                <p className="text-red-400 text-sm">{error}</p>
                            )}

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setStep(1)}
                                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl border border-white/10 transition-all"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={loading || confirmText !== CONFIRM_PHRASE}
                                    className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <>
                                            <Loader size={18} className="animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 size={18} />
                                            Delete Account
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="text-center py-4">
                            <div className="w-16 h-16 bg-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Clock size={32} className="text-amber-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Deletion Scheduled</h3>
                            <p className="text-white/50 text-sm mb-4">
                                Your account will be permanently deleted in 14 days. To cancel, simply log in again before the deadline.
                            </p>
                            <p className="text-xs text-white/30 mb-6">
                                You will receive an email reminder 3 days before deletion.
                            </p>
                            <button
                                onClick={() => {
                                    localStorage.clear();
                                    window.location.href = '/';
                                }}
                                className="w-full py-3 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl border border-white/10 transition-all"
                            >
                                Sign Out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DeleteAccountModal;
