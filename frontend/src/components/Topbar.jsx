import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiMenu, FiSun, FiMoon, FiUser, FiSettings, 
  FiLogOut, FiChevronDown, FiClock 
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import GlobalSearch from './GlobalSearch';
import NotificationDropdown from './NotificationDropdown';

const Topbar = ({ onMenuClick }) => {
  const [profileOpen, setProfileOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const dropdownRef = useRef(null);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const handleProfileOption = (path) => {
    navigate(path);
    setProfileOpen(false);
  };

  const greeting = () => {
    const h = currentTime.getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const formatDate = (d) =>
    d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  const getInitials = (name = '') =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-20 px-4 sm:px-6 
      bg-white/85 dark:bg-brand-darkSecondary/90 backdrop-blur-xl 
      border-b border-brand-pink/20 dark:border-brand-darkBorder 
      transition-colors duration-200"
    >
      {/* ── Left: Mobile toggle + Brand title ─────────────────────────────── */}
      <div className="flex items-center space-x-3">
        {/* Mobile hamburger */}
        <button
          onClick={onMenuClick}
          className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-brand-pink/20 dark:hover:bg-brand-darkBorder lg:hidden focus:outline-none transition-colors"
          aria-label="Open sidebar"
        >
          <FiMenu className="w-5 h-5" />
        </button>

        {/* Brand identity (hidden on small screens) */}
        <div className="hidden sm:flex items-center space-x-3">
          {/* Small jewelry accent image */}
          <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 shadow-sm border border-brand-pink/20">
            <img 
              src="/hero_bracelets.png" 
              alt="B&B" 
              className="w-full h-full object-cover object-center"
            />
          </div>
          <div className="hidden md:block">
            <p className="text-[10px] font-bold text-brand-rosegold dark:text-brand-pink tracking-widest uppercase">
              Beads &amp; Bracelets Boutique
            </p>
            <h1 className="text-base font-bold text-slate-800 dark:text-slate-100 font-headings leading-tight">
              {greeting()}, {user?.name?.split(' ')[0] || 'there'} 👋
            </h1>
          </div>
        </div>
      </div>

      {/* ── Middle: Global Search ──────────────────────────────────────────── */}
      <div className="flex-1 max-w-sm xl:max-w-md mx-4 hidden md:block">
        <GlobalSearch />
      </div>

      {/* ── Right: Actions ─────────────────────────────────────────────────── */}
      <div className="flex items-center space-x-1 sm:space-x-2">

        {/* Live Date Chip (desktop) */}
        <div className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-brand-pink/15 dark:bg-brand-dark/40 border border-brand-pink/20 dark:border-brand-darkBorder">
          <FiClock className="w-3.5 h-3.5 text-brand-rosegold dark:text-brand-pink flex-shrink-0" />
          <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
            {formatDate(currentTime)}
          </span>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2.5 text-slate-500 dark:text-slate-300 hover:bg-brand-pink/20 dark:hover:bg-brand-darkBorder rounded-xl transition-colors duration-200 focus:outline-none"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
        </button>

        {/* Notifications */}
        <NotificationDropdown />

        {/* Divider */}
        <div className="hidden sm:block w-px h-6 bg-brand-pink/30 dark:bg-brand-darkBorder mx-1" />

        {/* Profile Dropdown */}
        {user && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center space-x-2 p-1.5 hover:bg-brand-pink/15 dark:hover:bg-brand-darkBorder rounded-xl transition-all duration-200 focus:outline-none"
            >
              {/* Avatar with gradient */}
              <div
                className="flex items-center justify-center w-8 h-8 rounded-full text-white text-xs font-bold shadow-inner flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #B76E79, #D4AF37)' }}
              >
                {getInitials(user.name)}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 leading-tight">
                  {user.name.split(' ')[0]}
                </p>
                <p className="text-[10px] text-brand-rosegold dark:text-brand-pink capitalize font-medium leading-tight">
                  {user.role}
                </p>
              </div>
              <FiChevronDown 
                className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} 
              />
            </button>

            {/* Dropdown */}
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-56 z-50 rounded-2xl border border-brand-pink/20 dark:border-brand-darkBorder bg-white/97 dark:bg-brand-darkSecondary shadow-2xl backdrop-blur-md py-2 animate-slide-in-up">
                {/* User header */}
                <div className="px-4 py-3 border-b border-brand-pink/10 dark:border-brand-darkBorder">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #B76E79, #D4AF37)' }}
                    >
                      {getInitials(user.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{user.name}</p>
                      <p className="text-[10px] text-brand-rosegold dark:text-brand-pink capitalize font-semibold">{user.role} account</p>
                    </div>
                  </div>
                </div>

                <div className="p-1.5 space-y-0.5">
                  <button
                    onClick={() => handleProfileOption('/settings')}
                    className="flex items-center w-full px-3 py-2.5 text-sm text-slate-700 dark:text-slate-300 rounded-xl hover:bg-brand-pink/15 dark:hover:bg-brand-darkBorder/40 transition-colors"
                  >
                    <FiUser className="w-4 h-4 mr-3 text-brand-rosegold" /> Profile Settings
                  </button>
                  <button
                    onClick={() => handleProfileOption('/settings')}
                    className="flex items-center w-full px-3 py-2.5 text-sm text-slate-700 dark:text-slate-300 rounded-xl hover:bg-brand-pink/15 dark:hover:bg-brand-darkBorder/40 transition-colors"
                  >
                    <FiSettings className="w-4 h-4 mr-3 text-slate-400" /> System Settings
                  </button>
                </div>

                <div className="border-t border-brand-pink/10 dark:border-brand-darkBorder mt-1 p-1.5">
                  <button
                    onClick={logout}
                    className="flex items-center w-full px-3 py-2.5 text-sm text-danger rounded-xl hover:bg-danger/10 transition-colors"
                  >
                    <FiLogOut className="w-4 h-4 mr-3" /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Topbar;
