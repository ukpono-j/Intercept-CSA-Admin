// src/components/Sidebar.jsx
import { NavLink } from 'react-router-dom';
import { useState, useEffect } from 'react';

const Sidebar = ({ onLogout, onToggle, isCollapsed: parentIsCollapsed, isMobile: parentIsMobile }) => {
  // Use parent state if provided, otherwise manage locally
  const [localIsCollapsed, setLocalIsCollapsed] = useState(false);
  const [localIsMobile, setLocalIsMobile] = useState(false);
  
  // Use parent props if available, otherwise use local state
  const isCollapsed = parentIsCollapsed !== undefined ? parentIsCollapsed : localIsCollapsed;
  const isMobile = parentIsMobile !== undefined ? parentIsMobile : localIsMobile;

  // Check if screen is mobile size (only if parent doesn't provide state)
  useEffect(() => {
    if (parentIsMobile === undefined || parentIsCollapsed === undefined) {
      const checkScreenSize = () => {
        const mobile = window.innerWidth < 1024;
        setLocalIsMobile(mobile);
        // Auto-collapse on mobile
        if (mobile) {
          setLocalIsCollapsed(true);
          onToggle?.(true);
        }
      };

      checkScreenSize();
      window.addEventListener('resize', checkScreenSize);
      return () => window.removeEventListener('resize', checkScreenSize);
    }
  }, [parentIsMobile, parentIsCollapsed, onToggle]);

  const toggleSidebar = () => {
    const newCollapsed = !isCollapsed;
    if (onToggle) {
      onToggle(newCollapsed);
    } else {
      setLocalIsCollapsed(newCollapsed);
    }
  };

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" /></svg> },
    { path: '/admin/registrations', label: 'Registrations', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" /></svg> },
    { path: '/admin/create-blog', label: 'Create Blog', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg> },
    { path: '/admin/manage-blog', label: 'Manage Blog', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg> },
    { path: '/admin/show-reports', label: 'Show Reports', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg> },
  ];

  return (
    <>
      {/* Mobile/Tablet Overlay */}
      {isMobile && !isCollapsed && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => {
            if (onToggle) {
              onToggle(true);
            } else {
              setLocalIsCollapsed(true);
            }
          }}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        ${isMobile ? 'fixed' : 'relative'} 
        ${isCollapsed ? (isMobile ? '-translate-x-full' : 'w-20') : (isMobile ? 'w-72' : 'w-72')} 
        ${isMobile ? 'left-0 top-0 h-full z-50' : 'h-screen'} 
        bg-black transition-all duration-300 shadow-2xl border-r border-slate-700/50 flex flex-col
      `}>
        {/* Toggle Button */}
        <button
          onClick={toggleSidebar}
          className={`
            absolute top-8 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 
            text-white p-2 rounded-full shadow-lg z-10 transition-all duration-300
            ${isMobile ? 
              (isCollapsed ? '-right-4 translate-x-full' : 'right-4') : 
              (isCollapsed ? '-right-4' : '-right-4')
            }
          `}
        >
          <svg className={`w-4 h-4 transition-transform duration-300 ${
            isMobile ? 
              (isCollapsed ? '' : 'rotate-180') : 
              (isCollapsed ? 'rotate-180' : '')
          }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Top Section - Logo and Navigation */}
        <div className="flex-1 p-6 overflow-y-auto">
          {/* Logo/Header */}
          <div className="flex items-center mb-12">
            <div className="bg-gradient-to-r from-orange-500 to-rose-500 p-3 rounded-2xl shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            {(!isCollapsed || isMobile) && (
              <div className="ml-3">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-rose-400 bg-clip-text text-transparent">
                  Admin
                </h2>
                <p className="text-slate-400 text-sm">Control Panel</p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="space-y-3">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => {
                  if (isMobile) {
                    if (onToggle) {
                      onToggle(true);
                    } else {
                      setLocalIsCollapsed(true);
                    }
                  }
                }}
                className={({ isActive }) =>
                  `group relative flex items-center ${
                    (isCollapsed && !isMobile) ? 'justify-center px-3' : 'px-4'
                  } py-4 rounded-2xl transition-all duration-300
                  ${isActive ? 
                    'bg-gradient-to-r from-orange-500/20 to-rose-500/20 text-orange-400 shadow-lg' : 
                    'text-slate-300 hover:text-white hover:bg-gradient-to-r hover:from-slate-700/50 hover:to-slate-600/50'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-orange-400 to-rose-400 rounded-r-full"></div>
                    )}
                    <div className={`relative ${isActive ? 'text-orange-400' : 'text-slate-400 group-hover:text-orange-400'}`}>
                      {item.icon}
                      {isActive && (
                        <div className="absolute inset-0 text-orange-400 animate-pulse opacity-50">{item.icon}</div>
                      )}
                    </div>
                    {(!isCollapsed || isMobile) && (
                      <span className={`ml-4 font-semibold ${isActive ? 'text-orange-400' : 'group-hover:text-white'}`}>
                        {item.label}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Bottom Section - User Profile (Fixed at Bottom) */}
        {(!isCollapsed || isMobile) && (
          <div className="p-6 border-t border-slate-700/50">
            <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 rounded-2xl p-4 border border-slate-600/30">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-rose-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">A</span>
                </div>
                <div className="ml-3">
                  <p className="text-white font-semibold text-sm">Admin User</p>
                  <p className="text-slate-400 text-xs">Administrator</p>
                </div>
              </div>
              <div className="mt-3 flex space-x-2">
                <button className="flex-1 bg-gradient-to-r from-orange-500/20 to-rose-500/20 hover:from-orange-500/30 hover:to-rose-500/30 text-orange-400 py-2 px-3 rounded-lg text-xs transition-all duration-200">
                  Settings
                </button>
                <button
                  onClick={onLogout}
                  className="flex-1 bg-gradient-to-r from-slate-600/20 to-slate-500/20 hover:from-red-500/20 hover:to-red-600/20 text-slate-300 hover:text-red-400 py-2 px-3 rounded-lg text-xs transition-all duration-200"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Sidebar;