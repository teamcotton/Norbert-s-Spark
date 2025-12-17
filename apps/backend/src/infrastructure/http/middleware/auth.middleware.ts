import type { FastifyRequest, FastifyReply } from 'fastify'
import { JwtUtil } from '../../security/jwt.util.js'

export async function authMiddleware(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  try {
    const header = request.headers.authorization
    const token = header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : null

    if (!token) {
      return reply.code(401).send({ error: 'No token provided' })
    }

    request.user = JwtUtil.verifyToken(token)
  } catch (error) {
    return reply.code(401).send({ error: 'Invalid or expired token' })
  }
}
