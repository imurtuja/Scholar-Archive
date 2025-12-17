import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronDown, ChevronRight, BookOpen, FileText, Upload, Loader, Trash2, X, Plus, GraduationCap, ExternalLink, Edit2, Share2 } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';
import ShareModal from '../components/ShareModal';
import * as pdfjsLib from 'pdfjs-dist';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import usePageTitle from '../hooks/usePageTitle';

import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

// Custom Form Select Component
const FormSelect = ({ label, name, value, onChange, options, placeholder, required = false }) => {
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
            const dropdownHeight = Math.min(options.length * 44 + 16, 200);
            const shouldOpenUp = spaceBelow < dropdownHeight && rect.top > dropdownHeight;
            setDropdownPos({
                top: shouldOpenUp ? rect.top - dropdownHeight - 8 : rect.bottom + 8,
                left: rect.left,
                width: rect.width
            });
        }
    }, [isOpen, options.length]);

    return (
        <div ref={ref}>
            <label className="block text-sm font-medium text-white/70 mb-2">{label}</label>
            <button
                ref={buttonRef}
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full h-12 px-4 bg-[#1a1a2e] border border-white/10 rounded-xl text-left focus:outline-none focus:border-indigo-500/50 transition-all flex items-center justify-between ${value ? 'text-white' : 'text-white/30'}`}
            >
                <span className="truncate">{value || placeholder}</span>
                <ChevronDown size={16} className={`text-white/40 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div
                    className="fixed py-2 bg-[#1a1a2e] border border-white/10 rounded-xl shadow-2xl max-h-[200px] overflow-y-auto"
                    style={{ top: dropdownPos.top, left: dropdownPos.left, width: dropdownPos.width, zIndex: 9999 }}
                >
                    {options.map((opt, i) => (
                        <button
                            key={i}
                            type="button"
                            onClick={() => {
                                onChange({ target: { name, value: opt.value } });
                                setIsOpen(false);
                            }}
                            className={`w-full px-4 py-2.5 text-left hover:bg-white/5 text-sm ${value === opt.value ? 'text-indigo-400 bg-indigo-500/10' : 'text-white/70'}`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

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

const ResourceSection = ({ title, resources, onAddResource, onDeleteResource }) => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newLink, setNewLink] = useState('');

    const handleAdd = () => {
        if (newTitle && newLink) {
            onAddResource({ title: newTitle, link: newLink });
            setNewTitle('');
            setNewLink('');
            setIsAddModalOpen(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-white">{title}</h3>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold flex items-center gap-2 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all"
                >
                    <Plus size={18} /> Add New
                </button>
            </div>

            <div className="grid grid-cols-1 gap-5">
                {resources.map(res => (
                    <div key={res._id} className="bg-[#13131f] border border-white/10 rounded-2xl overflow-hidden group hover:border-white/20 transition-all">
                        <div className="p-4 border-b border-white/10 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                    <FileText size={20} />
                                </div>
                                <h4 className="font-semibold text-white">{res.title}</h4>
                            </div>
                            <button
                                onClick={() => onDeleteResource(res._id)}
                                className="p-2 text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>

                        <div className="w-full h-[700px] bg-[#0a0a14]">
                            <iframe
                                src={getEmbedUrl(res.link)}
                                className="w-full h-full border-none"
                                allow="autoplay"
                                title={res.title}
                            ></iframe>
                        </div>
                    </div>
                ))}
            </div>

            {resources.length === 0 && (
                <div className="text-center py-16 border-2 border-dashed border-white/10 rounded-2xl bg-[#13131f]">
                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white/30">
                        <Upload size={32} />
                    </div>
                    <h3 className="text-lg font-semibold text-white/70 mb-1">No resources yet</h3>
                    <p className="text-white/40">Click the "Add New" button to upload materials.</p>
                </div>
            )}

            {isAddModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)}>
                    <div className="bg-[#13131f] border border-white/10 rounded-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white">Add New {title}</h3>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-white/40 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-2">Title</label>
                                <input
                                    type="text"
                                    placeholder={`e.g., Unit 1 ${title}`}
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    className="w-full h-12 px-4 bg-[#1a1a2e] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-2">Google Drive Link</label>
                                <input
                                    type="text"
                                    placeholder="Paste the shareable link here"
                                    value={newLink}
                                    onChange={(e) => setNewLink(e.target.value)}
                                    className="w-full h-12 px-4 bg-[#1a1a2e] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="px-5 py-2.5 rounded-xl border border-white/10 text-white/70 font-medium hover:bg-white/5 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAdd}
                                    className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all"
                                >
                                    Add Resource
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


const Subjects = () => {
    const { user, authenticatedFetch } = useAuth();
    const toast = useToast();
    const [searchParams] = useSearchParams();
    const [subjects, setSubjects] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [activeTab, setActiveTab] = useState('syllabus');
    const [isUploading, setIsUploading] = useState(false);
    const [resources, setResources] = useState([]);
    const [isAddSubjectModalOpen, setIsAddSubjectModalOpen] = useState(false);
    const [isEditSubjectModalOpen, setIsEditSubjectModalOpen] = useState(false);
    const [shareSubject, setShareSubject] = useState(null);

    // Dynamic page title based on current state
    const getPageTitle = () => {
        if (isAddSubjectModalOpen) return 'Add New Subject';
        if (isEditSubjectModalOpen) return 'Edit Subject';
        if (selectedSubject) return selectedSubject.name;
        return 'Academic Subjects';
    };
    usePageTitle(getPageTitle());
    const [subjectFormData, setSubjectFormData] = useState({
        name: '',
        code: '',
        credits: '',
        year: '',
        semester: '',
        order: '',
        syllabus: null
    });
    const [editFormData, setEditFormData] = useState({
        name: '',
        code: '',
        credits: '',
        year: '',
        semester: '',
        order: ''
    });

    const [expandedYear, setExpandedYear] = useState(null);
    const [expandedSemester, setExpandedSemester] = useState(null);

    const toTitleCase = (str) => {
        return str.replace(/\w\S*/g, (txt) => {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    };

    const handleSubjectFormChange = (e) => {
        let value = e.target.value;
        if (e.target.name === 'name') {
            value = toTitleCase(value);
        }
        setSubjectFormData({ ...subjectFormData, [e.target.name]: value });
    };

    const getOrdinal = (n) => {
        const s = ["th", "st", "nd", "rd"];
        const v = n % 100;
        return s[(v - 20) % 10] || s[v] || s[0];
    };

    const handleCreateSubject = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const dataToSend = {
                ...subjectFormData,
                order: subjectFormData.order ? parseInt(subjectFormData.order) : 0
            };
            const res = await fetch('/api/subjects', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify(dataToSend)
            });
            const newSubject = await res.json();
            await fetchSubjects(); // Refetch to get proper ordering
            setSelectedSubject(newSubject);
            setIsAddSubjectModalOpen(false);
            setSubjectFormData({ name: '', code: '', credits: '', year: '', semester: '', order: '', syllabus: null });
        } catch (error) {
            console.error('Error creating subject:', error);
        }
    };

    const handleEditClick = () => {
        if (selectedSubject) {
            setEditFormData({
                name: selectedSubject.name || '',
                code: selectedSubject.code || '',
                credits: selectedSubject.credits || '',
                year: selectedSubject.year || '',
                semester: selectedSubject.semester || '',
                order: selectedSubject.order || ''
            });
            setIsEditSubjectModalOpen(true);
        }
    };

    const handleEditFormChange = (e) => {
        let value = e.target.value;
        if (e.target.name === 'name') {
            value = toTitleCase(value);
        }
        setEditFormData({ ...editFormData, [e.target.name]: value });
    };

    const handleUpdateSubject = async (e) => {
        e.preventDefault();
        if (!selectedSubject) return;

        try {
            const dataToSend = {
                ...editFormData,
                order: editFormData.order ? parseInt(editFormData.order) : 0
            };
            const res = await authenticatedFetch(`/api/subjects/${selectedSubject._id}`, {
                method: 'PUT',
                body: JSON.stringify(dataToSend)
            });

            if (res.ok) {
                const updatedSubject = await res.json();
                await fetchSubjects();
                setSelectedSubject(updatedSubject);
                setIsEditSubjectModalOpen(false);
            }
        } catch (error) {
            console.error('Error updating subject:', error);
        }
    };

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const handleDeleteClick = () => {
        if (selectedSubject) setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedSubject) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/subjects/${selectedSubject._id}`, {
                method: 'DELETE',
                headers: { 'x-auth-token': token }
            });

            if (res.ok) {
                setSubjects(subjects.filter(s => s._id !== selectedSubject._id));
                setSelectedSubject(null);
                setIsDeleteModalOpen(false);
            } else {
                const err = await res.json();
                toast.error('Failed to delete subject: ' + (err.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error deleting subject:', error);
            toast.error('Error deleting subject. Please try again.');
        }
    };

    useEffect(() => {
        fetchSubjects();
    }, []);

    // Auto-select subject from URL parameter (for search navigation)
    useEffect(() => {
        const subjectId = searchParams.get('id');
        if (subjectId && subjects.length > 0 && !selectedSubject) {
            const subject = subjects.find(s => s._id === subjectId);
            if (subject) {
                setSelectedSubject(subject);
                // Expand the year and semester in sidebar
                setExpandedYear(subject.year);
                setExpandedSemester(`${subject.year}-${subject.semester}`);
            }
        }
    }, [subjects, searchParams]);

    useEffect(() => {
        if (selectedSubject) {
            fetchResources();
        } else {
            setResources([]);
        }
    }, [selectedSubject]);

    const fetchSubjects = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const res = await fetch('/api/subjects', {
                headers: { 'x-auth-token': token }
            });

            if (res.status === 401) {
                localStorage.removeItem('token');
                window.location.href = '/login';
                return;
            }

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }

            const data = await res.json();
            if (Array.isArray(data)) {
                setSubjects(data);
            } else {
                setSubjects([]);
            }
        } catch (error) {
            console.error('Error fetching subjects:', error);
            setSubjects([]);
        }
    };

    const fetchResources = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/resources', {
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();
            setResources(data.filter(r => r.subject === selectedSubject._id));
        } catch (error) {
            console.error('Error fetching resources:', error);
        }
    };

    const handleAddResource = async (resourceData) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/resources', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({
                    subject: selectedSubject._id,
                    title: resourceData.title,
                    link: resourceData.link,
                    type: 'pdf',
                    category: activeTab
                })
            });
            const newResource = await res.json();
            setResources([newResource, ...resources]);
        } catch (error) {
            console.error('Error adding resource:', error);
        }
    };

    const handleDeleteResource = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await fetch(`/api/resources/${id}`, {
                method: 'DELETE',
                headers: { 'x-auth-token': token }
            });
            setResources(resources.filter(r => r._id !== id));
        } catch (error) {
            console.error('Error deleting resource:', error);
        }
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (!apiKey) {
            toast.error('Gemini API Key not found! Please add VITE_GEMINI_API_KEY to your .env file.');
            return;
        }

        setIsUploading(true);

        try {
            const arrayBuffer = await file.arrayBuffer();
            let fullText = '';
            let imageParts = [];
            let useImages = false;

            try {
                // Try to load and extract text from PDF
                const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

                // Extract text from all pages
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();

                    // Better text extraction - preserve structure
                    let pageText = '';
                    let lastY = null;

                    textContent.items.forEach(item => {
                        // Add newline if Y position changed significantly (new line)
                        if (lastY !== null && Math.abs(item.transform[5] - lastY) > 5) {
                            pageText += '\n';
                        }
                        pageText += item.str + ' ';
                        lastY = item.transform[5];
                    });

                    fullText += pageText + '\n\n';
                }

                // Clean up extracted text
                fullText = fullText
                    .replace(/\s+/g, ' ')
                    .replace(/\n\s*\n/g, '\n')
                    .trim();

                // Check if extracted text is meaningful (more than 200 chars of actual content)
                const meaningfulChars = fullText.replace(/\s/g, '').length;

                if (meaningfulChars < 200) {
                    console.log('Text extraction insufficient, using image OCR...');
                    useImages = true;

                    // Convert pages to images for OCR
                    const maxPages = Math.min(pdf.numPages, 10); // Limit to 10 pages for performance
                    for (let i = 1; i <= maxPages; i++) {
                        const page = await pdf.getPage(i);
                        const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better OCR
                        const canvas = document.createElement('canvas');
                        const context = canvas.getContext('2d');
                        canvas.height = viewport.height;
                        canvas.width = viewport.width;

                        await page.render({ canvasContext: context, viewport: viewport }).promise;
                        const base64Data = canvas.toDataURL('image/jpeg', 0.9).split(',')[1];

                        imageParts.push({
                            inlineData: {
                                data: base64Data,
                                mimeType: "image/jpeg",
                            },
                        });
                    }
                }
            } catch (pdfError) {
                console.error('PDF parsing error:', pdfError);
                toast.error('Could not parse PDF file. Please try a different file.');
                setIsUploading(false);
                return;
            }

            // Enhanced AI prompt for professional syllabus extraction
            const promptText = `You are an expert academic syllabus parser with deep knowledge of academic subjects.

TASK: Extract course syllabus information and identify individual topics using your academic knowledge.

CRITICAL RULES:
1. COURSE NAME: Extract EXACTLY as written - DO NOT add Roman numerals (I, II, III) or modify the name
2. Use your knowledge to identify what constitutes a complete, standalone academic topic
3. Each topic should be a single teachable concept that would typically be covered in 1-2 lectures

UNIT TITLE NAMING (VERY IMPORTANT):
- Many syllabi have units without proper names (e.g., "UNIT-I:" with no title, just content)
- If a unit has NO title or just "UNIT-I:", "UNIT I:", etc., YOU MUST generate a professional title
- Generate the title by analyzing the topics in that unit and creating a descriptive name
- Unit titles should be professional and concise (2-5 words), like:
  * "Introduction to Digital Systems" (not "UNIT 1: Introduction to Digital Systems")
  * "Big Data Fundamentals"
  * "Boolean Algebra and Logic Gates"
  * "MapReduce Programming Model"
- The title field should contain ONLY the descriptive name, NOT "UNIT X: Name"
- If unit already has a proper title like "UNIT-I: Introduction to OB", extract just "Introduction to OB"

TOPIC IDENTIFICATION (Use your academic knowledge):
- Identify discrete, teachable concepts - NOT mechanical text splitting
- A topic is a complete academic concept (e.g., "Crystal Field Theory", "Hardness of Water", "LCAO Method")
- DO NOT split related concepts that belong together
- DO merge fragments into complete topic names
- Topics should be 3-10 words each, professional and clear

EXAMPLES OF GOOD TOPIC EXTRACTION:
From: "Atomic and Molecular orbitals, Linear Combination of Atomic Orbitals (LCAO), molecular orbitals of diatomic molecules, molecular orbital energy level diagrams"
Extract as:
- "Atomic and Molecular Orbitals"
- "Linear Combination of Atomic Orbitals (LCAO)"
- "Molecular Orbitals of Diatomic Molecules"
- "Molecular Orbital Energy Level Diagrams"

EXAMPLE OF UNIT TITLE GENERATION:
If PDF shows: "UNIT-I: Digital Systems, Binary Numbers, Number base conversions, Octal, Hexadecimal..."
Generate unit title: "Digital Systems and Number Conversions" (NOT "UNIT-I:" or empty string)

YEAR AND SEMESTER FORMAT (CRITICAL):
- YEAR must be EXACTLY one of: "1st Year", "2nd Year", "3rd Year", "4th Year"
- SEMESTER must be EXACTLY one of: "1st Semester", "2nd Semester"
- Convert any format found in PDF to these exact values:
  * "I B.TECH" or "I YEAR" or "1st" → "1st Year"
  * "II B.TECH" or "II YEAR" or "2nd" → "2nd Year"
  * "III B.TECH" or "III YEAR" or "3rd" → "3rd Year"
  * "IV B.TECH" or "IV YEAR" or "4th" → "4th Year"
  * "I SEMESTER" or "1st Sem" or "Odd Semester" → "1st Semester"
  * "II SEMESTER" or "2nd Sem" or "Even Semester" → "2nd Semester"
- NEVER output "IV B. TECH-I SEMESTER" or similar - always convert to proper format

REQUIRED JSON:
{
  "courseName": "Exact Name From Document",
  "courseCode": "CODE",
  "credits": "4",
  "year": "4th Year",
  "semester": "1st Semester",
  "units": [{"unit": 1, "title": "Professional Unit Title", "topics": ["Topic 1", "Topic 2"], "materials": 0}]
}

${useImages ? 'Parse syllabus from images:' : `SYLLABUS:\n${fullText.substring(0, 35000)}`}`;

            // Prepare content for AI
            const contentParts = [promptText];
            if (useImages && imageParts.length > 0) {
                contentParts.push(...imageParts);
            }

            // Fallback logic for models
            // Priority: Flash Lite (efficient) -> 2.0 Flash -> 2.5 Flash -> Experimental
            const modelsToTry = [
                "gemini-2.0-flash-lite-preview-02-05", // Try specific lite preview first
                "gemini-2.0-flash-lite",                // Generic lite
                "gemini-2.0-flash",                     // Standard 2.0 (fallback)
                "gemini-2.5-flash",                     // New 2.5
                "gemini-exp-1206",                      // Experimental (often good quotas)
                "gemini-2.0-flash-exp"                  // Older experimental
            ];
            let text = null;
            let lastError = null;

            for (const modelName of modelsToTry) {
                try {
                    console.log(`Attempting to generate with model: ${modelName}`);
                    const genAI = new GoogleGenerativeAI(apiKey);
                    const model = genAI.getGenerativeModel({
                        model: modelName,
                        generationConfig: {
                            temperature: 0,
                            topP: 1,
                            topK: 1
                        }
                    });

                    const result = await model.generateContent(contentParts);
                    const response = await result.response;
                    text = response.text();

                    if (text) break; // Success!
                } catch (err) {
                    console.warn(`Model ${modelName} failed:`, err.message);
                    lastError = err;
                    // If it's not a quota error or 429, maybe don't retry? 
                    // But usually trying another model is safe.
                    // Continue to next model
                }
            }

            if (!text) {
                // Debugging: List available models to console to help diagnose 404s
                try {
                    console.log("Fetching list of available models for debugging...");
                    const listModelsRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
                    const listModelsData = await listModelsRes.json();
                    const availableModels = listModelsData.models ? listModelsData.models.map(m => m.name.replace('models/', '')) : [];

                    console.log("AVAILABLE MODELS FOR THIS API KEY:", availableModels);
                    toast.error(`AI Models blocked. Available: ${availableModels.join(', ') || 'None'}`);
                } catch (debugErr) {
                    console.error("Failed to list models:", debugErr);
                }

                throw new Error(`All AI models failed. Last error: ${lastError?.message || 'Unknown error'}`);
            }

            // Clean up response - extract JSON
            text = text.replace(/```json/gi, '').replace(/```/g, '').trim();

            // Find JSON object in response
            const firstOpen = text.indexOf('{');
            const lastClose = text.lastIndexOf('}');

            if (firstOpen === -1 || lastClose === -1) {
                throw new Error('No valid JSON found in AI response');
            }

            text = text.substring(firstOpen, lastClose + 1);

            // Parse JSON
            let parsedData;
            try {
                parsedData = JSON.parse(text);
            } catch (parseError) {
                console.error('JSON parse error:', parseError);
                console.log('Raw text:', text);
                throw new Error('Failed to parse AI response as JSON');
            }

            // Validate and normalize year format
            if (parsedData.year) {
                const yearMatch = parsedData.year.match(/(\d)/);
                if (yearMatch) {
                    const yearNum = parseInt(yearMatch[1]);
                    parsedData.year = `${yearNum}${getOrdinal(yearNum)} Year`;
                }
            }

            // Validate and normalize semester format
            if (parsedData.semester) {
                const semMatch = parsedData.semester.match(/(\d)/);
                if (semMatch) {
                    const semNum = parseInt(semMatch[1]);
                    parsedData.semester = semNum === 1 ? '1st Semester' : '2nd Semester';
                }
            }

            // Update form data with extracted information
            setSubjectFormData(prev => ({
                ...prev,
                name: parsedData.courseName ? toTitleCase(parsedData.courseName) : prev.name,
                code: parsedData.courseCode || prev.code,
                credits: parsedData.credits || prev.credits,
                year: parsedData.year || prev.year,
                semester: parsedData.semester || prev.semester,
                syllabus: parsedData
            }));

            console.log('Syllabus extracted successfully:', parsedData);

        } catch (error) {
            console.error('Error parsing syllabus:', error);
            toast.error(`Failed to parse syllabus: ${error.message}. Please try again or use a different PDF.`);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="flex flex-col lg:flex-row lg:h-[calc(100vh-72px)]">
            {/* Left Pane: Subject Navigation - Full width on mobile, sidebar on desktop */}
            <div className="w-full lg:w-[280px] flex-shrink-0 p-2 lg:p-4 lg:overflow-y-auto">
                <div className="bg-[#13131f] border border-white/10 rounded-2xl">
                    {/* Header */}
                    <div className="px-4 py-3 flex items-center justify-between border-b border-white/10">
                        <h2 className="text-sm font-semibold text-white">Subjects</h2>
                        <button
                            onClick={() => setIsAddSubjectModalOpen(true)}
                            className="w-7 h-7 bg-indigo-500 hover:bg-indigo-400 text-white rounded-lg flex items-center justify-center transition-colors"
                            title="Add New Subject"
                        >
                            <Plus size={14} />
                        </button>
                    </div>

                    {/* Subject Tree */}
                    <div className="py-3">
                        {(() => {
                            const duration = user?.durationYears || 4;
                            const structure = {};
                            for (let y = 1; y <= duration; y++) {
                                const yearLabel = `${y}${getOrdinal(y)} Year`;
                                structure[yearLabel] = {};
                                for (let s = 1; s <= 2; s++) {
                                    structure[yearLabel][`${s}${getOrdinal(s)} Semester`] = [];
                                }
                            }

                            subjects.forEach(subject => {
                                const y = subject.year;
                                const s = subject.semester;
                                if (structure[y] && structure[y][s]) {
                                    structure[y][s].push(subject);
                                } else {
                                    if (!structure['Other']) structure['Other'] = {};
                                    if (!structure['Other']['General']) structure['Other']['General'] = [];
                                    structure['Other']['General'].push(subject);
                                }
                            });

                            return Object.entries(structure).map(([year, semesters]) => (
                                <div key={year} className="mb-5">
                                    {/* Year Label */}
                                    <div className="px-5 pb-2 text-xs font-semibold text-white/40 uppercase tracking-wide">
                                        {year}
                                    </div>

                                    {/* Semesters */}
                                    {Object.entries(semesters).map(([semester, semesterSubjects]) => {
                                        const semesterKey = `${year}-${semester}`;
                                        const isExpanded = expandedSemester === semesterKey;
                                        const hasSubjects = semesterSubjects.length > 0;

                                        return (
                                            <div key={semester} className="mb-2">
                                                {/* Semester Row */}
                                                <div
                                                    onClick={() => setExpandedSemester(isExpanded ? null : semesterKey)}
                                                    className={`flex items-center gap-3 mx-3 px-3 py-2 cursor-pointer rounded-lg transition-all ${isExpanded ? 'bg-white/5' : 'hover:bg-white/5'}`}
                                                >
                                                    <ChevronRight size={14} className={`text-white/30 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
                                                    <span className={`text-sm flex-1 ${isExpanded ? 'text-white font-medium' : 'text-white/60'}`}>{semester}</span>
                                                    {hasSubjects && (
                                                        <span className="text-[11px] text-indigo-400 bg-indigo-500/15 px-1.5 py-0.5 rounded font-medium">{semesterSubjects.length}</span>
                                                    )}
                                                </div>

                                                {/* Subject List */}
                                                {isExpanded && hasSubjects && (
                                                    <div className="mt-1 space-y-1.5">
                                                        {semesterSubjects.map(subject => (
                                                            <div
                                                                key={subject._id}
                                                                onClick={() => setSelectedSubject(subject)}
                                                                className={`flex items-center mx-3 ml-9 px-3 py-2 rounded-lg cursor-pointer text-sm ${selectedSubject?._id === subject._id
                                                                    ? 'bg-indigo-500 text-white'
                                                                    : 'text-white/50 hover:bg-indigo-500/10 hover:text-white/70'
                                                                    }`}
                                                            >
                                                                <span className="truncate">{subject.name}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ));
                        })()}
                    </div>
                </div>
            </div>

            {/* Add Subject Modal */}
            {isAddSubjectModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setIsAddSubjectModalOpen(false)}>
                    <div className="bg-[#13131f] border border-white/10 rounded-2xl w-full max-w-lg p-8" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-white">Add New Subject</h3>
                            <button onClick={() => setIsAddSubjectModalOpen(false)} className="text-white/40 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateSubject} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-2">Subject Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={subjectFormData.name}
                                    onChange={handleSubjectFormChange}
                                    placeholder="e.g. Mathematics I"
                                    className="w-full h-12 px-4 bg-[#1a1a2e] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-white/70 mb-2">Subject Code</label>
                                    <input
                                        type="text"
                                        name="code"
                                        value={subjectFormData.code}
                                        onChange={handleSubjectFormChange}
                                        placeholder="e.g. MATH101"
                                        className="w-full h-12 px-4 bg-[#1a1a2e] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-white/70 mb-2">Credits</label>
                                    <input
                                        type="number"
                                        name="credits"
                                        value={subjectFormData.credits}
                                        onChange={handleSubjectFormChange}
                                        placeholder="e.g. 4"
                                        className="w-full h-12 px-4 bg-[#1a1a2e] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <FormSelect
                                    label="Year"
                                    name="year"
                                    required
                                    value={subjectFormData.year}
                                    onChange={handleSubjectFormChange}
                                    placeholder="Select Year"
                                    options={Array.from({ length: user?.durationYears || 4 }, (_, i) => ({
                                        value: `${i + 1}${getOrdinal(i + 1)} Year`,
                                        label: `${i + 1}${getOrdinal(i + 1)} Year`
                                    }))}
                                />
                                <FormSelect
                                    label="Semester"
                                    name="semester"
                                    required
                                    value={subjectFormData.semester}
                                    onChange={handleSubjectFormChange}
                                    placeholder="Select Semester"
                                    options={[
                                        { value: '1st Semester', label: '1st Semester' },
                                        { value: '2nd Semester', label: '2nd Semester' }
                                    ]}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-2">Display Order (Optional)</label>
                                <input
                                    type="number"
                                    name="order"
                                    value={subjectFormData.order}
                                    onChange={handleSubjectFormChange}
                                    placeholder="0 = first, higher = later"
                                    className="w-full h-12 px-4 bg-[#1a1a2e] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 transition-all"
                                />
                                <p className="text-xs text-white/40 mt-1">Lower numbers appear first within year/semester</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-2">Syllabus (Optional)</label>
                                <div className="border-2 border-dashed border-white/10 rounded-xl p-6 text-center cursor-pointer hover:border-indigo-500/30 hover:bg-white/5 transition-all bg-[#1a1a2e]">
                                    <label className="cursor-pointer block">
                                        {isUploading ? (
                                            <span className="flex items-center justify-center gap-2 text-indigo-400 font-medium">
                                                <Loader className="animate-spin" size={20} /> Processing PDF...
                                            </span>
                                        ) : (
                                            <span className="flex flex-col items-center gap-2 text-white/40">
                                                <Upload size={24} />
                                                <span className="text-sm">Click to upload PDF syllabus for auto-fill</span>
                                            </span>
                                        )}
                                        <input
                                            type="file"
                                            accept=".pdf"
                                            onChange={handleFileUpload}
                                            className="hidden"
                                            disabled={isUploading}
                                        />
                                    </label>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsAddSubjectModalOpen(false)}
                                    className="px-5 py-2.5 rounded-xl border border-white/10 text-white/70 font-medium hover:bg-white/5 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isUploading}
                                    className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all disabled:opacity-70"
                                >
                                    {isUploading ? 'Processing...' : 'Create Subject'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Subject Modal */}
            {isEditSubjectModalOpen && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[#13131f] rounded-2xl p-6 w-full max-w-md border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-white">Edit Subject</h3>
                            <button onClick={() => setIsEditSubjectModalOpen(false)} className="text-white/40 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateSubject} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-2">Subject Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={editFormData.name}
                                    onChange={handleEditFormChange}
                                    className="w-full h-12 px-4 bg-[#1a1a2e] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 transition-all"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-white/70 mb-2">Subject Code</label>
                                    <input
                                        type="text"
                                        name="code"
                                        value={editFormData.code}
                                        onChange={handleEditFormChange}
                                        className="w-full h-12 px-4 bg-[#1a1a2e] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-white/70 mb-2">Credits</label>
                                    <input
                                        type="number"
                                        name="credits"
                                        value={editFormData.credits}
                                        onChange={handleEditFormChange}
                                        className="w-full h-12 px-4 bg-[#1a1a2e] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 transition-all"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <FormSelect
                                    label="Year"
                                    name="year"
                                    required
                                    value={editFormData.year}
                                    onChange={handleEditFormChange}
                                    placeholder="Select Year"
                                    options={Array.from({ length: user?.durationYears || 4 }, (_, i) => ({
                                        value: `${i + 1}${getOrdinal(i + 1)} Year`,
                                        label: `${i + 1}${getOrdinal(i + 1)} Year`
                                    }))}
                                />
                                <FormSelect
                                    label="Semester"
                                    name="semester"
                                    required
                                    value={editFormData.semester}
                                    onChange={handleEditFormChange}
                                    placeholder="Select Semester"
                                    options={[
                                        { value: '1st Semester', label: '1st Semester' },
                                        { value: '2nd Semester', label: '2nd Semester' }
                                    ]}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-2">Display Order</label>
                                <input
                                    type="number"
                                    name="order"
                                    value={editFormData.order}
                                    onChange={handleEditFormChange}
                                    placeholder="0 = first, higher = later"
                                    className="w-full h-12 px-4 bg-[#1a1a2e] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 transition-all"
                                />
                                <p className="text-xs text-white/40 mt-1">Lower numbers appear first within year/semester</p>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsEditSubjectModalOpen(false)}
                                    className="px-5 py-2.5 rounded-xl border border-white/10 text-white/70 font-medium hover:bg-white/5 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Right Pane: Content */}
            <div className="flex-1 p-4 lg:p-8 overflow-y-auto">
                {selectedSubject ? (
                    <div className="max-w-5xl mx-auto">
                        {/* Tabs - Scrollable on mobile */}
                        <div className="flex gap-1 mb-4 lg:mb-8 border-b border-white/10 pb-1 overflow-x-auto">
                            {['syllabus', 'questions', 'papers', 'notes'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-3 lg:px-5 py-2 lg:py-3 font-medium text-xs lg:text-sm capitalize transition-all relative rounded-t-lg whitespace-nowrap ${activeTab === tab
                                        ? 'text-indigo-400 bg-indigo-500/10'
                                        : 'text-white/50 hover:text-white/70 hover:bg-white/5'
                                        }`}
                                >
                                    {tab === 'syllabus' ? 'Syllabus' : tab.replace('questions', 'Important Questions').replace('papers', 'Previous Papers')}
                                    {activeTab === tab && (
                                        <div className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                                    )}
                                </button>
                            ))}
                        </div>

                        {activeTab === 'syllabus' ? (
                            <div className="space-y-4 lg:space-y-6">
                                {/* Subject Header */}
                                <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-4 lg:p-8 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
                                    <div className="relative">
                                        {/* Title row with share, edit and delete buttons */}
                                        <div className="flex items-start justify-between gap-3 mb-3">
                                            <h1 className="text-xl lg:text-3xl font-bold text-white">{selectedSubject.name}</h1>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <button
                                                    onClick={() => setShareSubject(selectedSubject)}
                                                    className="p-2 lg:p-2.5 bg-white/10 hover:bg-emerald-500/20 hover:text-emerald-400 rounded-lg lg:rounded-xl transition-colors text-white"
                                                    title="Share Subject"
                                                >
                                                    <Share2 size={18} className="lg:w-5 lg:h-5" />
                                                </button>
                                                <button
                                                    onClick={handleEditClick}
                                                    className="p-2 lg:p-2.5 bg-white/10 hover:bg-indigo-500/20 hover:text-indigo-400 rounded-lg lg:rounded-xl transition-colors text-white"
                                                    title="Edit Subject"
                                                >
                                                    <Edit2 size={18} className="lg:w-5 lg:h-5" />
                                                </button>
                                                <button
                                                    onClick={handleDeleteClick}
                                                    className="p-2 lg:p-2.5 bg-white/10 hover:bg-red-500/20 hover:text-red-400 rounded-lg lg:rounded-xl transition-colors text-white"
                                                    title="Delete Subject"
                                                >
                                                    <Trash2 size={18} className="lg:w-5 lg:h-5" />
                                                </button>
                                            </div>
                                        </div>
                                        {/* Tags row */}
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="bg-white/20 px-2.5 py-1 rounded-lg text-xs lg:text-sm font-medium text-white backdrop-blur-sm">{selectedSubject.code}</span>
                                            <span className="bg-white/10 px-2.5 py-1 rounded-lg text-xs lg:text-sm text-white/80">{selectedSubject.year}</span>
                                            <span className="bg-white/10 px-2.5 py-1 rounded-lg text-xs lg:text-sm text-white/80">{selectedSubject.semester}</span>
                                            <span className="text-white/60 text-xs lg:text-sm">• {selectedSubject.credits} Credits</span>
                                        </div>
                                    </div>
                                </div>

                                <ConfirmModal
                                    isOpen={isDeleteModalOpen}
                                    onClose={() => setIsDeleteModalOpen(false)}
                                    onConfirm={handleConfirmDelete}
                                    title="Delete Subject"
                                    message={`Are you sure you want to delete "${selectedSubject.name}"? This action cannot be undone.`}
                                />

                                {/* Units */}
                                {selectedSubject.syllabus?.units?.map((unit, index) => (
                                    <div key={unit.unit} className="bg-[#13131f] border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all">
                                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-3">
                                            <span className="w-8 h-8 min-w-[32px] rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-sm font-bold">
                                                {unit.unit}
                                            </span>
                                            {unit.title}
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {unit.topics?.map((topic, i) => (
                                                <span key={i} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white/70 hover:bg-white/10 transition-colors cursor-default">
                                                    {topic}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}

                                {!selectedSubject.syllabus?.units?.length && (
                                    <div className="text-center py-16 bg-[#13131f] border border-dashed border-white/10 rounded-2xl">
                                        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                            <BookOpen size={32} className="text-white/20" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-white/70 mb-1">No syllabus available</h3>
                                        <p className="text-white/40 text-sm">Upload a PDF while creating the subject to auto-parse syllabus</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <ResourceSection
                                title={activeTab === 'questions' ? 'Important Questions' : activeTab === 'papers' ? 'Previous Papers' : 'Notes'}
                                resources={resources.filter(r => r.category === activeTab)}
                                onAddResource={handleAddResource}
                                onDeleteResource={handleDeleteResource}
                            />
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-white/40">
                        <div className="w-24 h-24 bg-white/5 rounded-3xl flex items-center justify-center mb-6">
                            <GraduationCap size={48} className="text-white/20" />
                        </div>
                        <h3 className="text-xl font-semibold text-white/70 mb-2">No Subject Selected</h3>
                        <p>Select a subject from the sidebar to view details</p>
                    </div>
                )}
            </div>

            {/* ShareModal for sharing subjects */}
            {shareSubject && (
                <ShareModal
                    isOpen={!!shareSubject}
                    onClose={() => setShareSubject(null)}
                    type="subject"
                    targetId={shareSubject._id}
                    title={shareSubject.name}
                />
            )}
        </div>
    );
};

export default Subjects;
