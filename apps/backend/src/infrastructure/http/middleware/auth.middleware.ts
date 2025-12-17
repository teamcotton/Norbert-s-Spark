import type { FastifyRequest, FastifyReply } from 'fastify'
import { JwtUtil } from '../../security/jwt.util.js'

export async function authMiddleware(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  try {
    const header = request.headers.authorization
    const token = header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : null

    request.log.info(
      {
        method: request.method,
        route: (request as any).routerPath ?? request.url,
      },
      'Authentication attempt'
    )

    if (!token) {
      request.log.warn(
        {
          method: request.method,
          route: (request as any).routerPath ?? request.url,
        },
        'Authentication failed: missing bearer token'
      )
      return reply.code(401).send({ error: 'No token provided' })
    }
    request.user = JwtUtil.verifyToken(token)
  } catch (error) {
    request.log.warn(
      {
        method: request.method,
        route: (request as any).routerPath ?? request.url,
        err: error,
      },
      'Authentication failed: invalid or expired token'
    )
    return reply.code(401).send({ error: 'Invalid or expired token' })
  }
}
