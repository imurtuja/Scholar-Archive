import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Calendar, FolderOpen, User, LogOut, Share2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [indicatorStyle, setIndicatorStyle] = useState({ top: 0, height: 0 });
  const navRefs = useRef({});

  // Professional ordering: Overview → Core Features → User Account
  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/subjects', label: 'Academic', icon: BookOpen },
    { path: '/timetable', label: 'Timetable', icon: Calendar },
    { path: '/resources', label: 'Resources', icon: FolderOpen },
    { path: '/my-shares', label: 'My Shares', icon: Share2 },
    { path: '/profile', label: 'Profile', icon: User },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Update sliding indicator position
  useEffect(() => {
    const activeItem = navItems.find(item => location.pathname.startsWith(item.path));
    if (activeItem && navRefs.current[activeItem.path]) {
      const element = navRefs.current[activeItem.path];
      setIndicatorStyle({
        top: element.offsetTop,
        height: element.offsetHeight,
      });
    }
  }, [location.pathname]);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="fixed top-[72px] left-0 h-[calc(100vh-72px)] w-64 pt-6 pb-6 px-4 flex-col justify-between glass-panel border-t-0 hidden md:flex transition-all duration-300 z-40">
        {/* Navigation Links */}
        <div className="flex flex-col gap-2 relative">
          {/* Sliding Indicator */}
          <div
            className="absolute left-0 right-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-xl shadow-lg shadow-indigo-500/10 transition-all duration-300 ease-out pointer-events-none"
            style={{
              top: indicatorStyle.top,
              height: indicatorStyle.height,
              opacity: indicatorStyle.height > 0 ? 1 : 0,
            }}
          />

          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              ref={(el) => navRefs.current[item.path] = el}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors duration-200 group relative z-10 ${isActive
                  ? 'text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    size={20}
                    className={`transition-colors duration-200 ${isActive
                      ? 'text-indigo-400'
                      : 'text-white/40 group-hover:text-white/70'
                      }`}
                  />
                  <span>{item.label}</span>
                  {isActive && (
                    <div className="ml-auto w-2 h-2 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400 shadow-[0_0_10px_rgba(99,102,241,0.6)]"></div>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* Sign Out Button */}
        <div className="pt-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-white/50 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-300 font-medium group border border-transparent hover:border-red-500/20"
          >
            <LogOut size={20} className="group-hover:scale-110 transition-transform duration-300" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-[#0e0e1a]/95 backdrop-blur-xl border-t border-white/10 flex md:hidden items-center justify-around z-50 px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 min-w-[60px] ${isActive
                ? 'text-indigo-400'
                : 'text-white/50'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon size={20} />
                <span className="text-[10px] font-medium">{item.label}</span>
                {isActive && (
                  <div className="absolute -top-0.5 w-1 h-1 rounded-full bg-indigo-400"></div>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </>
  );
};

export default Sidebar;

