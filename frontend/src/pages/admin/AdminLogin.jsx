import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import { validateWithZod } from '../../utils/zodValidator';
import { useAuth } from '../../context/AuthContext';

const adminLoginSchema = z.object({
  email: z.string({
    required_error: 'Email is required'
  }).trim().min(1, 'Email is required').email('Invalid email address'),
  password: z.string({
    required_error: 'Password is required'
  }).min(1, 'Password is required')
});

export default function AdminLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLoginSubmit = async (values, { setSubmitting }) => {
    try {
      const response = await api.post('/api/auth/login', values);
      const { token, user } = response.data.data;
      
      // Check if user has Super Admin role
      if (user.role?.name !== 'Super Admin') {
        toast.error('Access Denied: Super Admin privileges required.', {
          style: { background: '#fef2f2', color: '#b91c1c', border: '1px solid #fca5a5' }
        });
        setSubmitting(false);
        return;
      }
      
      login(token, user);
      toast.success('Admin Login Successful', {
        style: { background: '#fef2f2', color: '#b91c1c', border: '1px solid #fca5a5' }
      });
      navigate('/admin');
    } catch (error) {
      const serverMessage = error.response?.data?.message || 'Server error. Please try again later.';
      toast.error(serverMessage, {
        style: { background: '#fef2f2', color: '#b91c1c', border: '1px solid #fca5a5' }
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-secondary flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h2 className="text-3xl font-extrabold tracking-tight text-brand-900">
          TransitOps Admin
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Sign in to access the control panel
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border-t-4 border-brand-600">
          <Formik
            initialValues={{ email: '', password: '' }}
            validate={validateWithZod(adminLoginSchema)}
            onSubmit={handleLoginSubmit}
          >
            {({ errors, touched, isSubmitting }) => (
              <Form className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email address
                  </label>
                  <div className="mt-1">
                    <Field
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      className={`appearance-none block w-full px-3 py-2 border ${
                        errors.email && touched.email ? 'border-red-500' : 'border-gray-300'
                      } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm`}
                      placeholder="admin@transitops.com"
                    />
                    {errors.email && touched.email && (
                      <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="mt-1 relative">
                    <Field
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      className={`appearance-none block w-full px-3 py-2 border ${
                        errors.password && touched.password ? 'border-red-500' : 'border-gray-300'
                      } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  {errors.password && touched.password && (
                    <p className="mt-2 text-sm text-red-600">{errors.password}</p>
                  )}
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Signing in...' : 'Sign in to Admin Panel'}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
}
