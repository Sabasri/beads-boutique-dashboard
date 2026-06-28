import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiLoader, FiAlertCircle } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loadingForm, setLoadingForm] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setLoadingForm(true);
    try {
      await login(email, password, rememberMe);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoadingForm(false);
    }
  };

  // Quick fill helper for review/testing
  const fillCredentials = (type) => {
    if (type === 'admin') {
      setEmail('admin@boutique.com');
      setPassword('password123');
    } else {
      setEmail('staff@boutique.com');
      setPassword('password123');
    }
  };

  return (
    <div className="flex min-h-screen bg-brand-cream dark:bg-brand-dark transition-colors duration-200">
      
      {/* Left Column: Premium Brand Visuals (Desktop Only) */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden">
        {/* Full background jewelry image */}
        <img
          src="/login_hero.png"
          alt="Beads and Bracelets Boutique Jewelry Collection"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        {/* Dark gradient overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/65 via-brand-rosegold/30 to-black/50" />

        <div className="relative z-10 text-center px-12 max-w-lg">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-md border-2 border-white/30 text-white shadow-xl mb-8 animate-pulse-gold">
            <span className="text-4xl font-bold font-headings drop-shadow">B</span>
          </div>
          <h2 className="text-3xl font-bold text-white font-headings leading-tight mb-4 drop-shadow-lg">
            Beads &amp; Bracelets Boutique
          </h2>
          <p className="text-white/80 font-medium text-base italic leading-relaxed drop-shadow">
            &ldquo;Crafting unique stories in every bead, celebrating your personal style.&rdquo;
          </p>
          
          {/* Quick Demo Credentials Panel */}
          <div className="mt-12 p-6 rounded-2xl bg-white/15 dark:bg-brand-dark/45 border border-white/25 backdrop-blur-md">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white/90 mb-4">
              Demo Credentials for Testing
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => fillCredentials('admin')}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-brand-rosegold text-white hover:bg-brand-rosegold/90 transition-all duration-150 shadow-sm"
              >
                Fill Admin Login
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('staff')}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-white/20 border border-white/30 text-white hover:bg-white/30 transition-all duration-150 shadow-sm"
              >
                Fill Staff Login
              </button>
            </div>
            <p className="text-[10px] text-white/60 mt-3">
              Password is <span className="font-bold text-white/80">password123</span> for both accounts
            </p>
          </div>
        </div>
      </div>

      {/* Right Column: Form Container */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 lg:px-16 bg-white dark:bg-brand-dark">
        <div className="w-full max-w-md space-y-8">
          
          {/* Form Header */}
          <div className="text-center">
            {/* Logo shown on mobile */}
            <div className="lg:hidden inline-flex items-center justify-center w-14 h-14 rounded-full bg-brand-pink dark:bg-brand-rosegold text-brand-rosegold dark:text-brand-pink shadow-md mb-6">
              <span className="text-2xl font-bold font-headings">B</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 font-headings">Welcome Back</h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Sign in to manage your boutique dashboard
            </p>
          </div>

          {/* Form Error Alert */}
          {error && (
            <div className="flex items-start p-4 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm animate-fade-in">
              <FiAlertCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              
              {/* Email Field */}
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

              {/* Password Field */}
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
                    placeholder="••••••••"
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
            </div>

            {/* Options Panel */}
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4.5 h-4.5 rounded border-slate-300 text-brand-rosegold focus:ring-brand-rosegold"
                />
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Remember Me</span>
              </label>

              <button
                type="button"
                onClick={() => setError('Password reset is simulated. Use the demo credentials to log in.')}
                className="text-xs font-semibold text-brand-rosegold dark:text-brand-pink hover:underline focus:outline-none"
              >
                Forgot Password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loadingForm}
              className="flex items-center justify-center w-full py-3.5 px-4 rounded-xl bg-brand-rosegold text-white font-semibold text-sm hover:bg-brand-rosegold/95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-rosegold shadow-md shadow-brand-rosegold/25 disabled:opacity-50 transition-all duration-200"
            >
              {loadingForm ? (
                <>
                  <FiLoader className="w-4.5 h-4.5 mr-2 animate-spin" />
                  Verifying portal credentials...
                </>
              ) : (
                'Sign In to Dashboard'
              )}
            </button>
          </form>

          {/* Quick Credentials Panel for Mobile */}
          <div className="lg:hidden p-5 rounded-2xl bg-slate-50 dark:bg-brand-darkSecondary border border-slate-200 dark:border-brand-darkBorder mt-6">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-brand-rosegold dark:text-brand-pink text-center mb-3">
              Demo Credentials for Testing
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillCredentials('admin')}
                className="px-3 py-1.5 text-[10px] font-bold rounded-lg bg-brand-rosegold text-white"
              >
                Fill Admin
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('staff')}
                className="px-3 py-1.5 text-[10px] font-bold rounded-lg bg-brand-lavender text-slate-700"
              >
                Fill Staff
              </button>
            </div>
          </div>

          {/* Footer Link */}
          <p className="text-center text-xs text-slate-500 dark:text-slate-400 font-medium">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-brand-rosegold dark:text-brand-pink hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
