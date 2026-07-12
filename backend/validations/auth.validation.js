const { z } = require('zod');

const registerSchema = z.object({
  firstName: z.string().trim().min(1, 'First name cannot be empty').optional(),
  lastName: z.string().trim().min(1, 'Last name cannot be empty').optional(),
  fullName: z.string().trim().min(1, 'Full name cannot be empty').optional(),
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
}).refine((data) => data.firstName || data.lastName || data.fullName, {
  message: 'Name is required',
  path: ['fullName']
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
