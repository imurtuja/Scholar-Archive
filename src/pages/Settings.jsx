import React, { useState, useEffect } from 'react';
import { User, Bell, Moon, Shield, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
    const { user, setAuth } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        bio: '',
        institution: '',
        course: '',
        year: '',
        durationYears: 4
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                bio: user.bio || '',
                institution: user.institution || '',
                course: user.course || '',
                year: user.year || '',
                durationYears: user.durationYears || 4
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleUpdateProfile = async () => {
        setIsSaving(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/auth/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                const data = await res.json();
                setAuth(data.user);
                // Show success feedback
            } else {
                // Show error feedback
            }
        } catch (error) {
            console.error('Error updating profile:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'appearance', label: 'Appearance', icon: Moon },
        { id: 'security', label: 'Security', icon: Shield },
    ];

    return (
        <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-8">Settings</h1>

            <div className="glass-card flex flex-col md:flex-row min-h-[600px] overflow-hidden">
                {/* Settings Sidebar */}
                <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-white/10 p-6 bg-white/5">
                    <div className="flex flex-col gap-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-300 ${activeTab === tab.id
                                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30'
                                        : 'text-white/60 hover:text-white hover:bg-white/10'
                                    }`}
                            >
                                <tab.icon size={18} />
                                <span className="font-medium">{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Settings Content */}
                <div className="flex-1 p-8 md:p-12">
                    {activeTab === 'profile' && (
                        <div className="max-w-lg">
                            <h2 className="text-2xl font-bold text-white mb-8">Profile Information</h2>

                            {/* Avatar */}
                            <div className="flex items-center gap-6 mb-10">
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-3xl font-bold shadow-lg">
                                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <div className="flex gap-3">
                                    <button className="glass-button text-sm">
                                        Change Avatar
                                    </button>
                                    <button className="px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors text-sm border border-transparent hover:border-red-500/20">
                                        Remove
                                    </button>
                                </div>
                            </div>

                            {/* Form */}
                            <form className="flex flex-col gap-5">
                                <div>
                                    <label className="block mb-2 font-medium text-white/70 text-sm">Full Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="input-field"
                                    />
                                </div>
                                <div>
                                    <label className="block mb-2 font-medium text-white/70 text-sm">Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="input-field"
                                    />
                                </div>
                                <div>
                                    <label className="block mb-2 font-medium text-white/70 text-sm">Bio</label>
                                    <textarea
                                        rows="3"
                                        name="bio"
                                        value={formData.bio}
                                        onChange={handleChange}
                                        placeholder="Tell us about yourself..."
                                        className="input-field resize-none"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block mb-2 font-medium text-white/70 text-sm">Institution</label>
                                        <input
                                            type="text"
                                            name="institution"
                                            value={formData.institution}
                                            onChange={handleChange}
                                            className="input-field"
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-2 font-medium text-white/70 text-sm">Course</label>
                                        <input
                                            type="text"
                                            name="course"
                                            value={formData.course}
                                            onChange={handleChange}
                                            className="input-field"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="button"
                                        onClick={handleUpdateProfile}
                                        disabled={isSaving}
                                        className="btn-primary px-6 py-3 rounded-xl flex items-center gap-2 disabled:opacity-50"
                                    >
                                        <Save size={18} />
                                        {isSaving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-8">Notification Preferences</h2>
                            <div className="flex flex-col gap-6">
                                {['Email Notifications', 'Push Notifications', 'Weekly Digest', 'Exam Reminders'].map((item) => (
                                    <div key={item} className="flex items-center justify-between pb-6 border-b border-white/10 last:border-0">
                                        <div>
                                            <h4 className="font-semibold text-white mb-1">{item}</h4>
                                            <p className="text-sm text-white/40">Receive updates about {item.toLowerCase()}.</p>
                                        </div>
                                        <div className="w-12 h-6 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full relative cursor-pointer shadow-lg shadow-indigo-500/30">
                                            <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5 shadow-sm"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="flex flex-col items-center justify-center h-full py-20">
                            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                                <Shield size={40} className="text-white/30" />
                            </div>
                            <h3 className="text-lg font-medium text-white/50">Security settings are managed by the administrator.</h3>
                        </div>
                    )}

                    {activeTab === 'appearance' && (
                        <div className="flex flex-col items-center justify-center h-full py-20">
                            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                                <Moon size={40} className="text-white/30" />
                            </div>
                            <h3 className="text-lg font-medium text-white/50">Appearance settings coming soon</h3>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Settings;
