import { NavLink } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './Sidebar.css';

const Sidebar = ({ onLogout, onToggle, isCollapsed: parentIsCollapsed, isMobile: parentIsMobile }) => {
  const [localIsCollapsed, setLocalIsCollapsed] = useState(false);
  const [localIsMobile, setLocalIsMobile] = useState(false);
  
  const isCollapsed = parentIsCollapsed !== undefined ? parentIsCollapsed : localIsCollapsed;
  const isMobile = parentIsMobile !== undefined ? parentIsMobile : localIsMobile;

  useEffect(() => {
    if (parentIsMobile === undefined || parentIsCollapsed === undefined) {
      const checkScreenSize = () => {
        const mobile = window.innerWidth < 768;
        setLocalIsMobile(mobile);
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
    { 
      path: '/admin', 
      label: 'Dashboard', 
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg> 
    },
    { 
      path: '/admin/registrations', 
      label: 'Registrations', 
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg> 
    },
    { 
      path: '/admin/create-blog', 
      label: 'Create Blog', 
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg> 
    },
    { 
      path: '/admin/manage-blog', 
      label: 'Manage Blog', 
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg> 
    },
    { 
      path: '/admin/podcasts', 
      label: 'Manage Podcasts', 
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg> 
    },
    { 
      path: '/admin/show-reports', 
      label: 'Show Reports', 
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg> 
    },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && !isCollapsed && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
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
        ${isMobile ? 'fixed' : 'fixed'} 
        ${isCollapsed ? (isMobile ? '-translate-x-full' : 'w-20') : (isMobile ? 'w-[85vw] max-w-[320px]' : 'w-70')} 
        left-0 top-0 h-full z-50 
        bg-white border-r border-gray-100 transition-all duration-300 shadow-xl flex flex-col sidebar
      `}>
        
        {/* Header Section */}
        <div className="relative bg-gradient-to-br from-[#064540] to-[#2A8E9D] text-white p-6">
          {/* Toggle Button */}
          <button
            onClick={toggleSidebar}
            className={`
              absolute top-4 bg-[black] text-white p-2.5 rounded-xl shadow-lg border border-white/20 transition-all duration-300
              ${isMobile ? (isCollapsed ? 'right-0 translate-x-full' : 'right-4') : (isCollapsed ? '-right-4' : 'right-4')}
            `}
          >
            <svg className={`w-4 h-4 transition-transform duration-300 ${isCollapsed ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Logo and Title */}
          <div className="flex items-center">
            {/* <div className="relative">
              <div className="w-12 h-12 bg-[#FECB0A] rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-[#064540]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#FECB0A] rounded-full opacity-60"></div>
            </div> */}
            {(!isCollapsed || isMobile) && (
              <div className="">
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  Admin Panel
                </h1>
                <p className="text-white/70 text-sm font-medium">Control Center</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 p-4 bg-gray-50/50">
          <nav className="space-y-1">
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
                  } py-3.5 rounded-xl transition-all duration-300 font-medium
                  ${isActive 
                    ? 'bg-[#FECB0A] text-[#064540] shadow-md shadow-[#FECB0A]/25' 
                    : 'text-gray-600 hover:text-[#064540] hover:bg-white/80 hover:shadow-sm'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className={`relative transition-all duration-300 ${
                      isActive ? 'text-[#064540] scale-110' : 'text-gray-500 group-hover:text-[#064540] group-hover:scale-105'
                    }`}>
                      {item.icon}
                    </div>
                    {(!isCollapsed || isMobile) && (
                      <span className={`ml-3.5 font-semibold text-sm transition-all duration-300 ${
                        isActive ? 'text-[#064540]' : 'group-hover:text-[#064540]'
                      }`}>
                        {item.label}
                      </span>
                    )}
                    {isActive && (!isCollapsed || isMobile) && (
                      <div className="absolute right-3 w-2 h-2 bg-[#064540]/20 rounded-full"></div>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* User Profile Section */}
        <div className="p-4 bg-white border-t border-gray-100">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-2xl p-4 border border-gray-200/50">
            <div className="flex items-center">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-[#064540] to-[#2A8E9D] rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-sm">A</span>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#FECB0A] rounded-full border-2 border-white"></div>
              </div>
              {(!isCollapsed || isMobile) && (
                <div className="ml-3 flex-1">
                  <p className="text-gray-800 font-semibold text-sm">Admin User</p>
                  <p className="text-gray-500 text-xs">Administrator</p>
                </div>
              )}
            </div>
            
            {(!isCollapsed || isMobile) && (
              <div className="mt-4 flex gap-2">
                {/* <button className="flex-1 bg-gradient-to-r from-[#064540] to-[#2A8E9D] hover:from-[#2A8E9D] hover:to-[#064540] text-white py-2.5 px-4 rounded-xl text-sm font-medium transition-all duration-300 shadow-md hover:shadow-lg hover:scale-[1.02]">
                  Settings
                </button> */}
                <button
                  onClick={onLogout}
                  className="flex-1 bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 py-2.5 px-4 rounded-xl text-sm font-medium transition-all duration-300 border border-gray-200 hover:border-red-200 hover:scale-[1.02]"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;