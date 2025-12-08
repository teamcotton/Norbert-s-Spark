import { z } from 'zod'

// Value object schemas
export const EmailSchema = z.string().email('Invalid email')
export const PasswordSchema = z.string().min(12, 'Password must be at least 12 characters')
export const NameSchema = z.string().min(1, 'Name is required')

// Registration form schema
export const RegistrationFormSchema = z.object({
  email: EmailSchema,
  name: NameSchema,
  password: PasswordSchema,
  confirmPassword: PasswordSchema,
})

// Sign-in form schema
export const SignInFormSchema = z.object({
  email: EmailSchema,
  password: z.string().min(1, 'Password is required'),
})

// Types
export type RegistrationFormData = z.infer<typeof RegistrationFormSchema>
export type SignInFormData = z.infer<typeof SignInFormSchema>
