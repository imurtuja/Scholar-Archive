import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { School, GraduationCap, BookOpen, Loader, ArrowRight, Sparkles, ArrowLeft, ChevronDown } from 'lucide-react';
import usePageTitle from '../hooks/usePageTitle';

// Custom Select Component (same as Signup)
const CustomSelect = ({ label, icon: Icon, value, onChange, options, placeholder, disabled }) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (ref.current && !ref.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={ref}>
            <label className="block text-sm font-medium text-white/70 mb-2">{label}</label>
            <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                    {Icon && <Icon size={18} className="text-white/40" />}
                </div>
                <button
                    type="button"
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    disabled={disabled}
                    className={`w-full h-12 ${Icon ? 'pl-12' : 'pl-4'} pr-10 bg-[#1a1a2e] border border-white/10 rounded-xl text-left focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all ${value ? 'text-white' : 'text-white/30'} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                    <span className="block truncate">{value || placeholder}</span>
                </button>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <ChevronDown size={18} className={`text-white/40 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </div>

                {isOpen && (
                    <div className="absolute z-50 w-full mt-2 py-2 bg-[#1a1a2e] border border-white/10 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                        {options.length > 0 ? options.map((option, i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={() => {
                                    onChange(option);
                                    setIsOpen(false);
                                }}
                                className={`w-full px-4 py-2.5 text-left hover:bg-white/5 transition-colors text-sm ${value === option ? 'text-indigo-400 bg-indigo-500/10' : 'text-white/70'}`}
                            >
                                {option}
                            </button>
                        )) : (
                            <div className="px-4 py-3 text-white/40 text-sm">No options available</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

const CompleteProfile = () => {
    usePageTitle('Complete Your Profile');
    const [formData, setFormData] = useState({
        institution: '',
        degree: '',
        major: '',
        year: '',
        durationYears: '4'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { setAuth } = useAuth();

    // Get token from URL (from Google OAuth callback)
    const token = searchParams.get('token');

    useEffect(() => {
        if (!token) {
            navigate('/login');
        } else {
            // Store the token temporarily
            localStorage.setItem('token', token);
        }
    }, [token, navigate]);

    // Degree to Majors mapping (same as Signup)
    const degreeMajorsMap = {
        'B.Tech (Bachelor of Technology)': [
            'Computer Science & Engineering',
            'Electronics & Communication',
            'Electrical Engineering',
            'Mechanical Engineering',
            'Civil Engineering',
            'Information Technology',
            'Chemical Engineering',
            'Biotechnology',
            'Aerospace Engineering',
            'Automobile Engineering',
            'Other'
        ],
        'B.Sc (Bachelor of Science)': [
            'Computer Science',
            'Physics',
            'Chemistry',
            'Mathematics',
            'Biology',
            'Biotechnology',
            'Environmental Science',
            'Statistics',
            'Other'
        ],
        'BCA (Bachelor of Computer Applications)': [
            'Computer Applications',
            'Data Science',
            'Web Development',
            'Mobile App Development',
            'Other'
        ],
        'BBA (Bachelor of Business Administration)': [
            'Marketing',
            'Finance',
            'Human Resources',
            'Operations Management',
            'International Business',
            'Other'
        ],
        'B.Com (Bachelor of Commerce)': [
            'Accounting',
            'Finance',
            'Banking',
            'Taxation',
            'Business Studies',
            'Other'
        ],
        'BA (Bachelor of Arts)': [
            'English',
            'History',
            'Political Science',
            'Economics',
            'Psychology',
            'Sociology',
            'Philosophy',
            'Other'
        ],
        'MCA (Master of Computer Applications)': [
            'Software Engineering',
            'Data Science',
            'Cloud Computing',
            'Cyber Security',
            'Mobile App Development'
        ],
        'MBBS (Medicine)': [
            'General Medicine',
            'Surgery',
            'Pediatrics',
            'Gynecology',
            'Orthopedics',
            'Cardiology',
            'Dermatology',
            'Psychiatry'
        ],
        'LLB (Law)': [
            'Corporate Law',
            'Criminal Law',
            'Civil Law',
            'Constitutional Law',
            'International Law',
            'Intellectual Property Law'
        ],
        'B.Arch (Architecture)': [
            'Architectural Design',
            'Urban Planning',
            'Interior Design',
            'Landscape Architecture',
            'Sustainable Design'
        ],
        'M.Tech (Master of Technology)': [
            'Computer Science & Engineering',
            'Data Science & Machine Learning',
            'Artificial Intelligence',
            'Cyber Security',
            'VLSI Design',
            'Structural Engineering',
            'Power Systems'
        ],
        'M.Sc (Master of Science)': [
            'Computer Science',
            'Physics',
            'Chemistry',
            'Mathematics',
            'Data Science',
            'Biotechnology',
            'Environmental Science'
        ],
        'MBA (Master of Business Administration)': [
            'Marketing Management',
            'Financial Management',
            'Human Resource Management',
            'Operations Management',
            'Business Analytics',
            'Entrepreneurship'
        ],
        'M.Com (Master of Commerce)': [
            'Accounting',
            'Finance',
            'Banking & Insurance',
            'Business Economics',
            'Taxation'
        ],
        'MA (Master of Arts)': [
            'English',
            'History',
            'Political Science',
            'Economics',
            'Psychology',
            'Sociology'
        ],
        'M.Ed (Master of Education)': [
            'Educational Psychology',
            'Curriculum Development',
            'Special Education',
            'Educational Technology',
            'Administration'
        ],
        'B.Ed (Bachelor of Education)': [
            'Mathematics Education',
            'Science Education',
            'Language Education',
            'Social Science Education',
            'Physical Education'
        ],
        'Diploma': [
            'Computer Engineering',
            'Mechanical Engineering',
            'Electrical Engineering',
            'Civil Engineering',
            'Electronics Engineering',
            'Other'
        ],
        'Ph.D (Doctorate)': [
            'Computer Science',
            'Physics',
            'Chemistry',
            'Mathematics',
            'Engineering',
            'Life Sciences',
            'Social Sciences',
            'Management'
        ],
        'Other': [
            'Other / Not Listed'
        ]
    };

    const degreeOptions = Object.keys(degreeMajorsMap);
    const yearOptions = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year'];
    const durationOptions = ['2 Years', '3 Years', '4 Years', '5 Years', '6 Years'];

    // Get majors based on selected degree
    const getMajorOptions = () => {
        if (formData.degree && degreeMajorsMap[formData.degree]) {
            return degreeMajorsMap[formData.degree];
        }
        return [];
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSelectChange = (field, value) => {
        if (field === 'degree') {
            // Reset major when degree changes
            setFormData({ ...formData, degree: value, major: '' });
        } else {
            setFormData({ ...formData, [field]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/complete-profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || 'Failed to complete profile');
            }

            // Update auth state with complete user data
            setAuth(token, data.user);
            navigate('/dashboard');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0d0d1a] flex flex-col">
            {/* Back Button */}
            <Link
                to="/"
                className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all backdrop-blur-sm"
            >
                <ArrowLeft size={16} />
                <span className="text-sm font-medium">Back to Home</span>
            </Link>

            <div className="flex-1 flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <div className="flex justify-center mb-8">
                        <Link to="/" className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                                <GraduationCap size={28} className="text-white" />
                            </div>
                            <span className="text-2xl font-bold text-white">ScholarArchive</span>
                        </Link>
                    </div>

                    <div className="bg-[#13131f] border border-white/10 rounded-2xl p-8 md:p-10 shadow-2xl">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 mb-4">
                                <Sparkles size={14} className="text-green-400" />
                                <span className="text-xs font-medium text-green-300">Almost There!</span>
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Complete Your Profile</h2>
                            <p className="text-white/50 text-sm">Add your academic details to get started</p>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse flex-shrink-0"></div>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-2">Institution</label>
                                <div className="relative flex items-center">
                                    <div className="absolute left-4 flex items-center pointer-events-none">
                                        <School size={18} className="text-white/40" />
                                    </div>
                                    <input
                                        type="text"
                                        name="institution"
                                        required
                                        className="w-full h-12 pl-12 pr-4 bg-[#1a1a2e] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                        placeholder="University / College Name"
                                        value={formData.institution}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <CustomSelect
                                label="Degree Program"
                                icon={GraduationCap}
                                value={formData.degree}
                                onChange={(val) => handleSelectChange('degree', val)}
                                options={degreeOptions}
                                placeholder="Select your degree"
                            />

                            <CustomSelect
                                label="Major / Specialization"
                                icon={BookOpen}
                                value={formData.major}
                                onChange={(val) => handleSelectChange('major', val)}
                                options={getMajorOptions()}
                                placeholder={formData.degree ? "Select your major" : "Select degree first"}
                                disabled={!formData.degree}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <CustomSelect
                                    label="Current Year"
                                    value={formData.year}
                                    onChange={(val) => handleSelectChange('year', val)}
                                    options={yearOptions}
                                    placeholder="Select"
                                />
                                <CustomSelect
                                    label="Duration"
                                    value={formData.durationYears ? `${formData.durationYears} Years` : ''}
                                    onChange={(val) => handleSelectChange('durationYears', val.split(' ')[0])}
                                    options={durationOptions}
                                    placeholder="Select"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-12 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <Loader className="animate-spin" size={20} />
                                        <span>Saving...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Complete Setup</span>
                                        <ArrowRight size={20} />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompleteProfile;
