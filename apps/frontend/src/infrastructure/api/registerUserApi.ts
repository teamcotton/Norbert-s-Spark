'use server'
import { obscured } from 'obscured'

export interface RegisterUserData extends Record<string, string> {
  email: string
  name: string
  password: string
}

export interface RegisterUserResponse {
  success: boolean
  data?: {
    userId: string
    email: string
    name: string
  }
  error?: string
}

/**
 * Register a new user via the API
 * This is a client-side function that can be used with React Query
 */
export async function registerUserApi(data: RegisterUserData): Promise<RegisterUserResponse> {
  const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_AI_CALLBACK_URL

  // Obscure sensitive data in memory to prevent exposure in logs/debugging
  const obscuredData = obscured.obscureKeys(data, ['password'])

  const response = await fetch(`${apiUrl}/users/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    // Extract the actual password value for API transmission
    body: JSON.stringify({
      ...data,
      password: obscured.value(obscuredData.password),
    }),
  })

  const result = (await response.json()) as RegisterUserResponse

  if (!response.ok) {
    throw new Error((result as { error?: string }).error || 'Registration failed')
  }

  return result
}
