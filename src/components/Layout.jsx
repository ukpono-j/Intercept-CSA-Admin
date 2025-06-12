// src/components/Layout.jsx
import { Outlet, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';

const Layout = () => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Sync with sidebar state
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      // Auto-collapse on mobile
      if (mobile) {
        setIsCollapsed(true);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // console.log('Layout: Rendering for route', location.pathname);

  const handleLogout = () => {
    // console.log('Layout: Logging out');
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  // Calculate margin based on sidebar state
  const getMainMargin = () => {
    if (isMobile) {
      return 'ml-0'; // No margin on mobile since sidebar is overlay
    }
    return isCollapsed ? 'ml-20' : 'ml-72';
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Fixed Sidebar */}
      <div className="fixed top-0 left-0 h-screen z-30">
        <Sidebar 
          onLogout={handleLogout} 
          onToggle={setIsCollapsed} 
          isCollapsed={isCollapsed}
          isMobile={isMobile}
        />
      </div>
      
      {/* Main Content - Dynamic margin based on sidebar state */}
      <main className={`flex-1 min-h-screen overflow-y-auto ${getMainMargin()} transition-all duration-300`}>
        <div className="p-4 lg:p-8">
          <div className="w-full max-w-full">
            <Outlet />
            {location.pathname === '/admin' && 
             !window.location.pathname.includes('create-blog') && 
             !window.location.pathname.includes('show-reports') && 
             !window.location.pathname.includes('manage-blog') && 
             !window.location.pathname.includes('registrations') && (
              <div className="mt-8">
                {/* Default Admin Dashboard Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-r from-orange-500/10 to-rose-500/10 p-6 rounded-2xl border border-orange-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Registrations</h3>
                    <p className="text-3xl font-bold text-orange-600">0</p>
                  </div>
                  <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 p-6 rounded-2xl border border-blue-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Blog Posts</h3>
                    <p className="text-3xl font-bold text-blue-600">0</p>
                  </div>
                  <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 p-6 rounded-2xl border border-green-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Active Users</h3>
                    <p className="text-3xl font-bold text-green-600">0</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;