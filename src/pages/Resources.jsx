import React, { useState, useEffect, useRef } from 'react';
import {
    FileText, Image as ImageIcon, Link as LinkIcon,
    MoreHorizontal, Trash2, Search, Filter, Plus, X, Loader, Send,
    Bold, Italic, Underline, List, ListOrdered, ExternalLink, Share2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';
import ShareModal from '../components/ShareModal';
import usePageTitle from '../hooks/usePageTitle';

const Resources = () => {
    usePageTitle('Resources');
    const { user, logout } = useAuth();
    const toast = useToast();
    const [resources, setResources] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [filteredResources, setFilteredResources] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('all');
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, resourceId: null });
    const [shareTarget, setShareTarget] = useState(null);

    // Inline Post State
    const [isExpanded, setIsExpanded] = useState(false);
    const [newResource, setNewResource] = useState({
        title: '',
        link: '',
        content: '',
        subject: null,
        category: 'notes',
        type: 'text'
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const editorRef = useRef(null);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        filterResources();
    }, [searchTerm, selectedSubject, resources]);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const [resResources, resSubjects] = await Promise.all([
                fetch('/api/resources', { headers: { 'x-auth-token': token } }),
                fetch('/api/subjects', { headers: { 'x-auth-token': token } })
            ]);

            if (resResources.status === 401 || resSubjects.status === 401) {
                logout();
                return;
            }

            const dataResources = await resResources.json();
            const dataSubjects = await resSubjects.json();

            setResources(Array.isArray(dataResources) ? dataResources : []);
            setSubjects(Array.isArray(dataSubjects) ? dataSubjects : []);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const filterResources = () => {
        let result = [...resources];

        if (searchTerm) {
            result = result.filter(res =>
                res.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (res.content && res.content.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        if (selectedSubject !== 'all') {
            result = result.filter(res => res.subject === selectedSubject);
        }

        setFilteredResources(result);
    };

    const handleAddResource = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        let type = 'text';
        if (newResource.link) {
            if (newResource.link.includes('.pdf') || newResource.link.includes('drive.google.com')) type = 'pdf';
            else if (newResource.link.match(/\.(jpeg|jpg|gif|png)$/) || newResource.link.includes('pinterest')) type = 'image';
            else type = 'link';
        }
        if (!newResource.link && newResource.content) type = 'text';

        const resourceToAdd = { ...newResource, type };

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/resources', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify(resourceToAdd)
            });

            if (res.ok) {
                const added = await res.json();
                setResources([added, ...resources]);
                setNewResource({
                    title: '',
                    link: '',
                    content: '',
                    subject: null,
                    category: 'notes',
                    type: 'text'
                });
                if (editorRef.current) editorRef.current.innerHTML = '';
                setIsExpanded(false);
                toast.success('Resource posted successfully!');
            } else {
                const errData = await res.json();
                toast.error(`Failed to post: ${errData.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error adding resource:', error);
            toast.error('Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteClick = (id) => {
        setDeleteModal({ isOpen: true, resourceId: id });
        setActiveDropdown(null);
    };

    const handleConfirmDelete = async () => {
        const id = deleteModal.resourceId;
        if (!id) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/resources/${id}`, {
                method: 'DELETE',
                headers: { 'x-auth-token': token }
            });

            if (res.ok) {
                setResources(resources.filter(r => r._id !== id));
                setDeleteModal({ isOpen: false, resourceId: null });
                toast.success('Resource deleted successfully!');
            } else {
                const err = await res.json();
                toast.error(`Failed to delete: ${err.message}`);
            }
        } catch (error) {
            console.error('Error deleting resource:', error);
            toast.error('Error deleting resource. Please try again.');
        }
    };

    const getSubjectCode = (id) => {
        if (!id) return 'GN';
        const sub = subjects.find(s => s._id === id);
        return sub ? sub.code : 'GN';
    };

    const execCmd = (command) => {
        document.execCommand(command, false, null);
        if (editorRef.current) {
            editorRef.current.focus();
        }
    };

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-3xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Resources</h1>
                        <p className="text-white/50 mt-1">Share notes, links, and documents with your class.</p>
                    </div>

                    {/* Search Bar */}
                    <div className="relative w-full md:w-72">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                        <input
                            type="text"
                            placeholder="Search resources..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full h-11 pl-11 pr-4 bg-[#1a1a2e] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                        />
                    </div>
                </div>

                {/* Inline Add Resource Form */}
                <div className={`bg-[#13131f] border border-white/10 rounded-2xl transition-all duration-300 overflow-hidden ${isExpanded ? 'border-indigo-500/30' : ''}`}>
                    <form onSubmit={handleAddResource}>
                        {/* Collapsed View / Header */}
                        <div className="p-5 flex gap-4 items-start">
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                                {user?.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div className="flex-1">
                                {!isExpanded ? (
                                    <div
                                        onClick={() => setIsExpanded(true)}
                                        className="w-full py-3 text-white/40 cursor-text text-base hover:text-white/60 transition-colors"
                                    >
                                        Share something with your class...
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <input
                                            type="text"
                                            placeholder="Title / Topic"
                                            required
                                            value={newResource.title}
                                            onChange={e => setNewResource({ ...newResource, title: e.target.value })}
                                            className="w-full bg-transparent text-white font-bold text-lg outline-none focus:outline-none focus:ring-0 border-none placeholder:text-white/30"
                                            autoFocus
                                        />

                                        {/* Editor Container */}
                                        <div className="border border-white/10 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all bg-[#1a1a2e]">
                                            {/* Toolbar */}
                                            <div className="flex items-center gap-1 border-b border-white/10 p-2">
                                                <button type="button" onClick={() => execCmd('bold')} className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors" title="Bold">
                                                    <Bold size={16} />
                                                </button>
                                                <button type="button" onClick={() => execCmd('italic')} className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors" title="Italic">
                                                    <Italic size={16} />
                                                </button>
                                                <button type="button" onClick={() => execCmd('underline')} className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors" title="Underline">
                                                    <Underline size={16} />
                                                </button>
                                                <div className="w-px h-5 bg-white/10 mx-1"></div>
                                                <button type="button" onClick={() => execCmd('insertUnorderedList')} className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors" title="Bullet List">
                                                    <List size={16} />
                                                </button>
                                                <button type="button" onClick={() => execCmd('insertOrderedList')} className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors" title="Numbered List">
                                                    <ListOrdered size={16} />
                                                </button>
                                            </div>

                                            {/* Editable Area */}
                                            <div
                                                ref={editorRef}
                                                className="w-full min-h-[100px] p-4 outline-none text-white/80 placeholder:text-white/30"
                                                contentEditable
                                                onInput={e => setNewResource({ ...newResource, content: e.currentTarget.innerHTML })}
                                                suppressContentEditableWarning={true}
                                            />
                                        </div>

                                        {/* Link Input */}
                                        <div className="flex items-center gap-3 bg-[#1a1a2e] px-4 py-3 rounded-xl border border-white/10 focus-within:border-indigo-500/50 transition-colors">
                                            <LinkIcon size={18} className="text-white/40" />
                                            <input
                                                type="url"
                                                placeholder="Add a link (optional)"
                                                value={newResource.link}
                                                onChange={e => setNewResource({ ...newResource, link: e.target.value })}
                                                className="flex-1 bg-transparent outline-none text-sm text-indigo-400 placeholder:text-white/30"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer Actions */}
                        {isExpanded && (
                            <div className="px-5 py-4 border-t border-white/10 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsExpanded(false)}
                                    className="px-5 py-2.5 text-sm font-medium text-white/50 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-70 flex items-center gap-2"
                                >
                                    {isSubmitting ? <Loader className="animate-spin" size={16} /> : <Send size={16} />}
                                    Post
                                </button>
                            </div>
                        )}
                    </form>
                </div>

                {/* Feed Stream */}
                <div className="space-y-5">
                    {filteredResources.length > 0 ? (
                        filteredResources.map((res, index) => (
                            <div key={res._id || index} className="bg-[#13131f] border border-white/10 rounded-2xl overflow-hidden hover:border-indigo-500/30 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300">
                                <div className="p-5">
                                    {/* Card Header */}
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm ${res.type === 'pdf' ? 'bg-red-500/20 text-red-400' :
                                                res.type === 'image' ? 'bg-purple-500/20 text-purple-400' :
                                                    res.type === 'text' ? 'bg-white/10 text-white/70' :
                                                        'bg-indigo-500/20 text-indigo-400'
                                                }`}>
                                                {getSubjectCode(res.subject).substring(0, 2)}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-white">{res.title}</h3>
                                                <p className="text-xs text-white/40 mt-0.5">
                                                    Added {new Date(res.createdAt).toLocaleDateString()} • <span className="capitalize">{res.category}</span>
                                                </p>
                                            </div>
                                        </div>
                                        <div className="relative">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setActiveDropdown(activeDropdown === res._id ? null : res._id);
                                                }}
                                                className={`p-2 rounded-xl transition-colors ${activeDropdown === res._id ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                                            >
                                                <MoreHorizontal size={20} />
                                            </button>

                                            {activeDropdown === res._id && (
                                                <>
                                                    <div
                                                        className="fixed inset-0 z-10"
                                                        onClick={() => setActiveDropdown(null)}
                                                    ></div>
                                                    <div className="absolute right-0 top-full mt-2 w-40 bg-[#1a1a2e] border border-white/10 rounded-xl shadow-xl py-2 z-20">
                                                        <button
                                                            onClick={() => {
                                                                setShareTarget({ id: res._id, title: res.title, type: 'resource' });
                                                                setActiveDropdown(null);
                                                            }}
                                                            className="w-full text-left px-4 py-2.5 text-sm text-indigo-400 hover:bg-indigo-500/10 flex items-center gap-2"
                                                        >
                                                            <Share2 size={14} /> Share
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteClick(res._id)}
                                                            className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                                                        >
                                                            <Trash2 size={14} /> Delete
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Card Content (Text) */}
                                    {res.content && (
                                        <div
                                            className="text-white/70 text-sm leading-relaxed mb-4 prose prose-invert prose-sm max-w-none"
                                            dangerouslySetInnerHTML={{ __html: res.content }}
                                        />
                                    )}

                                    {/* Card Content (Link with Preview) */}
                                    {res.link && (() => {
                                        const isGoogleDrive = res.link.includes('drive.google.com');
                                        const getPreviewUrl = (url) => {
                                            if (!url.includes('drive.google.com')) return null;
                                            // Convert drive view/edit links to preview format
                                            let embedUrl = url.replace(/\/view.*/, '/preview').replace(/\/edit.*/, '/preview');
                                            if (!embedUrl.includes('/preview')) {
                                                embedUrl += '/preview';
                                            }
                                            return embedUrl;
                                        };
                                        const previewUrl = getPreviewUrl(res.link);

                                        return isGoogleDrive && previewUrl ? (
                                            <div className="rounded-xl overflow-hidden border border-white/10">
                                                <iframe
                                                    src={previewUrl}
                                                    className="w-full h-[400px] bg-[#1a1a2e]"
                                                    allow="autoplay"
                                                    allowFullScreen
                                                    title={res.title}
                                                />
                                                <a
                                                    href={res.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-center gap-2 px-4 py-2 bg-[#1a1a2e] text-white/50 text-sm hover:text-white hover:bg-white/5 transition-colors border-t border-white/10"
                                                >
                                                    <ExternalLink size={14} /> Open in new tab
                                                </a>
                                            </div>
                                        ) : (
                                            <a href={res.link} target="_blank" rel="noopener noreferrer" className="block group">
                                                <div className="bg-[#1a1a2e] rounded-xl border border-white/10 p-4 group-hover:border-indigo-500/30 transition-all">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`p-3 rounded-xl ${res.type === 'pdf' ? 'bg-red-500/10 text-red-400' :
                                                            res.type === 'image' ? 'bg-purple-500/10 text-purple-400' :
                                                                'bg-indigo-500/10 text-indigo-400'
                                                            }`}>
                                                            {res.type === 'pdf' ? <FileText size={22} /> :
                                                                res.type === 'image' ? <ImageIcon size={22} /> :
                                                                    <LinkIcon size={22} />}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="font-medium text-white/90 truncate text-sm group-hover:text-indigo-400 transition-colors">
                                                                {res.link}
                                                            </h4>
                                                            <p className="text-xs text-white/40 mt-0.5 flex items-center gap-1">
                                                                <ExternalLink size={12} /> Click to open resource
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </a>
                                        );
                                    })()}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-16 bg-[#13131f] border border-dashed border-white/10 rounded-2xl">
                            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Filter size={32} className="text-white/20" />
                            </div>
                            <h3 className="text-lg font-semibold text-white/70">No resources yet</h3>
                            <p className="text-white/40 text-sm mt-1">Share your first note or link above!</p>
                        </div>
                    )}
                </div>
            </div>

            <ConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, resourceId: null })}
                onConfirm={handleConfirmDelete}
                title="Delete Resource"
                message="Are you sure you want to delete this resource? This action cannot be undone."
            />

            <ShareModal
                isOpen={!!shareTarget}
                onClose={() => setShareTarget(null)}
                type={shareTarget?.type}
                targetId={shareTarget?.id}
                title={shareTarget?.title}
            />
        </div>
    );
};

export default Resources;
