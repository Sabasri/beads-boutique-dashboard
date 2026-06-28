import React, { useState } from 'react';
import { 
  FiUser, FiBriefcase, FiBell, FiShield, 
  FiSun, FiMoon, FiCheck, FiInfo, FiAlertCircle 
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Settings = () => {
  const { user, isAdmin, hasRole } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Tab State
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'preferences', 'roles'

  // Form states
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });

  const [businessForm, setBusinessForm] = useState({
    name: 'Beads & Bracelets Boutique',
    tagline: 'Crafting unique stories in every bead, celebrating your personal style.',
    address: '123 Artisan Plaza, Boston, MA 02108',
    taxId: 'TX-987-654-321'
  });

  const [notifications, setNotifications] = useState({
    newOrders: true,
    lowInventory: true,
    outOfStock: true,
    revenueMilestones: true
  });

  const [successMessage, setSuccessMessage] = useState('');

  // Handle forms submit
  const handleSaveProfile = (e) => {
    e.preventDefault();
    setSuccessMessage('Profile settings saved successfully (simulated).');
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const handleSaveBusiness = (e) => {
    e.preventDefault();
    setSuccessMessage('Business metadata updated successfully (simulated).');
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const handleToggleNotification = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    setSuccessMessage('Notification preferences updated.');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // Quick Role Changer for Testing/Fidelity
  const changeRoleDynamically = (newRole) => {
    if (!user) return;
    
    // Update local storage and reload/refresh state
    const updatedUser = { ...user, role: newRole };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    setSuccessMessage(`User role switched to '${newRole}'! Reloading permissions...`);
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 font-headings">Settings</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Configure your profile, notification rules, business details, and system permissions</p>
      </div>

      {/* Success Banner */}
      {successMessage && (
        <div className="flex items-center p-4 rounded-xl bg-success/10 border border-success/20 text-success text-xs animate-fade-in">
          <FiCheck className="mr-2 w-4 h-4" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Tabs Row */}
      <div className="flex border-b border-brand-pink/20 dark:border-brand-darkBorder space-x-6 text-sm">
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 font-semibold flex items-center border-b-2 transition-all focus:outline-none
            ${activeTab === 'profile' 
              ? 'border-brand-rosegold text-brand-rosegold dark:text-brand-pink' 
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          <FiUser className="mr-2 w-4.5 h-4.5" /> Profile & Business
        </button>
        <button
          onClick={() => setActiveTab('preferences')}
          className={`pb-3 font-semibold flex items-center border-b-2 transition-all focus:outline-none
            ${activeTab === 'preferences' 
              ? 'border-brand-rosegold text-brand-rosegold dark:text-brand-pink' 
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          <FiBell className="mr-2 w-4.5 h-4.5" /> System Preferences
        </button>
        <button
          onClick={() => setActiveTab('roles')}
          className={`pb-3 font-semibold flex items-center border-b-2 transition-all focus:outline-none
            ${activeTab === 'roles' 
              ? 'border-brand-rosegold text-brand-rosegold dark:text-brand-pink' 
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          <FiShield className="mr-2 w-4.5 h-4.5" /> Role Management
        </button>
      </div>

      {/* Tab 1: Profile & Business */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
          {/* User Profile Info */}
          <div className="p-6 rounded-2xl bg-white dark:bg-brand-darkSecondary border border-brand-pink/10 dark:border-brand-darkBorder shadow-sm">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 font-headings mb-4 flex items-center">
              <FiUser className="mr-2 text-brand-rosegold" /> Personal Profile
            </h3>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Display Name</label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-brand-darkBorder bg-slate-50 dark:bg-brand-dark/20 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-pink/20"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Email Address</label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-brand-darkBorder bg-slate-50 dark:bg-brand-dark/20 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-pink/20"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-brand-rosegold text-white font-semibold hover:bg-brand-rosegold/95 shadow-md shadow-brand-rosegold/25"
              >
                Update Profile Settings
              </button>
            </form>
          </div>

          {/* Business Information */}
          <div className="p-6 rounded-2xl bg-white dark:bg-brand-darkSecondary border border-brand-pink/10 dark:border-brand-darkBorder shadow-sm">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 font-headings mb-4 flex items-center">
              <FiBriefcase className="mr-2 text-brand-rosegold" /> Boutique Information
            </h3>

            <form onSubmit={handleSaveBusiness} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Boutique Name</label>
                <input
                  type="text"
                  value={businessForm.name}
                  onChange={(e) => setBusinessForm({ ...businessForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-brand-darkBorder bg-slate-50 dark:bg-brand-dark/20 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-pink/20"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Tax ID Number</label>
                <input
                  type="text"
                  value={businessForm.taxId}
                  onChange={(e) => setBusinessForm({ ...businessForm, taxId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-brand-darkBorder bg-slate-50 dark:bg-brand-dark/20 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-pink/20"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">HQ Address</label>
                <input
                  type="text"
                  value={businessForm.address}
                  onChange={(e) => setBusinessForm({ ...businessForm, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-brand-darkBorder bg-slate-50 dark:bg-brand-dark/20 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-pink/20"
                />
              </div>
              <button
                type="submit"
                disabled={!isAdmin}
                className="px-4 py-2.5 rounded-xl bg-brand-rosegold text-white font-semibold hover:bg-brand-rosegold/95 shadow-md shadow-brand-rosegold/25 disabled:opacity-40"
              >
                Update Business Settings {!isAdmin && '(Admin Only)'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Tab 2: Preferences */}
      {activeTab === 'preferences' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
          {/* Notification Rules */}
          <div className="p-6 rounded-2xl bg-white dark:bg-brand-darkSecondary border border-brand-pink/10 dark:border-brand-darkBorder shadow-sm">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 font-headings mb-4 flex items-center">
              <FiBell className="mr-2 text-brand-rosegold" /> System Alerts
            </h3>
            <p className="text-xs text-slate-400 mb-6">Choose what events trigger system-wide notification feeds</p>

            <div className="space-y-5">
              {[
                { key: 'newOrders', title: 'New Customer Orders', desc: 'Trigger alerts when new purchase orders are placed' },
                { key: 'lowInventory', title: 'Low Stock Level Warnings', desc: 'Trigger alerts when product inventory hits reorder thresholds' },
                { key: 'outOfStock', title: 'Out of Stock Alerts', desc: 'Trigger critical alerts when items hit zero quantity' },
                { key: 'revenueMilestones', title: 'Revenue Milestone Alerts', desc: 'Trigger banners when cumulative revenue hits sales goals' }
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between">
                  <div className="pr-4">
                    <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200">{item.title}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                  
                  {/* Toggle Switch */}
                  <button
                    onClick={() => handleToggleNotification(item.key)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none
                      ${notifications[item.key] ? 'bg-brand-rosegold' : 'bg-slate-200 dark:bg-brand-dark'}`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                        ${notifications[item.key] ? 'translate-x-5' : 'translate-x-0'}`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Theme Preferences */}
          <div className="p-6 rounded-2xl bg-white dark:bg-brand-darkSecondary border border-brand-pink/10 dark:border-brand-darkBorder shadow-sm">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 font-headings mb-4 flex items-center">
              <FiSun className="mr-2 text-brand-rosegold" /> Visual Theme
            </h3>
            <p className="text-xs text-slate-400 mb-6">Toggle dashboard styling settings. Theme choice is cached in browser memory</p>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => { if (theme === 'dark') toggleTheme(); }}
                className={`p-5 rounded-2xl border flex flex-col items-center justify-center space-y-3 transition-all duration-200
                  ${theme === 'light' 
                    ? 'border-brand-rosegold bg-brand-pink/10 text-brand-rosegold' 
                    : 'border-brand-pink/15 hover:bg-slate-50 dark:hover:bg-brand-dark text-slate-500'}`}
              >
                <FiSun className="w-8 h-8" />
                <span className="text-xs font-bold">Light Mode</span>
              </button>

              <button
                onClick={() => { if (theme === 'light') toggleTheme(); }}
                className={`p-5 rounded-2xl border flex flex-col items-center justify-center space-y-3 transition-all duration-200
                  ${theme === 'dark' 
                    ? 'border-brand-pink text-brand-pink bg-brand-rosegold/10' 
                    : 'border-slate-200 dark:border-brand-darkBorder hover:bg-slate-50 dark:hover:bg-brand-dark text-slate-400'}`}
              >
                <FiMoon className="w-8 h-8" />
                <span className="text-xs font-bold">Dark Mode</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Role Management */}
      {activeTab === 'roles' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-brand-darkSecondary border border-brand-pink/10 dark:border-brand-darkBorder shadow-sm space-y-6 animate-fade-in">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 font-headings">Role-Based Access Controls (RBAC)</h3>
            <p className="text-xs text-slate-400 mt-0.5">Manage user access layers. We provide Admin and Staff roles</p>
          </div>

          {/* Role Changer Console for Testing */}
          <div className="p-5 rounded-2xl border border-brand-pink/30 bg-brand-pink/5 dark:bg-brand-rosegold/5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start">
              <FiInfo className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5 text-brand-rosegold dark:text-brand-pink" />
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Interactive Role Testing Console</h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                  Your current account role is <span className="font-bold uppercase text-brand-rosegold dark:text-brand-pink">{user?.role}</span>. You can change this role instantly below to test permissions across the dashboard.
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <span className="text-xs text-slate-400 font-medium">Switch role to:</span>
              <select
                value={user?.role}
                onChange={(e) => changeRoleDynamically(e.target.value)}
                className="px-3.5 py-2 text-xs font-bold rounded-xl border border-brand-pink/30 bg-white dark:bg-brand-dark text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                <option value="staff">Staff Associate</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
          </div>

          {/* Roles Description Board */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            {/* Staff Role Card */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-brand-dark/20 border border-slate-200 dark:border-brand-darkBorder">
              <h4 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
                Staff Associate Permissions
              </h4>
              <ul className="text-xs space-y-2.5 text-slate-600 dark:text-slate-400">
                <li className="flex items-center text-success"><FiCheck className="mr-2" /> View Products Catalog & Stock Status</li>
                <li className="flex items-center text-success"><FiCheck className="mr-2" /> Update product stock levels (Quick Adjust)</li>
                <li className="flex items-center text-success"><FiCheck className="mr-2" /> List & search customer database</li>
                <li className="flex items-center text-success"><FiCheck className="mr-2" /> Fulfill Orders & modify status (Pending, Shipped)</li>
                <li className="flex items-center text-danger"><FiAlertCircle className="mr-2" /> Cannot add new products to inventory</li>
                <li className="flex items-center text-danger"><FiAlertCircle className="mr-2" /> Cannot delete product listings</li>
                <li className="flex items-center text-danger"><FiAlertCircle className="mr-2" /> Cannot modify system configurations</li>
              </ul>
            </div>

            {/* Admin Role Card */}
            <div className="p-5 rounded-2xl bg-brand-pink/10 dark:bg-brand-rosegold/5 border border-brand-pink/20">
              <h4 className="text-xs font-black text-brand-rosegold dark:text-brand-pink uppercase tracking-wider mb-3">
                Administrator Permissions
              </h4>
              <ul className="text-xs space-y-2.5 text-brand-rosegold dark:text-brand-pink">
                <li className="flex items-center"><FiCheck className="mr-2" /> Complete access to all charts & analytics</li>
                <li className="flex items-center"><FiCheck className="mr-2" /> Create, edit, and delete jewelry products</li>
                <li className="flex items-center"><FiCheck className="mr-2" /> Manage and edit customer profiles</li>
                <li className="flex items-center"><FiCheck className="mr-2" /> Complete order overrides (including cancellations)</li>
                <li className="flex items-center"><FiCheck className="mr-2" /> Modify tax, billing, and business settings</li>
                <li className="flex items-center"><FiCheck className="mr-2" /> Access and export financial sales reports</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
