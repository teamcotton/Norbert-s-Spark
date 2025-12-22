import { z } from 'zod'

export const LoginSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Email is required' })
    .email({ message: 'Please enter a valid email address' }),
  password: z.string().min(1, { message: 'Password is required' }),
})

export const RegisterSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().min(8),
  confirmPassword: z.string().min(8),
})

export const AuthResponseSchema = z.object({
  success: z.boolean(),
  data: z
    .object({
      token: z.string().optional(),
      user: z.any().optional(),
    })
    .optional(),
  error: z.string().optional(),
  status: z.number().optional(),
})
