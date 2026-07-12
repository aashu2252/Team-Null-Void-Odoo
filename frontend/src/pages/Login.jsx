import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import { validateWithZod } from '../utils/zodValidator';
import { useAuth } from '../context/AuthContext';

// Define Login Schema
const loginSchema = z.object({
  email: z.string({
    required_error: 'Email is required'
  }).trim().min(1, 'Email is required').email('Invalid email address'),
  password: z.string({
    required_error: 'Password is required'
  }).min(1, 'Password is required')
});

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLoginSubmit = async (values, { setSubmitting }) => {
    try {
      const response = await api.post('/api/auth/login', values);
      const { token, user } = response.data.data;

      // Persist credentials in context
      login(token, user);

      toast.success('Login Successful! Welcome to TransitOps.', {
        style: {
          background: '#1e293b',
          color: '#f8fafc',
          border: '1px solid #334155'
        }
      });

      // Redirect to dashboard (mock page for next step)
      navigate('/dashboard');
    } catch (error) {
      const serverMessage = error.response?.data?.message || 'Server error. Please try again later.';
      toast.error(serverMessage, {
        style: {
          background: '#1e293b',
          color: '#f8fafc',
          border: '1px solid #334155'
        }
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Dynamic Background Blurs */}
      <div className="absolute top-1/4 left-1/4 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10 text-center">
        {/* Logo Placeholder */}
        <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-xl shadow-cyan-500/10 mb-4">
          <span className="text-2xl font-extrabold text-white">TO</span>
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          TransitOps
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Enter credentials to access the ERP Console
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="bg-slate-905/40 backdrop-blur-xl py-8 px-4 border border-slate-800/80 shadow-2xl sm:rounded-3xl sm:px-10">
          <Formik
            initialValues={{ email: '', password: '' }}
            validate={validateWithZod(loginSchema)}
            onSubmit={handleLoginSubmit}
          >
            {({ errors, touched, isSubmitting }) => (
              <Form className="space-y-6">
                {/* Email Input */}
                <div>
                  <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Email Address
                  </label>
                  <div className="mt-1.5">
                    <Field
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      className={`block w-full rounded-xl bg-slate-900 border ${
                        errors.email && touched.email ? 'border-red-500 focus:ring-red-500' : 'border-slate-800 focus:border-cyan-500 focus:ring-cyan-500'
                      } text-white px-4 py-3 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all duration-200`}
                      placeholder="you@example.com"
                    />
                    {errors.email && touched.email && (
                      <p className="mt-1.5 text-xs text-red-400 font-medium">{errors.email}</p>
                    )}
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Password
                  </label>
                  <div className="mt-1.5 relative">
                    <Field
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      className={`block w-full rounded-xl bg-slate-900 border ${
                        errors.password && touched.password ? 'border-red-500 focus:ring-red-500' : 'border-slate-800 focus:border-cyan-500 focus:ring-cyan-500'
                      } text-white pl-4 pr-12 py-3 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all duration-200`}
                      placeholder="••••••••"
                    />
                    {/* Password Visibility Toggle */}
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-200 transition-colors duration-150"
                    >
                      {showPassword ? (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {errors.password && touched.password && (
                    <p className="mt-1.5 text-xs text-red-400 font-medium">{errors.password}</p>
                  )}
                </div>

                {/* Submit Button */}
                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 active:scale-[0.98]"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-slate-950" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Authenticating...
                      </div>
                    ) : (
                      'Sign In'
                    )}
                  </button>
                </div>
              </Form>
            )}
          </Formik>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-400">
              New to the platform?{' '}
              <Link to="/register" className="font-semibold text-cyan-400 hover:text-cyan-300 transition-colors duration-150">
                Register an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
