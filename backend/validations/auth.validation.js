const { z } = require('zod');

const registerSchema = z.object({
  firstName: z.string({
    required_error: 'First name is required'
  }).trim().min(1, 'First name cannot be empty'),
  lastName: z.string({
    required_error: 'Last name is required'
  }).trim().min(1, 'Last name cannot be empty'),
  email: z.string({
    required_error: 'Email is required'
  }).trim().email('Invalid email address'),
  password: z.string({
    required_error: 'Password is required'
  }).min(8, 'Password must be at least 8 characters long'),
  role: z.string().optional(),
  mobile: z.string().optional(),
  address: z.string().optional(),
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
