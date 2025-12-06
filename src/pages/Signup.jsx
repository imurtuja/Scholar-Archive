import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, School, BookOpen, Calendar, Loader, ArrowRight, ArrowLeft, GraduationCap, Sparkles, Shield, Upload, Share2, ChevronDown } from 'lucide-react';
import usePageTitle from '../hooks/usePageTitle';

// Custom Select Component with click-outside close
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


const Signup = () => {
    usePageTitle('Create Account');
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        institution: '',
        degree: '',
        major: '',
        year: '',
        durationYears: '4',
        totalSemesters: 8
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { setAuth } = useAuth();

    // Get the redirect URL from query params (if coming from a protected route)
    const redirectUrl = searchParams.get('redirect') || '/dashboard';

    // Degree to Majors mapping
    const degreeMajorsMap = {
        'B.Tech (Bachelor of Technology)': [
            'Computer Science & Engineering',
            'Information Technology',
            'Electronics & Communication',
            'Electrical Engineering',
            'Mechanical Engineering',
            'Civil Engineering',
            'Chemical Engineering',
            'Biotechnology',
            'Data Science & AI',
            'Aerospace Engineering'
        ],
        'B.E. (Bachelor of Engineering)': [
            'Computer Science & Engineering',
            'Information Technology',
            'Electronics & Communication',
            'Electrical Engineering',
            'Mechanical Engineering',
            'Civil Engineering',
            'Chemical Engineering'
        ],
        'B.Sc (Bachelor of Science)': [
            'Computer Science',
            'Physics',
            'Chemistry',
            'Mathematics',
            'Biology',
            'Biotechnology',
            'Statistics',
            'Environmental Science',
            'Data Science'
        ],
        'B.A. (Bachelor of Arts)': [
            'English Literature',
            'History',
            'Political Science',
            'Economics',
            'Psychology',
            'Sociology',
            'Philosophy',
            'Geography'
        ],
        'B.Com (Bachelor of Commerce)': [
            'Accounting & Finance',
            'Banking & Insurance',
            'Taxation',
            'Business Studies',
            'Economics',
            'Financial Markets'
        ],
        'BBA (Bachelor of Business Administration)': [
            'Marketing',
            'Finance',
            'Human Resources',
            'Operations Management',
            'International Business',
            'Entrepreneurship'
        ],
        'BCA (Bachelor of Computer Applications)': [
            'Software Development',
            'Web Development',
            'Database Management',
            'Networking',
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
            'International Business',
            'Entrepreneurship'
        ],
        'MCA (Master of Computer Applications)': [
            'Software Engineering',
            'Data Science',
            'Cloud Computing',
            'Cyber Security',
            'Artificial Intelligence'
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

    const handleNext = (e) => {
        e.preventDefault();
        if (step === 1 && formData.name && formData.email && formData.password) {
            setStep(2);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const submitData = {
            ...formData,
            course: `${formData.degree} - ${formData.major}`,
            durationYears: parseInt(formData.durationYears) || 4,
            totalSemesters: (parseInt(formData.durationYears) || 4) * 2
        };

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submitData)
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || 'Registration failed');
            }
            setAuth(data.token, data.user);
            // Navigate to the redirect URL (shared link or dashboard)
            navigate(redirectUrl);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const features = [
        { icon: Upload, text: 'Upload & organize resources' },
        { icon: Share2, text: 'Share with classmates' },
        { icon: Calendar, text: 'Track exam schedules' },
        { icon: Shield, text: 'Secure cloud storage' }
    ];

    return (
        <div className="min-h-screen flex flex-col">
            {/* Minimal Back Navigation */}
            <Link
                to="/"
                className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all backdrop-blur-sm"
            >
                <ArrowLeft size={16} />
                <span className="text-sm font-medium">Back to Home</span>
            </Link>

            {/* Main Content */}
            <div className="flex-1 flex">
                {/* Left Panel - Branding */}
                <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#0a0a14]">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-indigo-900/30 to-[#0a0a14]"></div>
                    <div className="absolute top-[30%] left-[10%] w-[400px] h-[400px] bg-purple-500/30 rounded-full blur-[150px]"></div>
                    <div className="absolute bottom-[10%] right-[10%] w-[300px] h-[300px] bg-indigo-500/30 rounded-full blur-[120px]"></div>
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:60px_60px]"></div>

                    <div className="relative z-10 flex flex-col justify-center px-16 py-12">
                        <Link to="/" className="flex items-center gap-3 mb-12">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                                <GraduationCap size={28} className="text-white" />
                            </div>
                            <span className="text-2xl font-bold text-white">ScholarArchive</span>
                        </Link>

                        <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
                            Start organizing your<br />
                            <span className="text-gradient">Academic Journey</span>
                        </h1>

                        <p className="text-lg text-white/50 mb-10 max-w-md">
                            Join thousands of students who organize their study materials effortlessly.
                        </p>

                        <div className="grid grid-cols-2 gap-4">
                            {features.map((feature, i) => (
                                <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0">
                                        <feature.icon size={20} className="text-indigo-400" />
                                    </div>
                                    <span className="text-white/70 text-sm">{feature.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Panel - Form */}
                <div className="flex-1 flex items-center justify-center px-6 py-12 bg-[#0d0d1a] overflow-y-auto">
                    <div className="w-full max-w-md my-8">
                        <div className="lg:hidden flex justify-center mb-8">
                            <Link to="/" className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                                    <GraduationCap size={28} className="text-white" />
                                </div>
                                <span className="text-2xl font-bold text-white">ScholarArchive</span>
                            </Link>
                        </div>

                        <div className="bg-[#13131f] border border-white/10 rounded-2xl p-8 md:p-10 shadow-2xl">
                            <div className="text-center mb-8">
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 mb-4">
                                    <Sparkles size={14} className="text-purple-400" />
                                    <span className="text-xs font-medium text-purple-300">Free Account</span>
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-2">Create your account</h2>
                                <p className="text-white/50 text-sm">
                                    {step === 1 ? 'Step 1: Personal Information' : 'Step 2: Academic Details'}
                                </p>
                            </div>

                            <div className="flex items-center gap-3 mb-8">
                                <div className={`flex-1 h-1.5 rounded-full ${step >= 1 ? 'bg-gradient-to-r from-indigo-500 to-purple-500' : 'bg-white/10'}`}></div>
                                <div className={`flex-1 h-1.5 rounded-full ${step >= 2 ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-white/10'}`}></div>
                            </div>

                            {error && (
                                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse flex-shrink-0"></div>
                                    {error}
                                </div>
                            )}

                            {step === 1 && (
                                <form onSubmit={handleNext} className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-medium text-white/70 mb-2">Full Name</label>
                                        <div className="relative flex items-center">
                                            <div className="absolute left-4 flex items-center pointer-events-none">
                                                <User size={18} className="text-white/40" />
                                            </div>
                                            <input
                                                type="text"
                                                name="name"
                                                required
                                                className="w-full h-12 pl-12 pr-4 bg-[#1a1a2e] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                                placeholder="John Doe"
                                                value={formData.name}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-white/70 mb-2">Email Address</label>
                                        <div className="relative flex items-center">
                                            <div className="absolute left-4 flex items-center pointer-events-none">
                                                <Mail size={18} className="text-white/40" />
                                            </div>
                                            <input
                                                type="email"
                                                name="email"
                                                required
                                                className="w-full h-12 pl-12 pr-4 bg-[#1a1a2e] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                                placeholder="john@university.edu"
                                                value={formData.email}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-white/70 mb-2">Password</label>
                                        <div className="relative flex items-center">
                                            <div className="absolute left-4 flex items-center pointer-events-none">
                                                <Lock size={18} className="text-white/40" />
                                            </div>
                                            <input
                                                type="password"
                                                name="password"
                                                required
                                                minLength={6}
                                                className="w-full h-12 pl-12 pr-4 bg-[#1a1a2e] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                                placeholder="Min. 6 characters"
                                                value={formData.password}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full h-12 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all mt-6"
                                    >
                                        <span>Continue</span>
                                        <ArrowRight size={20} />
                                    </button>
                                </form>
                            )}

                            {step === 2 && (
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

                                    <div className="flex gap-3 mt-6">
                                        <button
                                            type="button"
                                            onClick={() => setStep(1)}
                                            className="flex-1 h-12 bg-white/5 border border-white/10 text-white rounded-xl font-semibold hover:bg-white/10 transition-all"
                                        >
                                            Back
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="flex-1 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-50"
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader className="animate-spin" size={20} />
                                                    <span>Creating...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span>Get Started</span>
                                                    <ArrowRight size={20} />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            )}

                            <div className="my-8 flex items-center gap-4">
                                <div className="flex-1 h-px bg-white/10"></div>
                                <span className="text-white/30 text-sm">or</span>
                                <div className="flex-1 h-px bg-white/10"></div>
                            </div>

                            <p className="text-center text-white/50">
                                Already have an account?{' '}
                                <Link to="/login" className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors">
                                    Sign In
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
