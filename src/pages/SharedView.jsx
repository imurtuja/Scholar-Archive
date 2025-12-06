import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    FileText, BookOpen, Calendar, User, Clock, ArrowLeft,
    ExternalLink, Loader, AlertCircle, Share2, FolderOpen,
    ScrollText, HelpCircle, Upload
} from 'lucide-react';
import usePageTitle from '../hooks/usePageTitle';

// Helper to convert Google Drive links to embed format
const getEmbedUrl = (url) => {
    try {
        let embedUrl = url;
        if (url.includes('drive.google.com')) {
            embedUrl = url.replace(/\/view.*/, '/preview').replace(/\/edit.*/, '/preview');
            if (!embedUrl.includes('/preview')) {
                embedUrl += '/preview';
            }
        }
        return embedUrl;
    } catch (e) {
        return url;
    }
};

const SharedView = () => {
    const { linkId } = useParams();
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('syllabus');

    usePageTitle('Shared Content');

    useEffect(() => {
        fetchSharedContent();
    }, [linkId]);

    const fetchSharedContent = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/share/view/${linkId}`, {
                headers: { 'x-auth-token': token }
            });
            const result = await res.json();

            if (res.ok) {
                setData(result);
                // Set initial tab based on included content
                if (result.share.type === 'subject' && result.share.includedContent) {
                    const inc = result.share.includedContent;
                    if (inc.syllabus) setActiveTab('syllabus');
                    else if (inc.notes) setActiveTab('notes');
                    else if (inc.questions) setActiveTab('questions');
                    else if (inc.papers) setActiveTab('papers');
                }
            } else {
                setError(result.error || 'Failed to load shared content');
            }
        } catch (err) {
            setError('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a14] flex items-center justify-center">
                <div className="text-center">
                    <Loader className="animate-spin text-indigo-400 mx-auto mb-4" size={40} />
                    <p className="text-white/50">Loading shared content...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#0a0a14] flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <div className="w-16 h-16 rounded-2xl bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                        <AlertCircle size={32} className="text-red-400" />
                    </div>
                    <h1 className="text-xl font-bold text-white mb-2">Content Not Available</h1>
                    <p className="text-white/50 mb-6">{error}</p>
                    <Link
                        to="/dashboard"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors"
                    >
                        <ArrowLeft size={18} />
                        Go to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    const { share, content } = data;
    const includedContent = share.includedContent || { syllabus: true, notes: true, questions: true, papers: true };

    // Group resources by category
    const groupedResources = {
        notes: content.resources?.filter(r => r.category === 'notes') || [],
        questions: content.resources?.filter(r => r.category === 'questions') || [],
        papers: content.resources?.filter(r => r.category === 'papers') || []
    };

    // Build available tabs based on included content
    const availableTabs = [];
    if (includedContent.syllabus) availableTabs.push({ key: 'syllabus', label: 'Syllabus', icon: BookOpen });
    if (includedContent.notes) availableTabs.push({ key: 'notes', label: 'Notes', icon: FileText });
    if (includedContent.questions) availableTabs.push({ key: 'questions', label: 'Important Questions', icon: HelpCircle });
    if (includedContent.papers) availableTabs.push({ key: 'papers', label: 'Previous Papers', icon: ScrollText });

    return (
        <div className="min-h-screen bg-[#0a0a14]">
            {/* Header */}
            <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 relative overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px]" />
                <div className="max-w-5xl mx-auto px-4 py-6 relative">
                    {/* Back Link */}
                    <Link
                        to="/dashboard"
                        className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-4"
                    >
                        <ArrowLeft size={18} />
                        <span className="text-sm">Back to Dashboard</span>
                    </Link>

                    {/* Share Info */}
                    <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                            {share.type === 'resource' ? (
                                <FileText size={24} className="text-white" />
                            ) : (
                                <BookOpen size={24} className="text-white" />
                            )}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-medium text-white/80 bg-white/20 px-2 py-0.5 rounded backdrop-blur-sm">
                                    Shared {share.type === 'resource' ? 'Resource' : 'Subject'}
                                </span>
                            </div>
                            <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">{share.title}</h1>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-white/70">
                                <span className="flex items-center gap-1">
                                    <User size={14} />
                                    {share.sharedBy}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Clock size={14} />
                                    {new Date(share.createdAt).toLocaleDateString()}
                                </span>
                            </div>

                            {/* Subject Details */}
                            {share.type === 'subject' && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                    <span className="bg-white/20 px-2.5 py-1 rounded-lg text-xs font-medium text-white backdrop-blur-sm">
                                        {content.code}
                                    </span>
                                    <span className="bg-white/10 px-2.5 py-1 rounded-lg text-xs text-white/80">
                                        {content.year}
                                    </span>
                                    <span className="bg-white/10 px-2.5 py-1 rounded-lg text-xs text-white/80">
                                        {content.semester}
                                    </span>
                                    {content.credits && (
                                        <span className="text-white/60 text-xs flex items-center">
                                            • {content.credits} Credits
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-5xl mx-auto px-4 py-6">
                {share.type === 'resource' ? (
                    /* Single Resource View */
                    <div className="bg-[#13131f] border border-white/10 rounded-2xl overflow-hidden">
                        <div className="p-4 border-b border-white/10 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                <FileText size={20} />
                            </div>
                            <h2 className="font-semibold text-white">{content.title}</h2>
                        </div>

                        {content.link ? (
                            <div className="w-full h-[700px] bg-[#0a0a14]">
                                <iframe
                                    src={getEmbedUrl(content.link)}
                                    className="w-full h-full border-none"
                                    allow="autoplay"
                                    title={content.title}
                                />
                            </div>
                        ) : content.content ? (
                            <div className="p-6">
                                <div
                                    className="prose prose-invert prose-sm max-w-none"
                                    dangerouslySetInnerHTML={{ __html: content.content }}
                                />
                            </div>
                        ) : (
                            <div className="p-6 text-center text-white/40">
                                No preview available
                            </div>
                        )}
                    </div>
                ) : (
                    /* Subject View with Tabs */
                    <div>
                        {/* Tabs */}
                        <div className="flex gap-1 mb-6 border-b border-white/10 pb-1 overflow-x-auto">
                            {availableTabs.map(tab => {
                                const Icon = tab.icon;
                                const count = tab.key === 'syllabus'
                                    ? (content.syllabus?.units?.length || 0)
                                    : (groupedResources[tab.key]?.length || 0);

                                return (
                                    <button
                                        key={tab.key}
                                        onClick={() => setActiveTab(tab.key)}
                                        className={`px-4 lg:px-5 py-2.5 lg:py-3 font-medium text-sm transition-all relative rounded-t-lg whitespace-nowrap flex items-center gap-2 ${activeTab === tab.key
                                            ? 'text-indigo-400 bg-indigo-500/10'
                                            : 'text-white/50 hover:text-white/70 hover:bg-white/5'
                                            }`}
                                    >
                                        <Icon size={16} />
                                        {tab.label}
                                        {count > 0 && (
                                            <span className={`ml-1 px-1.5 py-0.5 rounded text-xs ${activeTab === tab.key
                                                ? 'bg-indigo-500/20 text-indigo-400'
                                                : 'bg-white/10 text-white/40'
                                                }`}>
                                                {count}
                                            </span>
                                        )}
                                        {activeTab === tab.key && (
                                            <div className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Tab Content */}
                        {activeTab === 'syllabus' && includedContent.syllabus && (
                            <div className="space-y-4">
                                {content.syllabus?.units?.length > 0 ? (
                                    content.syllabus.units.map((unit, index) => (
                                        <div
                                            key={index}
                                            className="bg-[#13131f] border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all"
                                        >
                                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-3">
                                                <span className="w-8 h-8 min-w-[32px] rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-sm font-bold">
                                                    {unit.unit}
                                                </span>
                                                {unit.title}
                                            </h3>
                                            {unit.topics && unit.topics.length > 0 && (
                                                <div className="flex flex-wrap gap-2">
                                                    {unit.topics.map((topic, i) => (
                                                        <span
                                                            key={i}
                                                            className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white/70 hover:bg-white/10 transition-colors cursor-default"
                                                        >
                                                            {topic}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-16 border-2 border-dashed border-white/10 rounded-2xl bg-[#13131f]">
                                        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                            <BookOpen size={32} className="text-white/20" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-white/70 mb-1">No syllabus available</h3>
                                        <p className="text-white/40 text-sm">This subject doesn't have syllabus content yet</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Resources Tab Content (Notes, Questions, Papers) */}
                        {['notes', 'questions', 'papers'].includes(activeTab) && includedContent[activeTab] && (
                            <div className="space-y-6">
                                {groupedResources[activeTab]?.length > 0 ? (
                                    <div className="grid grid-cols-1 gap-5">
                                        {groupedResources[activeTab].map(res => (
                                            <div
                                                key={res._id}
                                                className="bg-[#13131f] border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all"
                                            >
                                                <div className="p-4 border-b border-white/10 flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                                        <FileText size={20} />
                                                    </div>
                                                    <h4 className="font-semibold text-white">{res.title}</h4>
                                                </div>

                                                {res.link ? (
                                                    <div className="w-full h-[700px] bg-[#0a0a14]">
                                                        <iframe
                                                            src={getEmbedUrl(res.link)}
                                                            className="w-full h-full border-none"
                                                            allow="autoplay"
                                                            title={res.title}
                                                        />
                                                    </div>
                                                ) : res.content ? (
                                                    <div className="p-4">
                                                        <div
                                                            className="prose prose-invert prose-sm max-w-none"
                                                            dangerouslySetInnerHTML={{ __html: res.content }}
                                                        />
                                                    </div>
                                                ) : null}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-16 border-2 border-dashed border-white/10 rounded-2xl bg-[#13131f]">
                                        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white/30">
                                            <Upload size={32} />
                                        </div>
                                        <h3 className="text-lg font-semibold text-white/70 mb-1">No resources available</h3>
                                        <p className="text-white/40 text-sm">
                                            No {activeTab === 'questions' ? 'important questions' : activeTab === 'papers' ? 'previous papers' : 'notes'} shared for this subject
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SharedView;
