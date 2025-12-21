// Server Action for registering a user
// This file provides a server-side action that can be used from Server
// Components or form actions. It forwards the request to the backend API and
// returns the same `RegisterUserResponse` shape as the client-side action.

import { createLogger } from '@/application/services/logger.service.js'
import type { RegisterUserData, RegisterUserResponse } from '@/domain/auth/index.js'

const logger = createLogger({ prefix: '[registerUser:server]' })

// Note: This is intended to be used as a Next.js Server Action (imported by
// server components). Keep implementation server-only (no browser globals).
export async function registerUserServer(data: RegisterUserData): Promise<RegisterUserResponse> {
  try {
    const apiUrl =
      process.env.NODE_ENV === 'production'
        ? process.env.BACKEND_AI_CALLBACK_URL_PROD
        : process.env.BACKEND_AI_CALLBACK_URL_DEV

    if (!apiUrl) {
      logger.error('[registerUser:server] Backend API URL not configured')
      return { status: 500, success: false, error: 'Backend API URL not configured' }
    }

    const isLocalDevelopment = apiUrl.includes('localhost') || apiUrl.includes('127.0.0.1')

    let response: Response

    if (isLocalDevelopment && apiUrl.startsWith('https')) {
      // For local development with self-signed certs, use node-fetch + https.Agent
      const https = await import('https')
      const nodeFetch = (await import('node-fetch')).default

      const agent = new https.Agent({ rejectUnauthorized: false })

      response = (await nodeFetch(`${apiUrl}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email, name: data.name, password: data.password }),
        agent,
      })) as unknown as Response
    } else {
      response = await fetch(`${apiUrl}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email, name: data.name, password: data.password }),
      })
    }

    const result = (await response.json()) as RegisterUserResponse

    logger.info('[registerUser:server] Registration response', {
      status: response.status,
      ok: response.ok,
    })

    if (response.status === 409) {
      return {
        status: response.status,
        success: false,
        error: result.error || 'Email already in use',
      }
    }

    if (!response.ok) {
      return {
        status: response.status,
        success: false,
        error: result.error || 'Registration failed',
      }
    }

    return { ...result, status: response.status }
  } catch (error) {
    logger.error('[registerUser:server] Error registering user', error)
    return {
      status: 500,
      success: false,
      error: error instanceof Error ? error.message : 'Unexpected error',
    }
  }
}
