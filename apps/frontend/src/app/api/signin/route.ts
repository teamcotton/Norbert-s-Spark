import { signInServer } from '@/app/actions/signIn.server.js'
import { createLogger } from '@/application/services/logger.service.js'
import type { SignInFormData } from '@/domain/auth/index.js'

const logger = createLogger({ minLevel: 'info', prefix: '[signin:route]' })

export async function POST(request: Request) {
  try {
    const body = (await request.formData()) as unknown as SignInFormData

    // Delegate to signInServer which forwards to backend /auth/login
    const result = await signInServer({
      email: String(body.email || ''),
      password: String(body.password || ''),
    })

    if (!result.success) {
      return Response.json(
        { success: false, error: result.error || 'Authentication failed' },
        { status: result.status || 401 }
      )
    }

    // Return backend payload as-is; client can redirect on success
    return Response.json(result, { status: 200 })
  } catch (error) {
    logger.error('[signin:route] Error handling sign-in', error)
    return Response.json({ success: false, error: 'An unexpected error occurred' }, { status: 500 })
  }
}
