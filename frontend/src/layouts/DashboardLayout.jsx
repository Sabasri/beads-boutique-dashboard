import React, { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { FiX, FiInfo } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

const DashboardLayout = () => {
  const { isAuthenticated, loading } = useAuth();
  const { latestAlert, dismissAlert } = useNotifications();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(() => {
    return localStorage.getItem('sidebar_collapsed') === 'true';
  });

  // Persist desktop sidebar collapse state
  useEffect(() => {
    localStorage.setItem('sidebar_collapsed', desktopCollapsed);
  }, [desktopCollapsed]);

  // If loading user state, show a beautiful loading splash
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-brand-cream dark:bg-brand-dark">
        <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-brand-pink/30 animate-pulse-gold">
          <div className="w-10 h-10 rounded-full bg-brand-rosegold/80 animate-ping absolute" />
          <span className="text-2xl font-bold text-brand-rosegold font-headings">B</span>
        </div>
        <p className="mt-6 text-sm font-semibold tracking-wider text-brand-rosegold/80 dark:text-brand-pink animate-pulse">
          Loading boutique portal...
        </p>
      </div>
    );
  }

  // Redirect unauthenticated users to the Login page
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-brand-cream dark:bg-brand-dark transition-colors duration-200">
      
      {/* Navigation Sidebar */}
      <Sidebar 
        isOpen={mobileOpen} 
        isCollapsed={desktopCollapsed}
        toggleCollapse={() => setDesktopCollapsed(!desktopCollapsed)}
        closeSidebar={() => setMobileOpen(false)}
      />

      {/* Main Content Wrap */}
      <div className={`flex flex-col min-h-screen transition-all duration-300 ease-in-out
        ${desktopCollapsed ? 'lg:pl-20' : 'lg:pl-64'}`}
      >
        {/* Top Header Navigation */}
        <Topbar onMenuClick={() => setMobileOpen(true)} />

        {/* Dashboard Pages Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 animate-fade-in focus:outline-none">
          <Outlet />
        </main>
      </div>

      {/* Real-Time Floating Banner Toast Alert */}
      {latestAlert && (
        <div className="fixed bottom-6 right-6 z-50 flex items-start p-4 w-90 sm:w-96 max-w-[calc(100vw-48px)] rounded-2xl border border-brand-pink/30 bg-white/95 dark:bg-brand-darkSecondary/95 shadow-2xl backdrop-blur-md animate-slide-in-up">
          <div className={`flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-full mr-3.5
            ${latestAlert.type === 'order' ? 'bg-success/15 text-success' :
              latestAlert.type === 'stock' ? 'bg-danger/15 text-danger' : 'bg-brand-gold/20 text-brand-rosegold'}
          `}>
            <FiInfo className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0 pr-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-rosegold dark:text-brand-pink mb-0.5">
              {latestAlert.type === 'order' ? 'New Order Received' :
               latestAlert.type === 'stock' ? 'Inventory Alert' : 'Revenue Milestone'}
            </h4>
            <p className="text-sm font-medium leading-normal text-slate-700 dark:text-slate-300">
              {latestAlert.message}
            </p>
          </div>
          <button 
            onClick={dismissAlert}
            className="flex-shrink-0 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-brand-dark"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;
