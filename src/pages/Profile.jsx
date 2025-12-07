import React, { useState, useEffect, useRef } from 'react';
import { User, Save, GraduationCap, Building, Calendar, Check, ChevronDown, AlertTriangle, Lock, Sun, Moon, Eye, EyeOff, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import usePageTitle from '../hooks/usePageTitle';
import DeleteAccountModal from '../components/DeleteAccountModal';

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
    'M.Tech (Master of Technology)': [
        'Computer Science & Engineering',
        'Data Science',
        'Machine Learning',
        'Software Engineering',
        'VLSI Design',
        'Embedded Systems'
    ],
    'MCA (Master of Computer Applications)': [
        'Software Development',
        'Data Analytics',
        'Cloud Computing',
        'Cyber Security'
    ],
    'MBA (Master of Business Administration)': [
        'Marketing',
        'Finance',
        'Human Resources',
        'Operations',
        'IT Management',
        'Business Analytics'
    ]
};

// Helper to find matching degree key
const findDegreeKey = (degreeValue) => {
    if (!degreeValue) return null;
    if (degreeMajorsMap[degreeValue]) return degreeValue;
    const normalized = degreeValue.replace(/\s+/g, '').replace(/\./g, '').toLowerCase();
    return Object.keys(degreeMajorsMap).find(key => {
        const keyNormalized = key.split(' ')[0].replace(/\s+/g, '').replace(/\./g, '').toLowerCase();
        return keyNormalized === normalized || key.toLowerCase().includes(degreeValue.toLowerCase());
    });
};

// Custom Select with smart positioning (opens up or down based on space)
const CustomSelect = ({ label, icon: Icon, value, onChange, options, placeholder, disabled }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [openUpward, setOpenUpward] = useState(false);
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
            const spaceAbove = rect.top;
            const dropdownHeight = Math.min(options.length * 40 + 16, 240);

            // Open upward if not enough space below but enough above
            const shouldOpenUp = spaceBelow < dropdownHeight && spaceAbove > dropdownHeight;
            setOpenUpward(shouldOpenUp);

            setDropdownPos({
                top: shouldOpenUp ? rect.top - dropdownHeight - 8 : rect.bottom + 8,
                left: rect.left,
                width: rect.width
            });
        }
    }, [isOpen, options.length]);

    return (
        <div ref={ref}>
            <label className="block text-sm font-medium text-white/60 mb-2">{label}</label>
            <div className="relative">
                {Icon && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <Icon size={16} className="text-white/30" />
                    </div>
                )}
                <button
                    ref={buttonRef}
                    type="button"
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    disabled={disabled}
                    className={`w-full h-12 ${Icon ? 'pl-11' : 'pl-4'} pr-10 bg-[#1a1a2e] border border-white/10 rounded-xl text-left focus:outline-none focus:border-indigo-500/50 transition-all ${value ? 'text-white' : 'text-white/30'} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                    <span className="block truncate">{value || placeholder}</span>
                </button>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <ChevronDown size={16} className={`text-white/40 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </div>
            {isOpen && (
                <div
                    className="fixed py-2 bg-[#1a1a2e] border border-white/10 rounded-xl shadow-2xl max-h-60 overflow-y-auto"
                    style={{ top: dropdownPos.top, left: dropdownPos.left, width: dropdownPos.width, zIndex: 9999 }}
                >
                    {options.length > 0 ? options.map((option, i) => (
                        <button
                            key={i}
                            type="button"
                            onClick={() => { onChange(option); setIsOpen(false); }}
                            className={`w-full px-4 py-2.5 text-left hover:bg-white/5 text-sm ${value === option ? 'text-indigo-400 bg-indigo-500/10' : 'text-white/70'}`}
                        >
                            {option}
                        </button>
                    )) : (
                        <div className="px-4 py-3 text-white/40 text-sm">No options available</div>
                    )}
                </div>
            )}
        </div>
    );
};

