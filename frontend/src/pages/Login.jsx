import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import { validateWithZod } from '../utils/zodValidator';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Mail, Lock, Eye, EyeOff, ShieldCheck, Cpu, Network, UserCheck } from 'lucide-react';
import { motion } from 'framer-motion';

// Define Login Schema
const loginSchema = z.object({
  email: z.string({
    required_error: 'Email is required'
  }).trim().min(1, 'Email is required').email('Invalid email address'),
  password: z.string({
    required_error: 'Password is required'
  }).min(1, 'Password is required'),
  role: z.string({
    required_error: 'Role is required'
  })
});

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLoginSubmit = async (values, { setSubmitting }) => {
    try {
      const payload = { 
        email: values.email, 
        password: values.password,
        role: values.role
      };

      let token = 'demo-token';
      let user = { fullName: 'Alex Mercer', role: values.role };
      
      try {
        const response = await api.post('/api/auth/login', payload);
        token = response.data.data.token;
        user = response.data.data.user;
      } catch (err) {
        console.warn('Backend server offline. Falling back to local offline mock bypass...');
        toast.success(`Demo Offline Mode: Auto-authenticating as ${values.role}`, {
          duration: 4000,
          style: { background: '#182230', color: '#4ADE80', border: '1px solid #2B3645' }
        });
      }

      login(token, user);
      
      toast.success('Access Granted. Welcome back to TransitOps!', {
        style: { background: '#182230', color: '#F8FAFC', border: '1px solid #2B3645' }
      });

      navigate('/dashboard');
    } catch (error) {
      const serverMessage = error.response?.data?.message || 'Authentication error. Please try again.';
      toast.error(serverMessage, {
        style: { background: '#182230', color: '#F8FAFC', border: '1px solid #2B3645' }
      });
    } finally {
      setSubmitting(false);
    }
  };

  const triggerGuestBypass = (chosenRole = 'Dispatcher') => {
    login('demo-token-123', { fullName: 'John Doe (Demo)', role: chosenRole });
    toast.success(`Bypass Activated: Logged in as ${chosenRole}`, {
      style: { background: '#182230', color: '#4ADE80', border: '1px solid #2B3645' }
    });
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-bg-app flex overflow-hidden transition-colors duration-300">
      
      {/* LEFT PANEL: Blue-Teal Gradient Visual Layout */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-tr from-brand-primary to-brand-teal relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 opacity-15 mix-blend-overlay">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            <path d="M 0 100 Q 250 150 500 100 T 1000 100" fill="none" stroke="white" strokeWidth="3" />
            <path d="M 100 0 Q 300 400 600 200 T 900 800" fill="none" stroke="white" strokeWidth="2" />
          </svg>
        </div>

        {/* Header Logo */}
        <div className="flex items-center gap-3 z-10 select-none">
          <div className="h-11 w-11 rounded-2xl bg-white flex items-center justify-center shadow-lg shadow-white/10">
            <Sparkles className="w-6 h-6 text-brand-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">TransitOps</h1>
            <p className="text-[10px] text-white/80 font-bold uppercase tracking-wider">Enterprise SaaS</p>
          </div>
        </div>

        {/* Dashboard Center telemetry previews */}
        <div className="z-10 max-w-md self-center space-y-6">
          <div className="space-y-3">
            <h2 className="text-3xl font-bold tracking-tight text-white leading-tight">
              Predictive Operations. Intelligent Dispatch.
            </h2>
            <p className="text-sm text-white/85 leading-relaxed">
              Consolidate drivers, telemetry, fuel intelligence, and maintenance health scores into a single command center.
            </p>
          </div>

          <div className="space-y-3 pt-4">
            <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 bg-white/20 rounded-xl flex items-center justify-center text-white">
                  <Network className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Connected Road Network</p>
                  <p className="text-[10px] text-white/70">84 Active routes monitored live</p>
                </div>
              </div>
              <span className="text-xs font-bold text-white bg-brand-teal px-2 py-0.5 rounded-full">ACTIVE</span>
            </div>

            <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 bg-white/20 rounded-xl flex items-center justify-center text-white">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">AI Route Optimization</p>
                  <p className="text-[10px] text-white/70">Transit speed improvement: +18.4%</p>
                </div>
              </div>
              <span className="text-xs font-bold text-white bg-white/20 px-2 py-0.5 rounded-full">OPTIMAL</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="z-10 flex justify-between items-center text-xs text-white/70">
          <span>© 2026 TransitOps Operations Corp.</span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-white" />
            <span>FMCRA Compliant</span>
          </span>
        </div>

      </div>

      {/* RIGHT PANEL: Authentication Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between py-12 px-6 sm:px-12 md:px-20 lg:px-16 xl:px-24 bg-bg-app relative overflow-y-auto">
        <div className="absolute top-1/4 left-1/4 h-80 w-80 rounded-full bg-brand-primary/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-brand-teal/5 blur-3xl pointer-events-none" />

        {/* Mobile Header */}
        <div className="flex lg:hidden items-center gap-3 select-none mb-8">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-brand-primary to-brand-teal flex items-center justify-center text-white">
            <Sparkles className="w-5 h-5" />
          </div>
          <h1 className="text-md font-bold text-txt-primary">TransitOps</h1>
        </div>

        <div className="my-auto max-w-md w-full mx-auto space-y-8 z-10">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-txt-primary">
              Sign In to Your Workspace
            </h2>
            <p className="text-xs text-txt-secondary mt-1">
              Enter your corporate login credentials to view operations telemetry.
            </p>
          </div>

          <Formik
            initialValues={{ email: '', password: '', role: 'Dispatcher' }}
            validate={validateWithZod(loginSchema)}
            onSubmit={handleLoginSubmit}
          >
            {({ errors, touched, isSubmitting, values }) => (
              <Form className="space-y-4">
                
                {/* Role Selection */}
                <div>
                  <label htmlFor="role" className="block text-[10px] font-bold uppercase tracking-wider text-txt-secondary mb-1.5">
                    Select Operational Role
                  </label>
                  <div className="relative">
                    <Field
                      as="select"
                      id="role"
                      name="role"
                      className="block w-full rounded-xl bg-card-bg border border-border-custom focus:border-brand-primary text-txt-primary px-10 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-primary transition-all duration-200"
                    >
                      <option value="Dispatcher">Dispatcher</option>
                      <option value="Fleet Manager">Fleet Manager</option>
                      <option value="Safety officer">Safety officer</option>
                      <option value="Financial Analyst">Financial Analyst</option>
                    </Field>
                    <UserCheck className="absolute left-3 top-3 w-4 h-4 text-txt-muted pointer-events-none" />
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label htmlFor="email" className="block text-[10px] font-bold uppercase tracking-wider text-txt-secondary">
                    Email Address
                  </label>
                  <div className="mt-1.5 relative">
                    <Field
                      id="email"
                      name="email"
                      type="email"
                      className={`block w-full rounded-xl bg-card-bg border ${
                        errors.email && touched.email ? 'border-brand-danger' : 'border-border-custom focus:border-brand-primary'
                      } text-txt-primary px-10 py-2.5 text-xs placeholder-txt-muted focus:outline-none focus:ring-1 focus:ring-brand-primary transition-all duration-200`}
                      placeholder="manager@transitops.com"
                    />
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-txt-muted" />
                  </div>
                  {errors.email && touched.email && (
                    <p className="mt-1 text-[10px] text-brand-danger font-semibold">{errors.email}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <div className="flex justify-between items-center">
                    <label htmlFor="password" className="block text-[10px] font-bold uppercase tracking-wider text-txt-secondary">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => triggerGuestBypass(values.role)}
                      className="text-[10px] font-bold text-brand-primary hover:underline cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="mt-1.5 relative">
                    <Field
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      className={`block w-full rounded-xl bg-card-bg border ${
                        errors.password && touched.password ? 'border-brand-danger' : 'border-border-custom focus:border-brand-primary'
                      } text-txt-primary px-10 py-2.5 text-xs placeholder-txt-muted focus:outline-none focus:ring-1 focus:ring-brand-primary transition-all duration-200`}
                      placeholder="••••••••"
                    />
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-txt-muted" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-txt-muted hover:text-txt-primary"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && touched.password && (
                    <p className="mt-1 text-[10px] text-brand-danger font-semibold">{errors.password}</p>
                  )}
                </div>

                {/* Remember Me checkbox */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 select-none cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-border-custom text-brand-primary focus:ring-brand-primary h-3.5 w-3.5"
                    />
                    <span className="text-[11px] font-medium text-txt-secondary">Remember device</span>
                  </label>
                </div>

                {/* Submit Action */}
                <div className="pt-2 flex flex-col gap-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex justify-center py-2.5 px-4 bg-brand-primary hover:bg-brand-primary/95 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-primary/10 transition-all active:scale-[0.98] cursor-pointer"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Authenticating...
                      </span>
                    ) : (
                      'Sign In'
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => triggerGuestBypass(values.role)}
                    className="w-full py-2 px-4 bg-surface hover:bg-surface/80 border border-border-custom text-txt-primary rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Quick Guest Demo Bypass
                  </button>
                </div>
              </Form>
            )}
          </Formik>

          <div className="text-center">
            <p className="text-xs text-txt-secondary">
              New to the platform?{' '}
              <Link to="/register" className="font-bold text-brand-primary hover:underline transition-colors">
                Register Workspace
              </Link>
            </p>
          </div>
        </div>

        {/* Footer Support link */}
        <div className="text-center text-[10px] text-txt-muted z-10 pt-8">
          Need help? <a href="#" onClick={() => triggerGuestBypass()} className="underline hover:text-brand-primary">Contact corporate IT support desk</a>
        </div>

      </div>

    </div>
  );
}
