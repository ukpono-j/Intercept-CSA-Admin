import { Outlet, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';

const Layout = () => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth', // Smooth scrolling for polished UX
    });
  }, [location.pathname]); // Trigger on pathname change

  // Sync with sidebar state
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setIsCollapsed(true);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const getMainMargin = () => {
    if (isMobile) {
      return 'ml-0';
    }
    return isCollapsed ? 'ml-20' : 'ml-64';
  };

  return (
    <div className="flex min-h-screen bg-white">
      <div className="fixed top-0 left-0 h-screen z-30">
        <Sidebar 
          onLogout={handleLogout} 
          onToggle={setIsCollapsed} 
          isCollapsed={isCollapsed}
          isMobile={isMobile}
        />
      </div>
      
      <main className={`flex-1 min-h-screen overflow-y-auto ${getMainMargin()} transition-all duration-300`}>
        <div className="">
          <div className="w-full bg-[#F3F4F6] max-w-full">
            <Outlet />
            {location.pathname === '/admin' && 
             !window.location.pathname.includes('create-blog') && 
             !window.location.pathname.includes('show-reports') && 
             !window.location.pathname.includes('manage-blog') && 
             !window.location.pathname.includes('registrations') && (
              <div className="mt-8 p-3 lg:p-3">
                {/* Empty for now */}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;