const Profile = () => {
    usePageTitle('Profile');
    const { user, setAuth } = useAuth();
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

    // Password change states
    const [showPasswordSection, setShowPasswordSection] = useState(false);
    const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState(false);
    const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });

    const [formData, setFormData] = useState({
        name: '', email: '', institution: '', degree: '', major: '', currentYear: 1, durationYears: 4
    });

    useEffect(() => {
        if (user) {
            let degree = user.degree || '';
            let major = user.major || '';
            if (user.course && !degree && !major) {
                const parts = user.course.split(' - ');
                if (parts.length === 2) {
                    const fullDegree = Object.keys(degreeMajorsMap).find(d => d.includes(parts[0].trim().replace('.', '')));
                    degree = fullDegree || parts[0].trim();
                    major = parts[1].trim();
                }
            }
            setFormData({
                name: user.name || '', email: user.email || '', institution: user.institution || '',
                degree, major, currentYear: user.currentYear || 1, durationYears: user.durationYears || 4
            });
        }
    }, [user]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleDegreeChange = (degree) => setFormData({ ...formData, degree, major: '' });
    const handleMajorChange = (major) => setFormData({ ...formData, major });

    const getOrdinal = (n) => { const s = ["th", "st", "nd", "rd"]; const v = n % 100; return s[(v - 20) % 10] || s[v] || s[0]; };

    const handleUpdateProfile = async () => {
        setIsSaving(true);
        try {
            const token = localStorage.getItem('token');
            const dataToSend = {
                ...formData,
                course: formData.degree && formData.major ? `${formData.degree.split(' ')[0]} - ${formData.major}` : formData.degree || formData.major
            };
            const res = await fetch('/api/auth/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify(dataToSend)
            });
            if (res.ok) {
                const data = await res.json();
                // Update auth context with token and updated user data
                setAuth(token, data.user);
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 3000);
            } else {
                console.error('Failed to update profile:', res.status);
            }
        } catch (error) {
            console.error('Error updating profile:', error);
        } finally {
            setIsSaving(false);
        }
    };

    // Password change handler
    const handlePasswordChange = async () => {
        setPasswordError('');
        setPasswordSuccess(false);

        if (passwordData.new !== passwordData.confirm) {
            setPasswordError('New passwords do not match');
            return;
        }
        if (passwordData.new.length < 6) {
            setPasswordError('Password must be at least 6 characters');
            return;
        }

        setPasswordLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify({ currentPassword: passwordData.current, newPassword: passwordData.new })
            });

            const data = await res.json();
            if (res.ok) {
                setPasswordSuccess(true);
                setPasswordData({ current: '', new: '', confirm: '' });
                setTimeout(() => {
                    setPasswordSuccess(false);
                    setShowPasswordSection(false);
                }, 2000);
            } else {
                setPasswordError(data.message || 'Failed to change password');
            }
        } catch (error) {
            setPasswordError('An error occurred');
        } finally {
            setPasswordLoading(false);
        }
    };

    // Theme toggle handler
    const handleThemeToggle = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        if (newTheme === 'light') {
            document.documentElement.classList.add('light-theme');
            document.documentElement.classList.remove('dark-theme');
        } else {
            document.documentElement.classList.add('dark-theme');
            document.documentElement.classList.remove('light-theme');
        }
    };

    const degreeKey = findDegreeKey(formData.degree);
    const availableMajors = degreeKey ? degreeMajorsMap[degreeKey] || [] : [];

    // Get display text for header badge
    const getCourseBadge = () => {
        if (user?.course) return user.course;
        if (formData.degree && formData.major) {
            return `${formData.degree.split(' ')[0]} - ${formData.major}`;
        }
        return null;
    };

    return (
        <div className="max-w-3xl mx-auto py-4 lg:py-8 pb-16">
            <div className="mb-4 lg:mb-8">
                <h1 className="text-xl lg:text-2xl font-bold text-white mb-1 lg:mb-2">Profile</h1>
                <p className="text-white/50 text-sm lg:text-base">Manage your account details</p>
            </div>

            <div className="bg-[#13131f] border border-white/10 rounded-xl lg:rounded-2xl">
                {/* Avatar Header - Mobile optimized */}
                <div className="bg-gradient-to-br from-violet-600 via-fuchsia-600 to-rose-500 p-4 lg:p-8 relative rounded-t-xl lg:rounded-t-2xl">
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px] rounded-t-xl lg:rounded-t-2xl"></div>
                    <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
                        <div className="w-16 h-16 lg:w-24 lg:h-24 rounded-xl lg:rounded-2xl bg-white/20 backdrop-blur-sm text-white flex items-center justify-center text-2xl lg:text-4xl font-bold border-2 border-white/30 shadow-2xl flex-shrink-0">
                            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h2 className="text-xl lg:text-2xl font-bold text-white mb-1">{user?.name || 'User'}</h2>
                            <p className="text-white/70 text-sm lg:text-base mb-3">{user?.email}</p>
                            <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center sm:justify-start gap-2">
                                {getCourseBadge() && (
                                    <span className="px-3 py-1.5 bg-white/20 rounded-lg text-xs lg:text-sm text-white font-medium backdrop-blur-sm">
                                        <GraduationCap size={14} className="inline mr-1.5 -mt-0.5" />
                                        {getCourseBadge()}
                                    </span>
                                )}
                                {user?.institution && (
                                    <span className="px-3 py-1.5 bg-white/20 rounded-lg text-xs lg:text-sm text-white/90 font-medium backdrop-blur-sm">
                                        <Building size={14} className="inline mr-1.5 -mt-0.5" />
                                        {user.institution}
                                    </span>
                                )}
                                {user?.currentYear && (
                                    <span className="px-3 py-1.5 bg-white/20 rounded-lg text-xs lg:text-sm text-white/90 font-medium backdrop-blur-sm">
                                        <Calendar size={14} className="inline mr-1.5 -mt-0.5" />
                                        {user.currentYear}{getOrdinal(user.currentYear)} Year
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <div className="p-4 lg:p-8 space-y-4 lg:space-y-6">
                    {/* Personal Info */}
                    <div>
                        <h3 className="text-xs lg:text-sm font-semibold text-white/40 uppercase tracking-wide mb-3 lg:mb-4 flex items-center gap-2">
                            <User size={14} /> Personal Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
                            <div>
                                <label className="block mb-1.5 lg:mb-2 text-xs lg:text-sm font-medium text-white/60">Full Name</label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange}
                                    className="w-full h-11 lg:h-12 px-4 bg-[#1a1a2e] border border-white/10 rounded-xl text-white text-sm lg:text-base focus:outline-none focus:border-indigo-500/50 transition-all" />
                            </div>
                            <div>
                                <label className="block mb-1.5 lg:mb-2 text-xs lg:text-sm font-medium text-white/60">Email</label>
                                <input type="email" name="email" value={formData.email} onChange={handleChange}
                                    className="w-full h-11 lg:h-12 px-4 bg-[#1a1a2e] border border-white/10 rounded-xl text-white text-sm lg:text-base focus:outline-none focus:border-indigo-500/50 transition-all" />
                            </div>
                        </div>
                    </div>

                    {/* Academic Info */}
                    <div>
                        <h3 className="text-sm font-semibold text-white/40 uppercase tracking-wide mb-4 flex items-center gap-2">
                            <GraduationCap size={14} /> Academic Details
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block mb-2 text-sm font-medium text-white/60">Institution</label>
                                <div className="relative">
                                    <Building size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                                    <input type="text" name="institution" value={formData.institution} onChange={handleChange}
                                        placeholder="Your college/university"
                                        className="w-full h-12 pl-11 pr-4 bg-[#1a1a2e] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 transition-all" />
                                </div>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <CustomSelect label="Degree" icon={GraduationCap} value={formData.degree} onChange={handleDegreeChange}
                                    options={Object.keys(degreeMajorsMap)} placeholder="Select Degree" />
                                <CustomSelect label="Major / Branch" value={formData.major} onChange={handleMajorChange}
                                    options={availableMajors} placeholder={formData.degree ? "Select Major" : "Select degree first"} disabled={!formData.degree} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
                                <CustomSelect label="Current Year" icon={Calendar}
                                    value={formData.currentYear ? `${formData.currentYear}${getOrdinal(formData.currentYear)} Year` : ''}
                                    onChange={(val) => {
                                        const yearNum = parseInt(val.match(/\d+/)?.[0] || '1');
                                        setFormData({ ...formData, currentYear: yearNum });
                                    }}
                                    options={Array.from({ length: formData.durationYears || 4 }, (_, i) => `${i + 1}${getOrdinal(i + 1)} Year`)}
                                    placeholder="Select Year" />
                                <CustomSelect label="Course Duration"
                                    value={formData.durationYears ? `${formData.durationYears} Years` : ''}
                                    onChange={(val) => {
                                        const durationNum = parseInt(val.match(/\d+/)?.[0] || '4');
                                        setFormData({ ...formData, durationYears: durationNum });
                                    }}
                                    options={['3 Years', '4 Years', '5 Years']}
                                    placeholder="Select Duration" />
                            </div>
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex items-center gap-4 pt-4">
                        <button onClick={handleUpdateProfile} disabled={isSaving}
                            className="px-6 py-3 bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white font-medium rounded-xl shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all disabled:opacity-50 flex items-center gap-2">
                            {isSaving ? (
                                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Saving...</>
                            ) : (
                                <><Save size={18} /> Save Changes</>
                            )}
                        </button>
                        {showSuccess && <span className="flex items-center gap-2 text-green-400 text-sm"><Check size={16} /> Profile updated!</span>}
                    </div>
                </div>
            </div>

            {/* Settings Section */}
            <div className="bg-[#13131f] border border-white/10 rounded-xl lg:rounded-2xl mt-6 p-4 lg:p-6">
                <h3 className="text-sm font-semibold text-white/40 uppercase tracking-wide mb-4">Settings</h3>

                {/* Theme Toggle - Custom Switch Design */}
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
                            {theme === 'light' ? (
                                <Sun size={20} className="text-amber-400" />
                            ) : (
                                <Moon size={20} className="text-indigo-400" />
                            )}
                        </div>
                        <div>
                            <p className="font-medium text-white">Appearance</p>
                            <p className="text-xs text-white/40">Switch between light and dark mode</p>
                        </div>
                    </div>
                    {/* Custom Toggle Switch */}
                    <button
                        onClick={handleThemeToggle}
                        className={`relative w-14 h-8 rounded-full transition-all duration-300 ${theme === 'light' ? 'bg-amber-500' : 'bg-indigo-600'}`}
                    >
                        <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-lg transition-all duration-300 flex items-center justify-center ${theme === 'light' ? 'left-7' : 'left-1'}`}>
                            {theme === 'light' ? (
                                <Sun size={14} className="text-amber-500" />
                            ) : (
                                <Moon size={14} className="text-indigo-600" />
                            )}
                        </div>
                    </button>
                </div>

                {/* Change Password */}
                <div className="p-4 bg-white/5 rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                                <Lock size={20} className="text-indigo-400" />
                            </div>
                            <div>
                                <p className="font-medium text-white">Password</p>
                                <p className="text-xs text-white/40">Update your account password</p>
                            </div>
                        </div>
                        {!showPasswordSection && (
                            <button
                                onClick={() => setShowPasswordSection(true)}
                                className="px-4 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 font-medium rounded-xl border border-indigo-500/20 hover:border-indigo-500/40 transition-all text-sm"
                            >
                                Change Password
                            </button>
                        )}
                    </div>

                    {showPasswordSection && (
                        <div className="space-y-4 pt-2 border-t border-white/5">
                            <div className="space-y-3 pt-4">
                                {/* Current Password */}
                                <div className="relative">
                                    <input
                                        type={showPasswords.current ? 'text' : 'password'}
                                        placeholder="Current Password"
                                        value={passwordData.current}
                                        onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                                        autoComplete="off"
                                        className="w-full h-12 px-4 bg-[#1a1a2e] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
                                    >
                                        {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>

                                {/* New Password */}
                                <div className="relative">
                                    <input
                                        type={showPasswords.new ? 'text' : 'password'}
                                        placeholder="New Password"
                                        value={passwordData.new}
                                        onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                                        autoComplete="new-password"
                                        className="w-full h-12 px-4 bg-[#1a1a2e] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
                                    >
                                        {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>

                                {/* Confirm Password */}
                                <div className="relative">
                                    <input
                                        type={showPasswords.confirm ? 'text' : 'password'}
                                        placeholder="Confirm New Password"
                                        value={passwordData.confirm}
                                        onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                                        autoComplete="new-password"
                                        className="w-full h-12 px-4 bg-[#1a1a2e] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
                                    >
                                        {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>

                                {passwordError && (
                                    <p className="text-red-400 text-sm">{passwordError}</p>
                                )}

                                {passwordSuccess && (
                                    <p className="text-green-400 text-sm flex items-center gap-2">
                                        <Check size={16} /> Password changed successfully!
                                    </p>
                                )}

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => {
                                            setShowPasswordSection(false);
                                            setPasswordData({ current: '', new: '', confirm: '' });
                                            setPasswordError('');
                                        }}
                                        className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl border border-white/10 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handlePasswordChange}
                                        disabled={passwordLoading || !passwordData.current || !passwordData.new || !passwordData.confirm}
                                        className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {passwordLoading ? (
                                            <>
                                                <Loader size={18} className="animate-spin" />
                                                Updating...
                                            </>
                                        ) : (
                                            'Update Password'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-[#13131f] border border-red-500/20 rounded-xl lg:rounded-2xl mt-6 p-4 lg:p-6">
                <h3 className="text-sm font-semibold text-red-400/60 uppercase tracking-wide mb-4 flex items-center gap-2">
                    <AlertTriangle size={14} /> Danger Zone
                </h3>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-red-500/5 border border-red-500/10 rounded-xl">
                    <div>
                        <p className="font-medium text-white">Delete Account</p>
                        <p className="text-xs text-white/40">Schedule account deletion with a 14-day grace period to undo.</p>
                    </div>
                    <button
                        onClick={() => setShowDeleteModal(true)}
                        className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-medium rounded-xl border border-red-500/20 hover:border-red-500/40 transition-all flex-shrink-0"
                    >
                        Delete Account
                    </button>
                </div>
            </div>

            {/* Delete Account Modal */}
            <DeleteAccountModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
            />
        </div>
    );
};

export default Profile;
