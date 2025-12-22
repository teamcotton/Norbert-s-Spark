'use server'

import { z } from 'zod'

import { createLogger } from '@/adapters/secondary/services/logger.service.js'

const logger = createLogger({ minLevel: 'info', prefix: '[register:route]' })

// Schema for the registration payload.
const RegisterUserInputSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long').optional(),
})

export type RegisterUserInput = z.infer<typeof RegisterUserInputSchema>

// Server Action for registering a user.
// This action can be invoked from Server Components or used as a form action.
export async function registerUser(input: RegisterUserInput) {
  const validatedInput = RegisterUserInputSchema.parse(input)

  // Determine backend API URL from environment (production vs dev)
  const apiUrl =
    process.env.NODE_ENV === 'production'
      ? process.env.BACKEND_AI_CALLBACK_URL_PROD
      : process.env.BACKEND_AI_CALLBACK_URL_DEV

  if (!apiUrl) {
    throw new Error('Backend API URL not configured')
  }

  // Parse URL to check hostname for local development
  let url: URL
  try {
    url = new URL(apiUrl)
  } catch (parseError) {
    logger.error('[registerUser] Failed to parse Backend API URL:', parseError)
    throw new Error('Invalid Backend API URL configuration')
  }

  const isLocalDevelopment =
    url.hostname === 'localhost' || url.hostname === '127.0.0.1' || url.hostname === '::1'

  let response: Response
  let result: unknown

  if (isLocalDevelopment && apiUrl.startsWith('https')) {
    const https = await import('https')
    const nodeFetch = (await import('node-fetch')).default

    const agent = new https.Agent({
      rejectUnauthorized: false,
    })

    const nodeFetchResponse = await nodeFetch(`${apiUrl}/users/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validatedInput),
      agent,
    })

    result = await nodeFetchResponse.json().catch(() => undefined)

    response = new Response(JSON.stringify(result), {
      status: nodeFetchResponse.status,
      statusText: nodeFetchResponse.statusText,
      headers: nodeFetchResponse.headers as unknown as HeadersInit,
    })
  } else {
    response = await fetch(`${apiUrl}/users/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validatedInput),
    })

    result = await response.json().catch(() => undefined)
  }

  if (!response.ok) {
    const status = response.status
    // Prefer any returned error message
    const detail = result ?? (await response.text().catch(() => undefined))
    throw new Error(
      `Registration failed with status ${status}${detail ? `: ${JSON.stringify(detail)}` : ''}`
    )
  }

  return result
}
