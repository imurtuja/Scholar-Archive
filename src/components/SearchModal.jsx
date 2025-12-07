import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, BookOpen, FileText, Command, Loader, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SearchModal = ({ isOpen, onClose }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState({ subjects: [], resources: [] });
    const [loading, setLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef(null);
    const navigate = useNavigate();
    const { authenticatedFetch } = useAuth();

    // Focus input when modal opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
            setQuery('');
            setResults({ subjects: [], resources: [] });
            setSelectedIndex(0);
        }
    }, [isOpen]);

    // Search with debounce
    useEffect(() => {
        if (!query || query.length < 2) {
            setResults({ subjects: [], resources: [] });
            return;
        }

        const timeoutId = setTimeout(async () => {
            setLoading(true);
            try {
                const res = await authenticatedFetch(`/api/search?q=${encodeURIComponent(query)}`);
                if (res.ok) {
                    const data = await res.json();
                    setResults(data);
                    setSelectedIndex(0);
                }
            } catch (err) {
                console.error('Search error:', err);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [query, authenticatedFetch]);

    // Get all results as flat array
    const allResults = [...results.subjects, ...results.resources];

    // Handle keyboard navigation
    const handleKeyDown = useCallback((e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => Math.min(prev + 1, allResults.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => Math.max(prev - 1, 0));
        } else if (e.key === 'Enter' && allResults[selectedIndex]) {
            e.preventDefault();
            handleResultClick(allResults[selectedIndex]);
        } else if (e.key === 'Escape') {
            onClose();
        }
    }, [allResults, selectedIndex, onClose]);

    // Handle result click
    const handleResultClick = (result) => {
        if (result.type === 'subject') {
            navigate(`/subjects?id=${result._id}`);
        } else {
            navigate(`/resources?id=${result._id}`);
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative w-full max-w-2xl bg-[#13131f] light-modal border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                {/* Search Input */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
                    <Search size={20} className="text-white/40 flex-shrink-0" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Search subjects, resources, topics..."
                        className="flex-1 bg-transparent text-white placeholder-white/30 outline-none focus:outline-none focus:ring-0 border-none text-lg"
                    />
                    {loading && <Loader size={20} className="text-indigo-400 animate-spin" />}
                    <div className="flex items-center gap-1 px-2 py-1 bg-white/5 rounded-lg border border-white/10">
                        <span className="text-xs text-white/40">ESC</span>
                    </div>
                </div>

                {/* Results */}
                <div className="max-h-[400px] overflow-y-auto">
                    {query.length >= 2 ? (
                        allResults.length > 0 ? (
                            <div className="p-2">
                                {/* Subjects */}
                                {results.subjects.length > 0 && (
                                    <div className="mb-2">
                                        <p className="px-3 py-2 text-xs font-semibold text-white/40 uppercase tracking-wider">Subjects</p>
                                        {results.subjects.map((subject, i) => {
                                            const globalIndex = i;
                                            return (
                                                <button
                                                    key={subject._id}
                                                    onClick={() => handleResultClick(subject)}
                                                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${selectedIndex === globalIndex
                                                        ? 'bg-indigo-500/20 border border-indigo-500/30'
                                                        : 'hover:bg-white/5 border border-transparent'
                                                        }`}
                                                >
                                                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                                                        <BookOpen size={18} className="text-indigo-400" />
                                                    </div>
                                                    <div className="flex-1 text-left min-w-0">
                                                        <p className="font-medium text-white truncate">{subject.name}</p>
                                                        <p className="text-xs text-white/40">{subject.code} • {subject.year} • {subject.semester}</p>
                                                    </div>
                                                    <ArrowRight size={16} className="text-white/20" />
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Resources */}
                                {results.resources.length > 0 && (
                                    <div>
                                        <p className="px-3 py-2 text-xs font-semibold text-white/40 uppercase tracking-wider">Resources</p>
                                        {results.resources.map((resource, i) => {
                                            const globalIndex = results.subjects.length + i;
                                            return (
                                                <button
                                                    key={resource._id}
                                                    onClick={() => handleResultClick(resource)}
                                                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${selectedIndex === globalIndex
                                                        ? 'bg-indigo-500/20 border border-indigo-500/30'
                                                        : 'hover:bg-white/5 border border-transparent'
                                                        }`}
                                                >
                                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                                                        <FileText size={18} className="text-emerald-400" />
                                                    </div>
                                                    <div className="flex-1 text-left min-w-0">
                                                        <p className="font-medium text-white truncate">{resource.title}</p>
                                                        <p className="text-xs text-white/40 capitalize">{resource.category} • {resource.subject}</p>
                                                    </div>
                                                    <ArrowRight size={16} className="text-white/20" />
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="p-8 text-center">
                                <Search size={40} className="text-white/10 mx-auto mb-3" />
                                <p className="text-white/50">No results found for "{query}"</p>
                                <p className="text-white/30 text-sm mt-1">Try a different search term</p>
                            </div>
                        )
                    ) : (
                        <div className="p-6">
                            <p className="text-white/40 text-sm text-center mb-4">Type at least 2 characters to search</p>
                            <div className="flex flex-wrap justify-center gap-2">
                                {['Notes', 'Exam', 'Unit 1', 'Engineering'].map(term => (
                                    <button
                                        key={term}
                                        onClick={() => setQuery(term)}
                                        className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-white/60 transition-colors"
                                    >
                                        {term}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-4 py-3 border-t border-white/10 bg-white/[0.02]">
                    <div className="flex items-center gap-4 text-xs text-white/30">
                        <span className="flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[10px]">↑</kbd>
                            <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[10px]">↓</kbd>
                            Navigate
                        </span>
                        <span className="flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[10px]">↵</kbd>
                            Open
                        </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-white/30">
                        <Command size={12} />
                        <span>K to open anytime</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Hook to use search modal with keyboard shortcut
export const useSearchModal = () => {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e) => {
            // Ctrl+K or Cmd+K to open search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(true);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    return { isOpen, setIsOpen, open: () => setIsOpen(true), close: () => setIsOpen(false) };
};

export default SearchModal;
