import React, { useState, useEffect, useRef } from 'react';
import { FiBell, FiShoppingBag, FiLayers, FiAward, FiCheck, FiMail } from 'react-icons/fi';
import { useNotifications } from '../context/NotificationContext';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (id, read) => {
    if (!read) {
      markAsRead(id);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order':
        return (
          <div className="flex items-center justify-center flex-shrink-0 w-9 h-9 rounded-full bg-success/10 text-success">
            <FiShoppingBag className="w-4 h-4" />
          </div>
        );
      case 'stock':
        return (
          <div className="flex items-center justify-center flex-shrink-0 w-9 h-9 rounded-full bg-danger/10 text-danger animate-pulse">
            <FiLayers className="w-4 h-4" />
          </div>
        );
      case 'milestone':
        return (
          <div className="flex items-center justify-center flex-shrink-0 w-9 h-9 rounded-full bg-brand-gold/20 text-brand-rosegold">
            <FiAward className="w-4 h-4" />
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center flex-shrink-0 w-9 h-9 rounded-full bg-slate-100 dark:bg-brand-darkBorder text-slate-500">
            <FiMail className="w-4 h-4" />
          </div>
        );
    }
  };

  const formatTimeAgo = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 text-slate-600 dark:text-slate-300 hover:bg-brand-pink/20 dark:hover:bg-brand-darkBorder rounded-xl transition-colors duration-200 focus:outline-none"
      >
        <FiBell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white ring-2 ring-white dark:ring-brand-dark">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 z-50 rounded-2xl border border-brand-pink/20 dark:border-brand-darkBorder bg-white/95 dark:bg-brand-darkSecondary/95 shadow-xl backdrop-blur-md animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-brand-pink/10 dark:border-brand-darkBorder">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-slate-800 dark:text-slate-100">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-semibold bg-brand-pink dark:bg-brand-rosegold text-brand-rosegold dark:text-brand-pink rounded-full">
                  {unreadCount} New
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs font-medium text-brand-rosegold dark:text-brand-pink hover:underline focus:outline-none"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* List Content */}
          <div className="max-h-[360px] overflow-y-auto divide-y divide-brand-pink/10 dark:divide-brand-darkBorder">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-slate-400 dark:text-slate-500">
                <FiBell className="w-8 h-8 mb-2 stroke-1" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  onClick={() => handleNotificationClick(n._id, n.read)}
                  className={`flex p-4 text-left transition-colors duration-150 cursor-pointer group
                    ${!n.read 
                      ? 'bg-brand-pink/5 dark:bg-brand-rosegold/5 hover:bg-brand-pink/10 dark:hover:bg-brand-rosegold/10' 
                      : 'hover:bg-slate-50 dark:hover:bg-brand-dark/20'}
                  `}
                >
                  {getNotificationIcon(n.type)}
                  <div className="flex-1 min-w-0 ml-3.5">
                    <p className={`text-sm leading-relaxed text-slate-700 dark:text-slate-300
                      ${!n.read ? 'font-semibold text-slate-900 dark:text-slate-100' : ''}
                    `}>
                      {n.message}
                    </p>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 block mt-1.5 font-medium">
                      {formatTimeAgo(n.createdAt)}
                    </span>
                  </div>
                  {!n.read && (
                    <div className="flex items-center justify-center ml-2 flex-shrink-0">
                      <span className="w-2.5 h-2.5 bg-brand-rosegold rounded-full group-hover:hidden" />
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(n._id);
                        }}
                        className="hidden group-hover:flex p-1 rounded-full text-slate-400 hover:text-brand-rosegold hover:bg-slate-100 dark:hover:bg-brand-dark"
                      >
                        <FiCheck className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-brand-pink/10 dark:border-brand-darkBorder text-center">
            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
              Real-time stock & sales updates enabled
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
