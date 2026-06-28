import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiLoader, FiAlertCircle, FiShield } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('staff');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loadingForm, setLoadingForm] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoadingForm(true);
    try {
      await register(name, email, password, role);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Server error during registration. Please try again.');
    } finally {
      setLoadingForm(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-brand-cream dark:bg-brand-dark transition-colors duration-200">
      
      {/* Left Column: Brand Cover (Desktop Only) */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden">
        {/* Full bleed jewelry image */}
        <img
          src="/earrings_collection.png"
          alt="Fashion Earrings Collection"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/65 via-brand-lavender/30 to-black/50" />

        <div className="relative z-10 text-center px-12 max-w-lg">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-md border-2 border-white/30 text-white shadow-xl mb-8 animate-pulse-gold">
            <span className="text-4xl font-bold font-headings drop-shadow">B</span>
          </div>
          <h2 className="text-3xl font-bold text-white font-headings leading-tight mb-4 drop-shadow-lg">
            Join the Boutique
          </h2>
          <p className="text-white/80 font-medium text-base leading-relaxed drop-shadow">
            Create an account to start managing products, fulfilling customer orders, and monitoring real-time business performance.
          </p>
          
          <div className="mt-8 flex justify-center space-x-5 text-xs font-bold text-white/90 tracking-widest uppercase">
            <span>Handmade</span>
            <span className="text-white/40">•</span>
            <span>Customized</span>
            <span className="text-white/40">•</span>
            <span>Bespoke Jewelry</span>
          </div>

          {/* Feature highlights */}
          <div className="mt-10 grid grid-cols-3 gap-3">
            {['100+ Products', '200+ Orders', '50 Customers'].map(feat => (
              <div key={feat} className="p-3 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20">
                <p className="text-xs font-bold text-white leading-tight">{feat}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column: Registration Form */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 lg:px-16 bg-white dark:bg-brand-dark">
        <div className="w-full max-w-md space-y-8">
          
          {/* Header */}
          <div className="text-center">
            <div className="lg:hidden inline-flex items-center justify-center w-14 h-14 rounded-full bg-brand-pink dark:bg-brand-rosegold text-brand-rosegold dark:text-brand-pink shadow-md mb-6">
              <span className="text-2xl font-bold font-headings">B</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 font-headings">Create Account</h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Register as a staff or administrator to enter the portal
            </p>
          </div>

          {/* Form Error Alert */}
          {error && (
            <div className="flex items-start p-4 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm animate-fade-in">
              <FiAlertCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-4">
              
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="E.g. Emily Watson"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-brand-darkBorder bg-slate-50/50 dark:bg-brand-darkSecondary/50 focus:bg-white dark:focus:bg-brand-dark text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-pink/30 dark:focus:ring-brand-rosegold/20 focus:border-brand-rosegold transition-all duration-200"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@boutique.com"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-brand-darkBorder bg-slate-50/50 dark:bg-brand-darkSecondary/50 focus:bg-white dark:focus:bg-brand-dark text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-pink/30 dark:focus:ring-brand-rosegold/20 focus:border-brand-rosegold transition-all duration-200"
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  System Role
                </label>
                <div className="relative">
                  <FiShield className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-brand-darkBorder bg-slate-50/50 dark:bg-brand-darkSecondary/50 focus:bg-white dark:focus:bg-brand-dark text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-pink/30 dark:focus:ring-brand-rosegold/20 focus:border-brand-rosegold transition-all duration-200 appearance-none"
                  >
                    <option value="staff">Staff Associate (Manage Orders, Inventory, Products)</option>
                    <option value="admin">Administrator (Full Access & Settings Control)</option>
                  </select>
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Password
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full pl-11 pr-10 py-3 rounded-xl border border-slate-200 dark:border-brand-darkBorder bg-slate-50/50 dark:bg-brand-darkSecondary/50 focus:bg-white dark:focus:bg-brand-dark text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-pink/30 dark:focus:ring-brand-rosegold/20 focus:border-brand-rosegold transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none"
                  >
                    {showPassword ? <FiEyeOff className="w-4.5 h-4.5" /> : <FiEye className="w-4.5 h-4.5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-brand-darkBorder bg-slate-50/50 dark:bg-brand-darkSecondary/50 focus:bg-white dark:focus:bg-brand-dark text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-pink/30 dark:focus:ring-brand-rosegold/20 focus:border-brand-rosegold transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loadingForm}
              className="flex items-center justify-center w-full py-3.5 px-4 rounded-xl bg-brand-rosegold text-white font-semibold text-sm hover:bg-brand-rosegold/95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-rosegold shadow-md shadow-brand-rosegold/25 disabled:opacity-50 transition-all duration-200 mt-6"
            >
              {loadingForm ? (
                <>
                  <FiLoader className="w-4.5 h-4.5 mr-2 animate-spin" />
                  Creating boutique account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Footer Link */}
          <p className="text-center text-xs text-slate-500 dark:text-slate-400 font-medium">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-brand-rosegold dark:text-brand-pink hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
