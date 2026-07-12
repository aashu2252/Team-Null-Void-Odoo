const { z } = require('zod');

const registerSchema = z.object({
  fullName: z.string({
    required_error: 'Full name is required'
  }).trim().min(1, 'Full name cannot be empty'),
  email: z.string({
    required_error: 'Email is required'
  }).trim().email('Invalid email address'),
  password: z.string({
    required_error: 'Password is required'
  }).min(8, 'Password must be at least 8 characters long'),
  role: z.enum(['Fleet Manager', 'Dispatcher', 'Safety Officer', 'Financial Analyst', 'Driver']).optional(),
  isActive: z.boolean().optional()
});

const loginSchema = z.object({
  email: z.string({
    required_error: 'Email is required'
  }).trim().email('Invalid email address'),
  password: z.string({
    required_error: 'Password is required'
  }).min(1, 'Password is required')
});

module.exports = {
  registerSchema,
  loginSchema
};
