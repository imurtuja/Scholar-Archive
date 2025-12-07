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
    const [googleLoading, setGoogleLoading] = useState(false);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { setAuth } = useAuth();

    // OTP verification states
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);

    // Password states
    const [confirmPassword, setConfirmPassword] = useState('');

    // Password strength calculation
    const getPasswordStrength = (password) => {
        let score = 0;
        let feedback = [];

        if (password.length >= 8) score += 1;
        else feedback.push('8+ characters');

        if (/[A-Z]/.test(password)) score += 1;
        else feedback.push('uppercase');

        if (/[a-z]/.test(password)) score += 1;
        else feedback.push('lowercase');

        if (/[0-9]/.test(password)) score += 1;
        else feedback.push('number');

        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
        else feedback.push('special char');

        const levels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
        const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981'];

        return {
            score,
            level: levels[score - 1] || 'Very Weak',
            color: colors[score - 1] || '#ef4444',
            percentage: (score / 5) * 100,
            feedback
        };
    };

    const passwordStrength = getPasswordStrength(formData.password);
    const passwordsMatch = formData.password === confirmPassword && confirmPassword !== '';

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
        if (step === 1 && formData.name && formData.email && formData.password && passwordStrength.score >= 5 && passwordsMatch) {
            handleSendOTP();
        } else if (step === 2 && otpVerified) {
            setStep(3);
        }
    };

    // Send OTP to email
    const handleSendOTP = async () => {
        setError('');
        setOtpLoading(true);
        try {
            const res = await fetch('/api/auth/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email, name: formData.name })
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || 'Failed to send OTP');
            }
            setOtpSent(true);
            setStep(2);
            startResendTimer();
        } catch (err) {
            setError(err.message);
        } finally {
            setOtpLoading(false);
        }
    };

    // Verify OTP
    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setError('');
        setOtpLoading(true);
        try {
            const res = await fetch('/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email, otp })
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || 'Invalid OTP');
            }
            setOtpVerified(true);
            setStep(3);
        } catch (err) {
            setError(err.message);
        } finally {
            setOtpLoading(false);
        }
    };

    // Resend timer
    const startResendTimer = () => {
        setResendTimer(60);
        const interval = setInterval(() => {
            setResendTimer(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    // Resend OTP
    const handleResendOTP = async () => {
        if (resendTimer > 0) return;
        setError('');
        setOtpLoading(true);
        try {
            const res = await fetch('/api/auth/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email, name: formData.name })
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || 'Failed to resend OTP');
            }
            setOtp('');
            startResendTimer();
        } catch (err) {
            setError(err.message);
        } finally {
            setOtpLoading(false);
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
                                    {step === 1 ? 'Step 1: Personal Details' : step === 2 ? 'Step 2: Verify Email' : 'Step 3: Password & Academic Details'}
                                </p>
                            </div>

                            <div className="flex items-center gap-3 mb-8">
                                <div className={`flex-1 h-1.5 rounded-full ${step >= 1 ? 'bg-gradient-to-r from-indigo-500 to-purple-500' : 'bg-white/10'}`}></div>
                                <div className={`flex-1 h-1.5 rounded-full ${step >= 2 ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-white/10'}`}></div>
                                <div className={`flex-1 h-1.5 rounded-full ${step >= 3 ? 'bg-gradient-to-r from-pink-500 to-orange-500' : 'bg-white/10'}`}></div>
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

                                    {/* Password */}
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
                                                autoComplete="new-password"
                                                className="w-full h-12 pl-12 pr-4 bg-[#1a1a2e] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                                placeholder="Create a strong password"
                                                value={formData.password}
                                                onChange={handleChange}
                                            />
                                        </div>

                                        {/* Password Strength Bar */}
                                        {formData.password && (
                                            <div className="mt-3">
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <span className="text-xs text-white/50">Password Strength</span>
                                                    <span className="text-xs font-medium" style={{ color: passwordStrength.color }}>
                                                        {passwordStrength.level}
                                                    </span>
                                                </div>
                                                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full transition-all duration-300"
                                                        style={{
                                                            width: `${passwordStrength.percentage}%`,
                                                            backgroundColor: passwordStrength.color
                                                        }}
                                                    />
                                                </div>
                                                {passwordStrength.feedback.length > 0 && (
                                                    <p className="text-xs text-white/40 mt-1.5">
                                                        Missing: {passwordStrength.feedback.join(', ')}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Confirm Password */}
                                    <div>
                                        <label className="block text-sm font-medium text-white/70 mb-2">Confirm Password</label>
                                        <div className="relative flex items-center">
                                            <div className="absolute left-4 flex items-center pointer-events-none">
                                                <Lock size={18} className="text-white/40" />
                                            </div>
                                            <input
                                                type="password"
                                                required
                                                autoComplete="new-password"
                                                className={`w-full h-12 pl-12 pr-12 bg-[#1a1a2e] border rounded-xl text-white placeholder-white/30 focus:outline-none transition-all ${confirmPassword && (passwordsMatch ? 'border-green-500/50 focus:border-green-500' : 'border-red-500/50 focus:border-red-500')
                                                    } ${!confirmPassword && 'border-white/10 focus:border-indigo-500/50'}`}
                                                placeholder="Confirm your password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                            />
                                            {confirmPassword && (
                                                <div className="absolute right-4 flex items-center">
                                                    {passwordsMatch ? (
                                                        <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                                                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        </div>
                                                    ) : (
                                                        <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                                                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        {confirmPassword && !passwordsMatch && (
                                            <p className="text-xs text-red-400 mt-1.5">Passwords do not match</p>
                                        )}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={otpLoading || passwordStrength.score < 5 || !passwordsMatch}
                                        className="w-full h-12 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {otpLoading ? (
                                            <>
                                                <Loader size={20} className="animate-spin" />
                                                <span>Sending OTP...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Send Verification Code</span>
                                                <ArrowRight size={20} />
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}

                            {step === 2 && (
                                <form onSubmit={handleVerifyOTP} className="space-y-5">
                                    <div className="text-center mb-4">
                                        <div className="w-16 h-16 mx-auto bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                                            <Mail size={28} className="text-green-400" />
                                        </div>
                                        <p className="text-white/70 text-sm">
                                            We've sent a 6-digit code to<br />
                                            <span className="text-white font-semibold">{formData.email}</span>
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-white/70 mb-2">Verification Code</label>
                                        <input
                                            type="text"
                                            maxLength={6}
                                            required
                                            className="w-full h-14 px-4 bg-[#1a1a2e] border border-white/10 rounded-xl text-white text-center text-2xl font-bold tracking-[0.5em] placeholder-white/30 focus:outline-none focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 transition-all"
                                            placeholder="000000"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={otpLoading || otp.length !== 6}
                                        className="w-full h-12 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg shadow-green-500/25 hover:shadow-green-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-50"
                                    >
                                        {otpLoading ? (
                                            <>
                                                <Loader size={20} className="animate-spin" />
                                                <span>Verifying...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Verify Email</span>
                                                <ArrowRight size={20} />
                                            </>
                                        )}
                                    </button>

                                    <div className="text-center">
                                        <button
                                            type="button"
                                            onClick={handleResendOTP}
                                            disabled={resendTimer > 0 || otpLoading}
                                            className="text-sm text-indigo-400 hover:text-indigo-300 disabled:text-white/30 transition-colors"
                                        >
                                            {resendTimer > 0 ? `Resend code in ${resendTimer}s` : "Didn't receive code? Resend"}
                                        </button>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => { setStep(1); setOtpSent(false); setOtp(''); }}
                                        className="w-full flex items-center justify-center gap-2 text-white/50 hover:text-white transition-colors text-sm"
                                    >
                                        <ArrowLeft size={16} />
                                        <span>Change email address</span>
                                    </button>
                                </form>
                            )}

                            {step === 3 && (
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

                            {/* Google Signup Button */}
                            <button
                                onClick={() => {
                                    setGoogleLoading(true);
                                    window.location.href = '/api/auth/google';
                                }}
                                disabled={googleLoading}
                                className="w-full h-12 bg-white hover:bg-gray-100 text-gray-700 rounded-xl font-semibold flex items-center justify-center gap-3 shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                            >
                                {googleLoading ? (
                                    <>
                                        <Loader className="animate-spin" size={20} />
                                        <span>Connecting to Google...</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                        </svg>
                                        <span>Continue with Google</span>
                                    </>
                                )}
                            </button>

                            <p className="text-center text-white/50 mt-6">
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
