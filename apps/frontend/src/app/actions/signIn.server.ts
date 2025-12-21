// Server Action for signing in a user
// Forwards to backend `/auth/login` and returns a typed response suitable
// for Server Components / form actions.

import { createLogger } from '@/application/services/logger.service.js'
import type { SignInFormData } from '@/domain/auth/index.js'

const logger = createLogger({ prefix: '[signIn:server]' })

interface LoginUserResponse {
  success: boolean
  data?: {
    userId: string
    email?: string
    access_token: string
    roles?: string[]
  }
  error?: string
  status: number
}

export async function signInServer(data: SignInFormData): Promise<LoginUserResponse> {
  try {
    const apiUrl =
      process.env.NODE_ENV === 'production'
        ? process.env.BACKEND_AI_CALLBACK_URL_PROD
        : process.env.BACKEND_AI_CALLBACK_URL_DEV

    if (!apiUrl) {
      logger.error('[signIn:server] Backend API URL not configured')
      return { status: 500, success: false, error: 'Backend API URL not configured' }
    }

    const isLocalDevelopment =
      apiUrl.includes('localhost') || apiUrl.includes('127.0.0.1') || apiUrl.includes('::1')

    let response: Response

    if (isLocalDevelopment && apiUrl.startsWith('https')) {
      const https = await import('https')
      const nodeFetch = (await import('node-fetch')).default

      const agent = new https.Agent({ rejectUnauthorized: false })

      response = (await nodeFetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email, password: data.password }),
        agent,
      })) as unknown as Response
    } else {
      response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email, password: data.password }),
      })
    }

    const result = (await response.json()) as LoginUserResponse

    logger.info('[signIn:server] Login response', { status: response.status, ok: response.ok })

    if (!response.ok) {
      return {
        status: response.status,
        success: false,
        error: result.error || 'Authentication failed',
      }
    }

    return { ...result, status: response.status }
  } catch (error) {
    logger.error('[signIn:server] Error signing in', error)
    return {
      status: 500,
      success: false,
      error: error instanceof Error ? error.message : 'Unexpected error',
    }
  }
}
