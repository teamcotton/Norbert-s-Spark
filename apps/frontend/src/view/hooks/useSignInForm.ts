import { useState } from 'react'

import { EmailSchema } from '@/domain/auth/index.js'

interface FormData {
  email: string
  password: string
}

interface FormErrors {
  email: string
  password: string
}

export function useSignInForm() {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
  })

  const [errors, setErrors] = useState<FormErrors>({
    email: '',
    password: '',
  })

  const handleChange = (field: keyof FormData) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [field]: event.target.value })
    // Clear error when user starts typing
    setErrors({ ...errors, [field]: '' })
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {
      email: '',
      password: '',
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else {
      const result = EmailSchema.safeParse(formData.email)
      if (!result.success) {
        newErrors.email = 'Please enter a valid email address'
      }
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required'
    }

    setErrors(newErrors)
    return Object.values(newErrors).every((error) => error === '')
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (validateForm()) {
      // Handle sign in
      // TODO: Implement sign in API call
    }
  }

  const handleGoogleSignIn = () => {
    // Handle Google OAuth
    // TODO: Implement Google OAuth
  }

  const handleGitHubSignIn = () => {
    // Handle GitHub OAuth
    // TODO: Implement GitHub OAuth
  }

  return {
    formData,
    errors,
    handleChange,
    handleSubmit,
    handleGoogleSignIn,
    handleGitHubSignIn,
  }
}
