'use server'

import { obscured } from 'obscured'

interface RegisterUserData extends Record<string, string> {
  email: string
  name: string
  password: string
}

interface RegisterUserResponse {
  success: boolean
  data?: {
    userId: string
    email: string
    name: string
  }
  error?: string
}

export async function registerUser(data: RegisterUserData): Promise<RegisterUserResponse> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

    // Obscure the password before sending to API
    const obscuredData = obscured.obscureKeys(data, ['password'])

    const response = await fetch(`${apiUrl}/users/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(obscuredData),
    })

    const result = (await response.json()) as RegisterUserResponse

    if (!response.ok) {
      return {
        success: false,
        error: (result as { error?: string }).error || 'Registration failed',
      }
    }

    return result
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    }
  }
}
