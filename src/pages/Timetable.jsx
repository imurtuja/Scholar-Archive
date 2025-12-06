import React, { useState, useEffect, useRef } from 'react';
import { Clock, CheckCircle, Circle, Plus, X, Trash2, Calendar, ChevronDown, BookOpen } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';
import CustomDatePicker from '../components/CustomDatePicker';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import usePageTitle from '../hooks/usePageTitle';

// Subject Select Component with custom dropdown
const SubjectSelect = ({ subjects, value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
    const ref = useRef(null);
    const buttonRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            const dropdownHeight = Math.min((subjects.length + 1) * 44 + 16, 280);
            const shouldOpenUp = spaceBelow < dropdownHeight && rect.top > dropdownHeight;
            setDropdownPos({
                top: shouldOpenUp ? rect.top - dropdownHeight - 8 : rect.bottom + 8,
                left: rect.left,
                width: rect.width
            });
        }
    }, [isOpen, subjects.length]);

    return (
        <div ref={ref}>
            <button
                ref={buttonRef}
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full h-12 px-4 bg-[#1a1a2e] border border-white/10 rounded-xl text-left focus:outline-none focus:border-indigo-500/50 transition-all flex items-center justify-between ${value ? 'text-white' : 'text-white/30'}`}
            >
                <span className="truncate">{value || 'Select Subject'}</span>
                <ChevronDown size={16} className={`text-white/40 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div
                    className="fixed py-2 bg-[#1a1a2e] border border-white/10 rounded-xl shadow-2xl max-h-[280px] overflow-y-auto"
                    style={{ top: dropdownPos.top, left: dropdownPos.left, width: dropdownPos.width, zIndex: 9999 }}
                >
                    {subjects.map((s) => (
                        <button
                            key={s._id}
                            type="button"
                            onClick={() => { onChange(s.name); setIsOpen(false); }}
                            className={`w-full px-4 py-2.5 text-left hover:bg-white/5 text-sm flex items-center gap-3 ${value === s.name ? 'text-indigo-400 bg-indigo-500/10' : 'text-white/70'}`}
                        >
                            <BookOpen size={14} className="text-white/30" />
                            <div>
                                <div>{s.name}</div>
                                <div className="text-xs text-white/30">{s.year} • {s.semester}</div>
                            </div>
                        </button>
                    ))}
                    <button
                        type="button"
                        onClick={() => { onChange('__custom__'); setIsOpen(false); }}
                        className="w-full px-4 py-2.5 text-left hover:bg-white/5 text-sm text-indigo-400 border-t border-white/10 mt-1"
                    >
                        + Add Custom Subject
                    </button>
                </div>
            )}
        </div>
    );
};

// Year/Semester Select Component
const YearSemesterSelect = ({ label, value, onChange, options, placeholder, displaySuffix = '' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
    const ref = useRef(null);
    const buttonRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            const dropdownHeight = options.length * 44 + 16;
            const shouldOpenUp = spaceBelow < dropdownHeight && rect.top > dropdownHeight;
            setDropdownPos({
                top: shouldOpenUp ? rect.top - dropdownHeight - 8 : rect.bottom + 8,
                left: rect.left,
                width: rect.width
            });
        }
    }, [isOpen, options.length]);

    const displayValue = value ? (displaySuffix ? `${value}${displaySuffix}` : value) : '';

    return (
        <div ref={ref}>
            <label className="block text-sm font-medium text-white/60 mb-2">{label}</label>
            <button
                ref={buttonRef}
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full h-12 px-4 bg-[#1a1a2e] border border-white/10 rounded-xl text-left focus:outline-none focus:border-indigo-500/50 transition-all flex items-center justify-between ${value ? 'text-white' : 'text-white/30'}`}
            >
                <span className="truncate">{displayValue || placeholder}</span>
                <ChevronDown size={16} className={`text-white/40 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div
                    className="fixed py-2 bg-[#1a1a2e] border border-white/10 rounded-xl shadow-2xl overflow-y-auto"
                    style={{ top: dropdownPos.top, left: dropdownPos.left, width: dropdownPos.width, zIndex: 9999 }}
                >
                    {options.map((opt, i) => (
                        <button
                            key={i}
                            type="button"
                            onClick={() => { onChange(opt); setIsOpen(false); }}
                            className={`w-full px-4 py-2.5 text-left hover:bg-white/5 text-sm ${value === opt ? 'text-indigo-400 bg-indigo-500/10' : 'text-white/70'}`}
                        >
                            {displaySuffix ? `${opt}${displaySuffix}` : opt}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const Timetable = () => {
    const { logout } = useAuth();
    const toast = useToast();
    const [exams, setExams] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newExam, setNewExam] = useState({
        subject: '',
        date: '',
        time: '',
        year: '',
        semester: ''
    });

    const [subjects, setSubjects] = useState([]);
    const [isCustomSubject, setIsCustomSubject] = useState(false);

    // Helper to get day name from exam date
    const getExamDayName = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' });
    };
    usePageTitle('Exam Timetable');

    useEffect(() => {
        fetchExams();
        fetchSubjects();
    }, []);

    const fetchSubjects = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/subjects', {
                headers: { 'x-auth-token': token }
            });
            if (res.ok) {
                const data = await res.json();
                setSubjects(data);
            }
        } catch (error) {
            console.error('Error fetching subjects:', error);
        }
    };

    const fetchExams = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/timetable', {
                headers: { 'x-auth-token': token }
            });

            if (res.status === 401) {
                logout();
                return;
            }

            const data = await res.json();
            if (Array.isArray(data)) setExams(data);
        } catch (error) {
            console.error('Error fetching exams:', error);
        }
    };

    const handleAddExam = async (e) => {
        e.preventDefault();

        // Frontend validation with specific error messages
        const missingFields = [];
        if (!newExam.subject) missingFields.push('Subject');
        if (!newExam.date) missingFields.push('Date');
        if (!newExam.time) missingFields.push('Time');
        if (!newExam.year) missingFields.push('Year');
        if (!newExam.semester) missingFields.push('Semester');

        if (missingFields.length > 0) {
            toast.warning(`Please fill in: ${missingFields.join(', ')}`);
            return;
        }

        console.log('[DEBUG] Submitting exam:', newExam);

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/timetable', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify(newExam)
            });

            if (res.status === 401) {
                logout();
                return;
            }

            if (res.ok) {
                const added = await res.json();
                setExams([...exams, added].sort((a, b) => new Date(a.date) - new Date(b.date)));
                setIsModalOpen(false);
                setNewExam({ subject: '', date: '', time: '', year: '', semester: '' });
                setIsCustomSubject(false);
                toast.success('Exam scheduled successfully!');
            } else {
                const err = await res.json();
                toast.error(`Failed to add exam: ${err.message}`);
            }
        } catch (error) {
            console.error('Error adding exam:', error);
            toast.error('Error adding exam. Please try again.');
        }
    };

    const [deleteModal, setDeleteModal] = useState({ isOpen: false, examId: null });

    const handleDeleteClick = (id) => {
        setDeleteModal({ isOpen: true, examId: id });
    };

    const handleConfirmDelete = async () => {
        const id = deleteModal.examId;
        if (!id) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/timetable/${id}`, {
                method: 'DELETE',
                headers: { 'x-auth-token': token }
            });

            if (res.status === 401) {
                logout();
                return;
            }
            if (res.ok) {
                setExams(exams.filter(e => e._id !== id));
                setDeleteModal({ isOpen: false, examId: null });
                toast.success('Exam deleted successfully!');
            } else {
                const err = await res.json();
                toast.error(`Failed to delete exam: ${err.message}`);
            }
        } catch (error) {
            console.error('Error deleting exam:', error);
            toast.error('Error deleting exam. Please try again.');
        }
    };

    const toggleComplete = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/timetable/${id}/toggle`, {
                method: 'PUT',
                headers: { 'x-auth-token': token }
            });

            if (res.status === 401) {
                logout();
                return;
            }
            if (res.ok) {
                setExams(exams.map(exam =>
                    exam._id === id ? { ...exam, completed: !exam.completed } : exam
                ));
            }
        } catch (error) {
            console.error('Error toggling complete:', error);
        }
    };

    const formatTime = (timeStr) => {
        if (!timeStr) return '';
        if (timeStr.toLowerCase().includes('m')) return timeStr;

        const [hours, minutes] = timeStr.split(':');
        const h = parseInt(hours, 10);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        return `${h12}:${minutes} ${ampm}`;
    };

    return (
        <div className="container mx-auto max-w-4xl animate-in fade-in duration-500 px-4 py-4 lg:p-6">
            {/* Header - Stack on mobile */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 lg:mb-8">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-1 lg:mb-2">Exam Timetable</h1>
                    <p className="text-gray-500 text-sm lg:text-base">Keep track of your upcoming examinations.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center justify-center gap-2 px-4 lg:px-6 py-2.5 bg-primary text-white rounded-xl lg:rounded-full font-semibold shadow-lg shadow-primary/30 hover:bg-primary-hover transition-all text-sm lg:text-base w-full sm:w-auto"
                >
                    <Plus size={18} /> Add Exam
                </button>
            </div>

            <div className="space-y-3 lg:space-y-4">
                {exams.length > 0 ? (
                    exams.map((exam) => (
                        <div key={exam._id} className={`bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 ${exam.completed ? 'opacity-60' : ''}`}>
                            {/* Mobile Layout - Stacked */}
                            <div className="flex lg:hidden">
                                <div className="w-16 bg-gray-50 flex flex-col items-center justify-center py-4 border-r border-gray-100 flex-shrink-0">
                                    <span className="text-[10px] font-bold text-indigo-500 uppercase">{getExamDayName(exam.date)}</span>
                                    <span className="text-xl font-bold text-gray-800">{new Date(exam.date).getDate()}</span>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase">{new Date(exam.date).toLocaleString('default', { month: 'short' })}</span>
                                </div>
                                <div className="flex-1 p-3 min-w-0">
                                    <h3 className={`text-sm font-bold text-gray-800 mb-1 ${exam.completed ? 'line-through text-gray-400' : ''}`}>{exam.subject}</h3>
                                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-gray-500">
                                        <span className="flex items-center gap-1"><Clock size={11} className="text-primary" /> {formatTime(exam.time)}</span>
                                        <span className="text-gray-300">•</span>
                                        <span>{exam.year} Year</span>
                                        <span className="text-gray-300">•</span>
                                        <span>{exam.semester}</span>
                                    </div>
                                </div>
                                {/* Vertical action buttons */}
                                <div className="flex flex-col gap-1 p-2 border-l border-gray-100">
                                    <button
                                        onClick={() => toggleComplete(exam._id)}
                                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${exam.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}
                                    >
                                        {exam.completed ? <CheckCircle size={16} /> : <Circle size={16} />}
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClick(exam._id)}
                                        className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>

                            {/* Desktop Layout - Horizontal */}
                            <div className="hidden lg:flex">
                                <div className="w-24 bg-gray-50 flex flex-col items-center justify-center border-r border-gray-100 group-hover:bg-blue-50/50 transition-colors py-4">
                                    <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider">{getExamDayName(exam.date)}</span>
                                    <span className="text-2xl font-bold text-gray-800">{new Date(exam.date).getDate()}</span>
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{new Date(exam.date).toLocaleString('default', { month: 'short' })}</span>
                                </div>
                                <div className="flex-1 p-5 flex items-center justify-between">
                                    <div>
                                        <h3 className={`text-lg font-bold text-gray-800 mb-1 ${exam.completed ? 'line-through text-gray-400' : ''}`}>{exam.subject}</h3>
                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <span className="flex items-center gap-1.5"><Clock size={14} className="text-primary" /> {formatTime(exam.time)}</span>
                                            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                            <span>{exam.year} Year • {exam.semester}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => toggleComplete(exam._id)}
                                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${exam.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400 hover:bg-primary/10 hover:text-primary'}`}
                                            title={exam.completed ? "Mark as Incomplete" : "Mark as Complete"}
                                        >
                                            {exam.completed ? <CheckCircle size={20} /> : <Circle size={20} />}
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(exam._id)}
                                            className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                                            title="Delete Exam"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8 lg:py-12 bg-white rounded-2xl border border-dashed border-gray-200">
                        <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 lg:mb-4">
                            <Calendar size={24} className="lg:w-8 lg:h-8 text-gray-300" />
                        </div>
                        <h3 className="text-base lg:text-lg font-semibold text-gray-600">No exams scheduled</h3>
                        <p className="text-gray-400 text-xs lg:text-sm mt-1">Click "Add Exam" to create your schedule.</p>
                    </div>
                )}
            </div>

            {/* Add Exam Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setIsModalOpen(false)}>
                    <div className="bg-[#13131f] border border-white/10 rounded-2xl shadow-2xl w-full max-w-md overflow-visible" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-white/10 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-white">Add New Exam</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-white/40 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleAddExam} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <CustomDatePicker
                                    label="Date"
                                    value={newExam.date}
                                    onChange={(date) => setNewExam({ ...newExam, date })}
                                    placeholder="Select Date"
                                />
                                <div>
                                    <label className="block text-sm font-medium text-white/60 mb-2">Time</label>
                                    <div className="flex gap-2">
                                        {['10:00', '14:00'].map((time) => (
                                            <button
                                                key={time}
                                                type="button"
                                                onClick={() => setNewExam({ ...newExam, time })}
                                                className={`flex-1 h-12 rounded-xl text-sm font-medium transition-all ${newExam.time === time
                                                    ? 'bg-indigo-500 text-white'
                                                    : 'bg-[#1a1a2e] border border-white/10 text-white/60 hover:border-white/20'
                                                    }`}
                                            >
                                                {time === '10:00' ? '10 AM' : '2 PM'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-white/60 mb-2">Subject</label>
                                {!isCustomSubject ? (
                                    <SubjectSelect
                                        subjects={subjects}
                                        value={newExam.subject}
                                        onChange={(subjectName) => {
                                            if (subjectName === '__custom__') {
                                                setIsCustomSubject(true);
                                                setNewExam({ ...newExam, subject: '', year: '', semester: '' });
                                            } else {
                                                const selectedSubject = subjects.find(s => s.name === subjectName);
                                                if (selectedSubject) {
                                                    const yearMatch = selectedSubject.year?.match(/(\d)/);
                                                    const yearNum = yearMatch ? yearMatch[1] : '';
                                                    const yearSuffix = yearNum === '1' ? 'st' : yearNum === '2' ? 'nd' : yearNum === '3' ? 'rd' : 'th';
                                                    setNewExam({
                                                        ...newExam,
                                                        subject: subjectName,
                                                        year: yearNum ? `${yearNum}${yearSuffix}` : '',
                                                        semester: selectedSubject.semester || ''
                                                    });
                                                } else {
                                                    setNewExam({ ...newExam, subject: subjectName });
                                                }
                                            }
                                        }}
                                    />
                                ) : (
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            required
                                            autoFocus
                                            className="flex-1 h-12 px-4 bg-[#1a1a2e] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 transition-all"
                                            value={newExam.subject}
                                            onChange={(e) => setNewExam({ ...newExam, subject: e.target.value })}
                                            placeholder="Enter subject name"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setIsCustomSubject(false)}
                                            className="px-4 h-12 text-white/50 hover:text-white bg-[#1a1a2e] border border-white/10 rounded-xl transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <YearSemesterSelect
                                    label="Year"
                                    value={newExam.year}
                                    onChange={(val) => setNewExam({ ...newExam, year: val })}
                                    options={['1st', '2nd', '3rd', '4th']}
                                    placeholder="Select Year"
                                    displaySuffix=" Year"
                                />
                                <YearSemesterSelect
                                    label="Semester"
                                    value={newExam.semester}
                                    onChange={(val) => setNewExam({ ...newExam, semester: val })}
                                    options={['1st Semester', '2nd Semester']}
                                    placeholder="Select Semester"
                                />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 h-12 text-white/70 font-medium border border-white/10 hover:bg-white/5 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all"
                                >
                                    Add Exam
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, examId: null })}
                onConfirm={handleConfirmDelete}
                title="Delete Exam"
                message="Are you sure you want to delete this exam? This action cannot be undone."
            />
        </div>
    );
};

export default Timetable;
