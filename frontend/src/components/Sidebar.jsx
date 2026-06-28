import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  FiHome, FiGrid, FiLayers, FiShoppingBag, 
  FiUsers, FiFileText, FiBarChart2, FiSettings, 
  FiLogOut, FiChevronLeft, FiChevronRight,
  FiPackage, FiAlertTriangle
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

const Sidebar = ({ isOpen, isCollapsed, toggleCollapse, closeSidebar }) => {
  const { logout, user } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  const menuItems = [
    { 
      name: 'Dashboard', 
      path: '/dashboard', 
      icon: <FiHome className="w-5 h-5" />,
      description: 'Overview & KPIs'
    },
    { 
      name: 'Products', 
      path: '/products', 
      icon: <FiGrid className="w-5 h-5" />,
      description: 'Catalog management'
    },
    { 
      name: 'Inventory', 
      path: '/inventory', 
      icon: <FiLayers className="w-5 h-5" />,
      description: 'Stock tracking'
    },
    { 
      name: 'Orders', 
      path: '/orders', 
      icon: <FiShoppingBag className="w-5 h-5" />,
      description: 'Order fulfilment'
    },
    { 
      name: 'Customers', 
      path: '/customers', 
      icon: <FiUsers className="w-5 h-5" />,
      description: 'Customer profiles'
    },
    { 
      name: 'Sales Reports', 
      path: '/reports', 
      icon: <FiFileText className="w-5 h-5" />,
      description: 'Revenue reports'
    },
    { 
      name: 'Analytics', 
      path: '/analytics', 
      icon: <FiBarChart2 className="w-5 h-5" />,
      description: 'Business intelligence'
    },
    { 
      name: 'Settings', 
      path: '/settings', 
      icon: <FiSettings className="w-5 h-5" />,
      description: 'System preferences',
      badge: unreadCount > 0 ? unreadCount : null
    },
  ];

  const sidebarWidthClass = isCollapsed ? 'w-20' : 'w-64';

  // Get initials for avatar
  const getInitials = (name = '') =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden" 
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col h-screen transition-all duration-300 ease-in-out 
          border-r border-brand-pink/20 dark:border-brand-darkBorder 
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} 
          ${sidebarWidthClass}
          bg-white/90 dark:bg-brand-darkSecondary/97 backdrop-blur-lg`}
      >
        {/* ── Logo & Brand ────────────────────────────── */}
        <div className="flex items-center justify-between h-20 px-4 border-b border-brand-pink/20 dark:border-brand-darkBorder flex-shrink-0">
          <div className="flex items-center space-x-3 overflow-hidden min-w-0">
            {/* Brand Logo Icon */}
            <div 
              className="flex items-center justify-center flex-shrink-0 w-10 h-10 rounded-full cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #B76E79, #D4AF37)' }}
              onClick={() => { navigate('/dashboard'); closeSidebar(); }}
            >
              <span className="text-xl font-bold font-headings text-white select-none">B</span>
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0 animate-fade-in">
                <span className="text-sm font-bold tracking-wide text-slate-800 dark:text-slate-100 font-headings truncate">
                  Beads &amp; Bracelets
                </span>
                <span className="text-[10px] font-semibold text-brand-rosegold dark:text-brand-pink tracking-widest uppercase">
                  Boutique ✦
                </span>
              </div>
            )}
          </div>

          {/* Collapse Toggle (desktop only) */}
          <button 
            onClick={toggleCollapse}
            className="hidden lg:flex items-center justify-center p-1.5 rounded-full hover:bg-brand-pink/30 dark:hover:bg-brand-darkBorder text-slate-400 hover:text-brand-rosegold transition-colors focus:outline-none flex-shrink-0"
          >
            {isCollapsed 
              ? <FiChevronRight className="w-4 h-4" /> 
              : <FiChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* ── Jewelry Showcase Image (expanded only) ── */}
        {!isCollapsed && (
          <div className="relative mx-4 mt-4 mb-1 rounded-2xl overflow-hidden animate-fade-in group cursor-pointer flex-shrink-0"
            onClick={() => { navigate('/products'); closeSidebar(); }}
          >
            <img 
              src="/hero_bracelets.png" 
              alt="Jewelry Collection"
              className="w-full h-24 object-cover object-center group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-2.5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/90">New Collection</p>
              <p className="text-xs text-white font-semibold">Browse Products →</p>
            </div>
          </div>
        )}

        {/* ── Navigation ─────────────────────────────── */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {/* Section label */}
          {!isCollapsed && (
            <p className="px-3 mb-2 text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-600">
              Main Navigation
            </p>
          )}

          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={closeSidebar}
              title={isCollapsed ? item.name : undefined}
              className={({ isActive }) => `
                relative flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 group
                ${isActive 
                  ? 'bg-gradient-to-r from-brand-rosegold to-brand-rosegold/80 text-white shadow-md' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-brand-pink/25 dark:hover:bg-brand-darkBorder hover:text-brand-rosegold dark:hover:text-brand-pink'
                }
                ${isCollapsed ? 'justify-center' : ''}
              `}
            >
              {/* Icon */}
              <span className="flex-shrink-0">{item.icon}</span>

              {/* Label + sub-description */}
              {!isCollapsed && (
                <div className="ml-3 flex-1 min-w-0">
                  <span className="block font-semibold text-sm leading-tight">{item.name}</span>
                  <span className="block text-[10px] opacity-60 leading-tight mt-0.5 truncate">{item.description}</span>
                </div>
              )}

              {/* Badge */}
              {!isCollapsed && item.badge && (
                <span className="ml-auto flex-shrink-0 flex items-center justify-center w-5 h-5 text-[10px] font-bold rounded-full bg-danger text-white">
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              )}

              {/* Tooltip for collapsed mode */}
              {isCollapsed && (
                <div className="absolute left-full ml-3 px-3 py-2 bg-slate-800 dark:bg-slate-700 text-white text-xs rounded-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 z-50 whitespace-nowrap shadow-xl">
                  <span className="font-semibold">{item.name}</span>
                  <span className="block text-[10px] text-slate-400 mt-0.5">{item.description}</span>
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* ── Bottom: Quick Stats Strip ────────────────── */}
        {!isCollapsed && (
          <div className="mx-4 mb-3 p-3 rounded-xl bg-brand-pink/20 dark:bg-brand-rosegold/10 border border-brand-pink/30 dark:border-brand-darkBorder animate-fade-in">
            <div className="grid grid-cols-2 gap-2 text-center">
              <div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Alerts</p>
                <p className="text-sm font-black text-brand-rosegold">{unreadCount}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Role</p>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 capitalize truncate">{user?.role || '—'}</p>
              </div>
            </div>
          </div>
        )}

        {/* ── User / Logout ───────────────────────────── */}
        <div className="p-3 border-t border-brand-pink/20 dark:border-brand-darkBorder flex-shrink-0">
          {!isCollapsed && user && (
            <div className="flex items-center px-2 py-2.5 mb-2 space-x-3 rounded-xl bg-brand-pink/10 dark:bg-brand-dark/40 border border-brand-pink/15 dark:border-brand-darkBorder">
              {/* Avatar with gradient */}
              <div 
                className="flex items-center justify-center w-9 h-9 rounded-full text-white text-xs font-bold flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #B76E79, #D4AF37)' }}
              >
                {getInitials(user.name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{user.name}</p>
                <p className="text-[10px] text-brand-rosegold dark:text-brand-pink capitalize font-medium">{user.role} account</p>
              </div>
            </div>
          )}

          <button
            onClick={logout}
            title="Logout"
            className={`flex items-center w-full px-3 py-2.5 text-sm font-medium text-danger hover:bg-danger/10 rounded-xl transition-all duration-200
              ${isCollapsed ? 'justify-center' : ''}`}
          >
            <FiLogOut className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span className="ml-3">Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
