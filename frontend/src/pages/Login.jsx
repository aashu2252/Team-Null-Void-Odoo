import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import { z } from 'zod';
import { validateWithZod } from '../utils/zodValidator';
import { Sparkles, Mail, Lock, Eye, EyeOff, ShieldCheck, Cpu, Network, UserCheck } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const LoginSchema = z.object({
  email: z.string({
    required_error: 'Email address is required'
  }).trim().min(1, 'Email address is required').email('Invalid email address'),
  password: z.string({
    required_error: 'Password is required'
  }).min(6, 'Password is too short'),
  role: z.enum(['Dispatcher', 'Fleet Manager', 'Safety Officer', 'Financial Analyst'], {
    required_error: 'Operator role is required'
  })
});

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLoginSubmit = async (values, { setSubmitting }) => {
    try {
      let token = 'demo-token';
      let user = { fullName: 'Alex Mercer', role: values.role };

      try {
        const response = await api.post('/api/auth/login', {
          email: values.email,
          password: values.password
        });
        token = response.data.data.token;
        user = response.data.data.user;

        // Validate returned role matches the selected role
        if (user.role !== values.role) {
          toast.error(`Unauthorized access. Authenticated user does not possess the requested '${values.role}' role.`, {
            style: { background: '#182230', color: '#F8FAFC', border: '1px solid #2B3645' }
          });
          return;
        }
      } catch (err) {
        if (err.response) {
          // Server responded with an error (4xx/5xx) — show the server's own message
          const serverMessage = err.response.data?.message || 'Invalid credentials. Please try again.';
          toast.error(serverMessage, {
            style: { background: '#182230', color: '#F8FAFC', border: '1px solid #2B3645' }
          });
          return;
        } else if (err.code === 'ECONNREFUSED' || err.code === 'ERR_NETWORK' || err.message?.includes('Network Error')) {
          console.warn('Backend server offline. Falling back to local offline mock bypass...');
          toast.success(`Demo Offline Mode: Auto-authenticating as ${values.role}`, {
            duration: 4000,
            style: { background: '#182230', color: '#4ADE80', border: '1px solid #2B3645' }
          });
        } else {
          // Timeout or unknown
          toast.error(err.message || 'An unexpected error occurred. Please try again.', {
            style: { background: '#182230', color: '#F8FAFC', border: '1px solid #2B3645' }
          });
          return;
        }
      }

      login(token, user);

      toast.success('Access Granted. Welcome back to TransitOps!', {
        style: { background: '#182230', color: '#F8FAFC', border: '1px solid #2B3645' }
      });

      navigate('/dashboard');
    } catch (error) {
      toast.error(error.message || 'An unexpected error occurred. Please try again.', {
        style: { background: '#182230', color: '#F8FAFC', border: '1px solid #2B3645' }
      });
    } finally {
      setSubmitting(false);
    }
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

        {/* Top Branding Header */}
        <div className="flex items-center gap-3 z-10">
          <div className="h-10 w-10 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-wide">TransitOps</h1>
            <span className="text-[10px] text-white/70 font-mono tracking-widest uppercase">ERP Intelligence</span>
          </div>
        </div>

        {/* Center Welcome Card */}
        <div className="max-w-md z-10 space-y-6">
          <span className="px-3 py-1 bg-white/15 backdrop-blur-md border border-white/20 text-white rounded-full text-[10px] font-bold tracking-widest uppercase">
            Platform Core v1.0.0
          </span>
          <div className="space-y-3">
            <h2 className="text-3xl font-extrabold text-white leading-tight">
              Empowering Smart Transport Logistics
            </h2>
            <p className="text-white/80 text-sm leading-relaxed">
              Consolidating fleet operations, driver certifications, trip telemetry, and financial auditing into a secure enterprise management hub.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 text-white">
            <div className="p-3 bg-white/5 border border-white/10 rounded-2xl flex flex-col justify-between h-20">
              <ShieldCheck className="w-5 h-5 text-brand-teal" />
              <div>
                <span className="text-[9px] uppercase font-bold text-white/60 block">Compliance</span>
                <span className="text-[10px] font-bold">CDL Lock</span>
              </div>
            </div>
            <div className="p-3 bg-white/5 border border-white/10 rounded-2xl flex flex-col justify-between h-20">
              <Cpu className="w-5 h-5 text-brand-teal" />
              <div>
                <span className="text-[9px] uppercase font-bold text-white/60 block">Telematics</span>
                <span className="text-[10px] font-bold">IoT Feeds</span>
              </div>
            </div>
            <div className="p-3 bg-white/5 border border-white/10 rounded-2xl flex flex-col justify-between h-20">
              <Network className="w-5 h-5 text-brand-teal" />
              <div>
                <span className="text-[9px] uppercase font-bold text-white/60 block">ERP Hub</span>
                <span className="text-[10px] font-bold">Flat Layout</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-white/50 text-[10px] z-10 flex justify-between items-center font-mono">
          <span>© 2026 TransitOps Inc.</span>
          <span>Security Protocol Active</span>
        </div>
      </div>

      {/* RIGHT PANEL: Form Card Layout */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-8 sm:p-12 md:p-16 relative">
        <div className="absolute top-6 right-6 flex gap-2">
          {/* Decorative badge */}
          <span className="px-3 py-1 bg-surface border border-border-custom rounded-full text-[10px] font-bold text-txt-secondary flex items-center gap-1.5 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse" />
            <span>Secure Tunnel</span>
          </span>
        </div>

        <div className="w-full max-w-sm mx-auto my-auto space-y-6">
          <div className="space-y-1.5">
            <h2 className="text-xl font-bold text-txt-primary">Account Authentication</h2>
            <p className="text-xs text-txt-secondary">Enter credentials registered on your Active Directory workspace.</p>
          </div>

          <Formik
            initialValues={{ email: '', password: '', role: 'Dispatcher' }}
            validate={validateWithZod(LoginSchema)}
            onSubmit={handleLoginSubmit}
          >
            {({ errors, touched, isSubmitting, values }) => (
              <Form className="space-y-4">
                {/* Role Selection Dropdown */}
                <div>
                  <label htmlFor="role" className="block text-[10px] font-bold uppercase tracking-wider text-txt-secondary">
                    Operator Role Profile
                  </label>
                  <div className="mt-1.5 relative">
                    <Field
                      as="select"
                      id="role"
                      name="role"
                      className="block w-full rounded-xl bg-card-bg border border-border-custom text-txt-primary px-10 py-2.5 text-xs focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary cursor-pointer"
                    >
                      <option value="Dispatcher">Dispatcher</option>
                      <option value="Fleet Manager">Fleet Manager</option>
                      <option value="Safety Officer">Safety Officer</option>
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
                      className={`block w-full rounded-xl bg-card-bg border ${errors.email && touched.email ? 'border-brand-danger' : 'border-border-custom focus:border-brand-primary'
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
                      onClick={() => {
                        toast('Recovery request sent. Contact corporate Active Directory desk.', {
                          icon: '🔑',
                          style: { background: '#182230', color: '#F8FAFC', border: '1px solid #2B3645' }
                        });
                      }}
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
                      className={`block w-full rounded-xl bg-card-bg border ${errors.password && touched.password ? 'border-brand-danger' : 'border-border-custom focus:border-brand-primary'
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
          Need help? <a href="#" onClick={(e) => { e.preventDefault(); toast.success('Help ticket created. IT Desk will contact you.'); }} className="underline hover:text-brand-primary">Contact corporate IT support desk</a>
        </div>

      </div>

    </div>
  );
}
