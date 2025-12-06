import React, { useState, useEffect } from 'react';
import { Link as LinkIcon, FileText, BookOpen, Eye, Trash2, ExternalLink, Copy, Check, Clock, Users, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import usePageTitle from '../hooks/usePageTitle';

const MyShares = () => {
    usePageTitle('My Shares');
    const { authenticatedFetch } = useAuth();
    const toast = useToast();
    const [shares, setShares] = useState([]);
    const [loading, setLoading] = useState(true);
    const [copiedId, setCopiedId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [expandedShare, setExpandedShare] = useState(null);
    const [analytics, setAnalytics] = useState({});
    const [loadingAnalytics, setLoadingAnalytics] = useState({});

    // Fetch all shares
    const fetchShares = async () => {
        try {
            const response = await authenticatedFetch('/api/share');
            if (response.ok) {
                const data = await response.json();
                setShares(data);
            }
        } catch (error) {
            console.error('Error fetching shares:', error);
            toast.error('Failed to load shares');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchShares();
    }, []);

    // Copy link to clipboard
    const handleCopyLink = async (linkId) => {
        const url = `${window.location.origin}/shared/${linkId}`;
        try {
            await navigator.clipboard.writeText(url);
            setCopiedId(linkId);
            toast.success('Link copied to clipboard!');
            setTimeout(() => setCopiedId(null), 2000);
        } catch (error) {
            toast.error('Failed to copy link');
        }
    };

    // Delete share
    const handleDelete = async (shareId) => {
        setDeletingId(shareId);
        try {
            const response = await authenticatedFetch(`/api/share/${shareId}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                setShares(shares.filter(s => s._id !== shareId));
                toast.success('Share link deleted');
            }
        } catch (error) {
            toast.error('Failed to delete share');
        } finally {
            setDeletingId(null);
        }
    };

    // Fetch analytics for a share
    const fetchAnalytics = async (shareId) => {
        if (analytics[shareId]) return;

        setLoadingAnalytics(prev => ({ ...prev, [shareId]: true }));
        try {
            const response = await authenticatedFetch(`/api/share/analytics/${shareId}`);
            if (response.ok) {
                const data = await response.json();
                setAnalytics(prev => ({ ...prev, [shareId]: data }));
            }
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoadingAnalytics(prev => ({ ...prev, [shareId]: false }));
        }
    };

    // Toggle expanded share and load analytics
    const toggleExpand = (shareId) => {
        if (expandedShare === shareId) {
            setExpandedShare(null);
        } else {
            setExpandedShare(shareId);
            fetchAnalytics(shareId);
        }
    };

    // Format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) {
            const hours = Math.floor(diff / (1000 * 60 * 60));
            if (hours === 0) {
                const minutes = Math.floor(diff / (1000 * 60));
                return minutes <= 1 ? 'Just now' : `${minutes} minutes ago`;
            }
            return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
        } else if (days === 1) {
            return 'Yesterday';
        } else if (days < 7) {
            return `${days} days ago`;
        }
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader className="animate-spin text-indigo-400" size={32} />
            </div>
        );
    }

    return (
        <div className="p-4 lg:p-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-6 lg:mb-8">
                <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">My Shares</h1>
                <p className="text-white/50">Manage your shared resources and subjects. See who has viewed your content.</p>
            </div>

            {/* Empty State */}
            {shares.length === 0 ? (
                <div className="text-center py-16 bg-[#13131f] border border-dashed border-white/10 rounded-2xl">
                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <LinkIcon size={40} className="text-indigo-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white/70 mb-2">No shared content yet</h3>
                    <p className="text-white/40 text-sm max-w-md mx-auto">
                        Share your resources or subjects to get shareable links. Go to Resources or Subjects page and click the share button.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {shares.map((share) => (
                        <div
                            key={share._id}
                            className="bg-[#13131f] border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all"
                        >
                            {/* Main Row */}
                            <div className="p-4 lg:p-5">
                                <div className="flex items-start gap-4">
                                    {/* Icon */}
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${share.type === 'resource'
                                            ? 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20'
                                            : 'bg-gradient-to-br from-indigo-500/20 to-purple-500/20'
                                        }`}>
                                        {share.type === 'resource' ? (
                                            <FileText className="text-emerald-400" size={24} />
                                        ) : (
                                            <BookOpen className="text-indigo-400" size={24} />
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-3 mb-1">
                                            <h3 className="font-semibold text-white truncate">{share.title}</h3>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${share.type === 'resource'
                                                    ? 'bg-emerald-500/20 text-emerald-400'
                                                    : 'bg-indigo-500/20 text-indigo-400'
                                                }`}>
                                                {share.type === 'resource' ? 'Resource' : 'Subject'}
                                            </span>
                                        </div>
                                        {share.description && (
                                            <p className="text-white/40 text-sm truncate mb-2">{share.description}</p>
                                        )}
                                        <div className="flex items-center gap-4 text-xs text-white/40">
                                            <span className="flex items-center gap-1">
                                                <Clock size={12} />
                                                Created {formatDate(share.createdAt)}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Eye size={12} />
                                                {share.views?.length || 0} views
                                            </span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <button
                                            onClick={() => handleCopyLink(share.linkId)}
                                            className="p-2 bg-white/5 hover:bg-emerald-500/20 rounded-lg transition-colors group"
                                            title="Copy Link"
                                        >
                                            {copiedId === share.linkId ? (
                                                <Check size={18} className="text-emerald-400" />
                                            ) : (
                                                <Copy size={18} className="text-white/50 group-hover:text-emerald-400" />
                                            )}
                                        </button>
                                        <a
                                            href={`/shared/${share.linkId}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 bg-white/5 hover:bg-indigo-500/20 rounded-lg transition-colors group"
                                            title="Open Link"
                                        >
                                            <ExternalLink size={18} className="text-white/50 group-hover:text-indigo-400" />
                                        </a>
                                        <button
                                            onClick={() => handleDelete(share._id)}
                                            disabled={deletingId === share._id}
                                            className="p-2 bg-white/5 hover:bg-red-500/20 rounded-lg transition-colors group disabled:opacity-50"
                                            title="Delete Share"
                                        >
                                            {deletingId === share._id ? (
                                                <Loader size={18} className="animate-spin text-red-400" />
                                            ) : (
                                                <Trash2 size={18} className="text-white/50 group-hover:text-red-400" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Expand/Collapse for Analytics */}
                                <button
                                    onClick={() => toggleExpand(share._id)}
                                    className="mt-3 text-xs text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
                                >
                                    <Users size={14} />
                                    {expandedShare === share._id ? 'Hide viewers' : 'Show viewers'}
                                </button>
                            </div>

                            {/* Expanded Analytics */}
                            {expandedShare === share._id && (
                                <div className="border-t border-white/10 p-4 lg:p-5 bg-[#0a0a14]/50">
                                    {loadingAnalytics[share._id] ? (
                                        <div className="flex items-center justify-center py-4">
                                            <Loader className="animate-spin text-indigo-400" size={20} />
                                        </div>
                                    ) : analytics[share._id]?.viewers?.length > 0 ? (
                                        <div>
                                            <h4 className="text-sm font-medium text-white/70 mb-3">Viewers ({analytics[share._id].totalViews})</h4>
                                            <div className="space-y-2">
                                                {analytics[share._id].viewers.map((viewer, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-center gap-3 p-2 bg-white/5 rounded-lg"
                                                    >
                                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-medium text-sm">
                                                            {viewer.name?.charAt(0).toUpperCase() || 'U'}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm text-white truncate">{viewer.name}</p>
                                                            <p className="text-xs text-white/40 truncate">{viewer.email}</p>
                                                        </div>
                                                        <span className="text-xs text-white/40">
                                                            {formatDate(viewer.viewedAt)}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-4 text-white/40 text-sm">
                                            No viewers yet. Share your link to get started!
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyShares;
