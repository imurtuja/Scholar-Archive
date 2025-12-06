import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { BookOpen, FileText, Calendar, ArrowRight, FolderOpen, Sparkles, GraduationCap, User, Clock, CheckCircle, Trash2, Plus } from 'lucide-react';
import usePageTitle from '../hooks/usePageTitle';

const Dashboard = () => {
    usePageTitle('Dashboard');
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalSubjects: 0,
        totalResources: 0,
        recentActivity: [],
        upcomingExams: [],
        ongoingExams: []
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch('/api/dashboard/stats', {
                    headers: { 'x-auth-token': token }
                });
                const data = await res.json();
                if (res.ok) setStats(data);
            } catch (error) {
                console.error('Error fetching stats:', error);
            }
        };
        fetchStats();
    }, []);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    // Format time from 24h to 12h format
    const formatTime = (timeStr) => {
        if (!timeStr) return '';
        if (timeStr.toLowerCase().includes('m')) return timeStr; // Already formatted

        const [hours, minutes] = timeStr.split(':');
        const h = parseInt(hours, 10);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        return `${h12}:${minutes || '00'} ${ampm}`;
    };

    const allExams = [
        ...(stats.ongoingExams || []).map(e => ({ ...e, isLive: true })),
        ...(stats.upcomingExams || [])
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-4 lg:space-y-6">
            {/* Header */}
            <div className="mb-4 lg:mb-8">
                <div className="flex items-center gap-2 text-white/40 text-xs lg:text-sm mb-1">
                    <Sparkles size={14} className="text-indigo-400" />
                    <span>{getGreeting()}</span>
                </div>
                <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                    Hello, <span className="text-gradient">{user?.name?.split(' ')[0] || 'Scholar'}</span>
                </h1>
                <div className="flex flex-wrap items-center gap-2 lg:gap-3">
                    {user?.currentYear && (
                        <span className="px-2.5 py-1 text-xs font-medium bg-indigo-500/20 text-indigo-300 rounded-lg border border-indigo-500/30">
                            Year {user.currentYear}
                        </span>
                    )}
                    {user?.course && (
                        <span className="text-xs lg:text-sm text-white/50">{user.course}</span>
                    )}
                    {user?.institution && (
                        <span className="text-xs text-white/30 hidden sm:inline">• {user.institution}</span>
                    )}
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                <Link to="/subjects" className="group relative bg-[#13131f] border border-white/10 rounded-xl lg:rounded-2xl p-4 lg:p-5 hover:border-indigo-500/50 transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/10 overflow-hidden">
                    {/* Gradient Glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 to-purple-500/0 group-hover:from-indigo-500/5 group-hover:to-purple-500/5 transition-all duration-300" />
                    <div className="relative flex items-center justify-between mb-2 lg:mb-3">
                        <span className="text-[10px] lg:text-xs text-white/30 font-medium uppercase tracking-wide">Subjects</span>
                        <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                            <BookOpen size={16} className="lg:w-[18px] lg:h-[18px]" />
                        </div>
                    </div>
                    <h3 className="relative text-2xl lg:text-3xl font-bold text-white">{stats.totalSubjects || 0}</h3>
                </Link>

                <Link to="/resources" className="group relative bg-[#13131f] border border-white/10 rounded-xl lg:rounded-2xl p-4 lg:p-5 hover:border-purple-500/50 transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-500/10 overflow-hidden">
                    {/* Gradient Glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-pink-500/0 group-hover:from-purple-500/5 group-hover:to-pink-500/5 transition-all duration-300" />
                    <div className="relative flex items-center justify-between mb-2 lg:mb-3">
                        <span className="text-[10px] lg:text-xs text-white/30 font-medium uppercase tracking-wide">Resources</span>
                        <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
                            <FileText size={16} className="lg:w-[18px] lg:h-[18px]" />
                        </div>
                    </div>
                    <h3 className="relative text-2xl lg:text-3xl font-bold text-white">{stats.totalResources || 0}</h3>
                </Link>

                <Link to="/timetable" className="group relative bg-[#13131f] border border-white/10 rounded-xl lg:rounded-2xl p-4 lg:p-5 hover:border-pink-500/50 transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:shadow-lg hover:shadow-pink-500/10 overflow-hidden">
                    {/* Gradient Glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500/0 to-rose-500/0 group-hover:from-pink-500/5 group-hover:to-rose-500/5 transition-all duration-300" />
                    <div className="relative flex items-center justify-between mb-2 lg:mb-3">
                        <span className="text-[10px] lg:text-xs text-white/30 font-medium uppercase tracking-wide">Exams</span>
                        <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white shadow-lg shadow-pink-500/20 group-hover:scale-110 transition-transform">
                            <Calendar size={16} className="lg:w-[18px] lg:h-[18px]" />
                        </div>
                    </div>
                    <h3 className="relative text-2xl lg:text-3xl font-bold text-white">{allExams.length}</h3>
                </Link>

                <Link to="/subjects" className="group relative bg-[#13131f] border border-white/10 rounded-xl lg:rounded-2xl p-4 lg:p-5 hover:border-rose-500/50 transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:shadow-lg hover:shadow-rose-500/10 overflow-hidden">
                    {/* Gradient Glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-rose-500/0 to-orange-500/0 group-hover:from-rose-500/5 group-hover:to-orange-500/5 transition-all duration-300" />
                    <div className="relative flex items-center justify-between mb-2 lg:mb-3">
                        <span className="text-[10px] lg:text-xs text-white/30 font-medium uppercase tracking-wide">Year</span>
                        <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl bg-gradient-to-br from-rose-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-rose-500/20 group-hover:scale-110 transition-transform">
                            <GraduationCap size={16} className="lg:w-[18px] lg:h-[18px]" />
                        </div>
                    </div>
                    <h3 className="relative text-2xl lg:text-3xl font-bold text-white">{user?.currentYear || 1}<span className="text-base lg:text-lg text-white/40">/{user?.durationYears || 4}</span></h3>
                </Link>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-6">
                {/* Exam Schedule - 3 cols */}
                <div className="lg:col-span-3 bg-[#13131f] border border-white/10 hover:border-indigo-500/30 rounded-xl lg:rounded-2xl p-4 lg:p-6 transition-all duration-300">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="font-bold text-white flex items-center gap-2">
                            <Calendar size={18} className="text-indigo-400" />
                            Exam Schedule
                        </h3>
                        <Link to="/timetable" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                            View All <ArrowRight size={12} />
                        </Link>
                    </div>

                    {allExams.length > 0 ? (
                        <div className="space-y-3">
                            {allExams.slice(0, 5).map((exam, i) => (
                                <div key={i} className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${exam.isLive
                                    ? 'bg-gradient-to-r from-red-500/10 to-orange-500/10 border-red-500/20'
                                    : 'bg-white/5 border-white/5 hover:border-indigo-500/20'}`}>
                                    <div className="w-12 text-center flex-shrink-0">
                                        {exam.isLive ? (
                                            <span className="text-xs font-bold text-red-400 bg-red-500/20 px-2 py-1 rounded flex items-center justify-center gap-1">
                                                <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse"></span>
                                                LIVE
                                            </span>
                                        ) : (
                                            <>
                                                <div className="text-[10px] text-indigo-400 font-bold uppercase">{new Date(exam.date).toLocaleDateString('en-US', { weekday: 'short' })}</div>
                                                <div className="text-lg font-bold text-white">{new Date(exam.date).getDate()}</div>
                                                <div className="text-[10px] text-white/40 uppercase">{new Date(exam.date).toLocaleDateString(undefined, { month: 'short' })}</div>
                                            </>
                                        )}
                                    </div>
                                    <div className={`w-0.5 h-8 rounded-full ${exam.isLive ? 'bg-red-500' : 'bg-indigo-500'}`}></div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-medium text-white truncate">{exam.subject}</h4>
                                        <p className="text-xs text-white/40">{formatTime(exam.time)} • {exam.year} Year • {exam.semester}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10">
                            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-3">
                                <Calendar size={24} className="text-white/20" />
                            </div>
                            <p className="text-white/40 text-sm">No upcoming exams</p>
                        </div>
                    )}
                </div>

                {/* Right Column - 2 cols */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Recent Activity */}
                    <div className="bg-[#13131f] border border-white/10 hover:border-purple-500/30 rounded-2xl p-5 transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-white flex items-center gap-2">
                                <Clock size={16} className="text-purple-400" />
                                Recent Activity
                            </h3>
                        </div>

                        {stats.recentActivity?.length > 0 ? (
                            <div className="space-y-2">
                                {stats.recentActivity.slice(0, 5).map((activity, i) => {
                                    const getActivityIcon = (action) => {
                                        switch (action) {
                                            case 'subject_add': return <Plus size={14} />;
                                            case 'subject_delete': return <Trash2 size={14} />;
                                            case 'exam_add': return <Calendar size={14} />;
                                            case 'exam_delete': return <Trash2 size={14} />;
                                            case 'exam_complete': return <CheckCircle size={14} />;
                                            case 'profile_update': return <User size={14} />;
                                            case 'resource_add': return <FileText size={14} />;
                                            default: return <Clock size={14} />;
                                        }
                                    };
                                    const getActivityColor = (action) => {
                                        if (action.includes('add')) return 'bg-green-500/10 text-green-400';
                                        if (action.includes('delete')) return 'bg-red-500/10 text-red-400';
                                        if (action.includes('complete')) return 'bg-blue-500/10 text-blue-400';
                                        if (action.includes('profile')) return 'bg-purple-500/10 text-purple-400';
                                        return 'bg-white/10 text-white/50';
                                    };

                                    return (
                                        <div key={activity._id || i} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${getActivityColor(activity.action)}`}>
                                                {getActivityIcon(activity.action)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-medium text-white truncate">{activity.description}</h4>
                                                <p className="text-xs text-white/30">{new Date(activity.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-6">
                                <p className="text-white/30 text-sm">No recent activity</p>
                            </div>
                        )}
                    </div>

                    {/* Quick Links */}
                    <div className="bg-[#13131f] border border-white/10 hover:border-emerald-500/30 rounded-2xl p-5 transition-all duration-300">
                        <h3 className="font-bold text-white mb-4">Quick Access</h3>
                        <div className="space-y-2">
                            <Link to="/subjects" className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-indigo-500/10 hover:border-indigo-500/20 border border-transparent transition-all group">
                                <BookOpen size={18} className="text-indigo-400" />
                                <span className="text-sm text-white/70 group-hover:text-white flex-1">Academic</span>
                                <ArrowRight size={14} className="text-white/20 group-hover:text-indigo-400" />
                            </Link>
                            <Link to="/resources" className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-purple-500/10 hover:border-purple-500/20 border border-transparent transition-all group">
                                <FolderOpen size={18} className="text-purple-400" />
                                <span className="text-sm text-white/70 group-hover:text-white flex-1">Resources</span>
                                <ArrowRight size={14} className="text-white/20 group-hover:text-purple-400" />
                            </Link>
                            <Link to="/timetable" className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-pink-500/10 hover:border-pink-500/20 border border-transparent transition-all group">
                                <Calendar size={18} className="text-pink-400" />
                                <span className="text-sm text-white/70 group-hover:text-white flex-1">Timetable</span>
                                <ArrowRight size={14} className="text-white/20 group-hover:text-pink-400" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
