import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Link2, Share2, Eye, Users, Loader, Trash2, BookOpen, FileText, HelpCircle, ScrollText, ChevronRight, Sparkles } from 'lucide-react';

const ShareModal = ({ isOpen, onClose, type, targetId, title }) => {
    const [shareLink, setShareLink] = useState(null);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [analytics, setAnalytics] = useState(null);
    const [showAnalytics, setShowAnalytics] = useState(false);

    // Content selection for subjects
    const [step, setStep] = useState(type === 'subject' ? 'select' : 'share');
    const [includedContent, setIncludedContent] = useState({
        syllabus: true,
        notes: true,
        questions: true,
        papers: true
    });

    useEffect(() => {
        if (isOpen) {
            setShareLink(null);
            setAnalytics(null);
            setShowAnalytics(false);
            setCopied(false);
            setIncludedContent({
                syllabus: true,
                notes: true,
                questions: true,
                papers: true
            });
            setStep(type === 'subject' ? 'select' : 'share');

            if (type === 'resource' && targetId) {
                createShareLink();
            }
        }
    }, [isOpen, targetId, type]);

    const createShareLink = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const body = { type, targetId };

            if (type === 'subject') {
                body.includedContent = includedContent;
            }

            const res = await fetch('/api/share', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify(body)
            });
            const data = await res.json();
            if (res.ok) {
                setShareLink(data);
                setStep('share');
                fetchAnalytics(data._id);
            }
        } catch (error) {
            console.error('Error creating share link:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAnalytics = async (shareId) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/share/analytics/${shareId}`, {
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();
            if (res.ok) {
                setAnalytics(data);
            }
        } catch (error) {
            console.error('Error fetching analytics:', error);
        }
    };

    const copyToClipboard = async () => {
        const fullUrl = `${window.location.origin}/shared/${shareLink.linkId}`;
        try {
            await navigator.clipboard.writeText(fullUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    };

    const deleteShare = async () => {
        try {
            const token = localStorage.getItem('token');
            await fetch(`/api/share/${shareLink._id}`, {
                method: 'DELETE',
                headers: { 'x-auth-token': token }
            });
            setShareLink(null);
            onClose();
        } catch (error) {
            console.error('Error deleting share:', error);
        }
    };

    const toggleContent = (key) => {
        setIncludedContent(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const hasAnyContentSelected = Object.values(includedContent).some(v => v);

    if (!isOpen) return null;

    const fullUrl = shareLink ? `${window.location.origin}/shared/${shareLink.linkId}` : '';

    const contentOptions = [
        { key: 'syllabus', label: 'Syllabus', description: 'Course structure & topics', icon: BookOpen },
        { key: 'notes', label: 'Notes', description: 'Study notes & materials', icon: FileText },
        { key: 'questions', label: 'Important Questions', description: 'Frequently asked questions', icon: HelpCircle },
        { key: 'papers', label: 'Previous Papers', description: 'Past exam papers', icon: ScrollText }
    ];

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />

            {/* Modal */}
            <div className="relative w-full max-w-lg bg-gradient-to-b from-[#1a1a2e] to-[#13131f] border border-white/10 rounded-3xl shadow-2xl shadow-black/50 overflow-hidden">
                {/* Decorative gradient blur */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 blur-3xl" />

                {/* Header */}
                <div className="relative flex items-center justify-between p-6 border-b border-white/5">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                                <Share2 size={22} className="text-white" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#1a1a2e] flex items-center justify-center">
                                <Sparkles size={12} className="text-purple-400" />
                            </div>
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-white">Share {type === 'resource' ? 'Resource' : 'Subject'}</h3>
                            <p className="text-sm text-white/40 truncate max-w-[250px]">{title}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2.5 hover:bg-white/10 rounded-xl transition-all duration-200 text-white/40 hover:text-white hover:rotate-90"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="relative p-6">
                    {/* Step 1: Content Selection */}
                    {step === 'select' && type === 'subject' && (
                        <div className="space-y-5">
                            <div>
                                <h4 className="text-sm font-semibold text-white mb-1">Select Content to Share</h4>
                                <p className="text-xs text-white/40">Choose what recipients can access</p>
                            </div>

                            <div className="space-y-3">
                                {contentOptions.map(({ key, label, description, icon: Icon }) => (
                                    <button
                                        key={key}
                                        onClick={() => toggleContent(key)}
                                        className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 group ${includedContent[key]
                                                ? 'bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-indigo-500/30'
                                                : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/10'
                                            }`}
                                    >
                                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 ${includedContent[key]
                                                ? 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25'
                                                : 'bg-white/5 group-hover:bg-white/10'
                                            }`}>
                                            <Icon size={20} className={includedContent[key] ? 'text-white' : 'text-white/40'} />
                                        </div>
                                        <div className="flex-1 text-left">
                                            <p className={`font-medium transition-colors ${includedContent[key] ? 'text-white' : 'text-white/60'}`}>
                                                {label}
                                            </p>
                                            <p className="text-xs text-white/30">{description}</p>
                                        </div>
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${includedContent[key]
                                                ? 'bg-gradient-to-br from-indigo-500 to-purple-600 border-transparent'
                                                : 'border-white/20'
                                            }`}>
                                            {includedContent[key] && <Check size={14} className="text-white" />}
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {/* Generate Button */}
                            <button
                                onClick={createShareLink}
                                disabled={!hasAnyContentSelected || loading}
                                className="w-full py-4 px-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-400 hover:via-purple-400 hover:to-pink-400 text-white font-semibold rounded-2xl transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.98]"
                            >
                                {loading ? (
                                    <>
                                        <Loader className="animate-spin" size={20} />
                                        <span>Generating Link...</span>
                                    </>
                                ) : (
                                    <>
                                        <Link2 size={20} />
                                        <span>Generate Share Link</span>
                                        <ChevronRight size={18} className="ml-1" />
                                    </>
                                )}
                            </button>

                            {!hasAnyContentSelected && (
                                <p className="text-center text-sm text-amber-400/80">Please select at least one content type</p>
                            )}
                        </div>
                    )}

                    {/* Step 2: Share Link */}
                    {step === 'share' && (
                        <>
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <div className="relative">
                                        <div className="w-16 h-16 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
                                        <Link2 size={24} className="absolute inset-0 m-auto text-indigo-400" />
                                    </div>
                                    <p className="mt-4 text-white/50">Creating your share link...</p>
                                </div>
                            ) : shareLink ? (
                                <div className="space-y-5">
                                    {/* Success indicator */}
                                    <div className="flex items-center justify-center gap-2 py-2">
                                        <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                                            <Check size={16} className="text-green-400" />
                                        </div>
                                        <span className="text-green-400 font-medium">Link ready to share!</span>
                                    </div>

                                    {/* Link Box */}
                                    <div className="bg-[#0a0a14] rounded-2xl p-4 border border-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                                                <Link2 size={18} className="text-indigo-400" />
                                            </div>
                                            <input
                                                type="text"
                                                readOnly
                                                value={fullUrl}
                                                className="flex-1 bg-transparent text-white text-sm outline-none truncate font-mono"
                                            />
                                        </div>
                                        <button
                                            onClick={copyToClipboard}
                                            className={`w-full mt-3 py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 ${copied
                                                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                                    : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-400 hover:to-purple-500 shadow-lg shadow-indigo-500/20'
                                                }`}
                                        >
                                            {copied ? (
                                                <>
                                                    <Check size={18} />
                                                    Copied to Clipboard!
                                                </>
                                            ) : (
                                                <>
                                                    <Copy size={18} />
                                                    Copy Link
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    {/* What's Included (for subjects) */}
                                    {type === 'subject' && shareLink.includedContent && (
                                        <div className="bg-white/[0.02] rounded-2xl p-4 border border-white/5">
                                            <p className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3">Shared Content</p>
                                            <div className="flex flex-wrap gap-2">
                                                {shareLink.includedContent.syllabus && (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg text-xs font-medium">
                                                        <BookOpen size={12} /> Syllabus
                                                    </span>
                                                )}
                                                {shareLink.includedContent.notes && (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg text-xs font-medium">
                                                        <FileText size={12} /> Notes
                                                    </span>
                                                )}
                                                {shareLink.includedContent.questions && (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg text-xs font-medium">
                                                        <HelpCircle size={12} /> Questions
                                                    </span>
                                                )}
                                                {shareLink.includedContent.papers && (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg text-xs font-medium">
                                                        <ScrollText size={12} /> Papers
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Info Note */}
                                    <div className="flex items-start gap-3 p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
                                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <Eye size={16} className="text-amber-400" />
                                        </div>
                                        <p className="text-sm text-white/50">
                                            <span className="text-amber-400 font-medium">Note:</span> Recipients must log in to view this content. You can track who views it below.
                                        </p>
                                    </div>

                                    {/* Analytics */}
                                    <button
                                        onClick={() => setShowAnalytics(!showAnalytics)}
                                        className="w-full flex items-center justify-between p-4 bg-white/[0.02] hover:bg-white/[0.05] rounded-2xl border border-white/5 transition-all duration-200"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                                                <Users size={18} className="text-purple-400" />
                                            </div>
                                            <div className="text-left">
                                                <p className="font-medium text-white">View Analytics</p>
                                                <p className="text-xs text-white/40">See who viewed your share</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm font-bold">
                                                {analytics?.totalViews || 0}
                                            </span>
                                            <ChevronRight size={18} className={`text-white/30 transition-transform duration-200 ${showAnalytics ? 'rotate-90' : ''}`} />
                                        </div>
                                    </button>

                                    {/* Analytics Panel */}
                                    {showAnalytics && analytics && (
                                        <div className="bg-[#0a0a14] rounded-2xl p-4 border border-white/5 animate-in slide-in-from-top-2 duration-200">
                                            {analytics.viewers?.length > 0 ? (
                                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                                    {analytics.viewers.map((view, i) => (
                                                        <div key={i} className="flex items-center gap-3 p-3 bg-white/[0.02] rounded-xl">
                                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                                                                {view.name?.charAt(0).toUpperCase() || '?'}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-medium text-white truncate">{view.name}</p>
                                                                <p className="text-xs text-white/40 truncate">{view.email}</p>
                                                            </div>
                                                            <span className="text-xs text-white/30 flex-shrink-0">
                                                                {new Date(view.viewedAt).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-8">
                                                    <Eye size={32} className="text-white/10 mx-auto mb-2" />
                                                    <p className="text-white/40 text-sm">No views yet</p>
                                                    <p className="text-white/20 text-xs mt-1">Share your link to get started</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Delete Link */}
                                    <button
                                        onClick={deleteShare}
                                        className="w-full flex items-center justify-center gap-2 p-3.5 text-red-400/70 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-200 border border-transparent hover:border-red-500/20"
                                    >
                                        <Trash2 size={16} />
                                        <span className="text-sm font-medium">Delete Share Link</span>
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                                        <X size={32} className="text-red-400" />
                                    </div>
                                    <p className="text-white/50">Failed to create share link</p>
                                    <button
                                        onClick={() => setStep('select')}
                                        className="mt-4 text-indigo-400 hover:text-indigo-300 text-sm font-medium"
                                    >
                                        Try Again
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ShareModal;
