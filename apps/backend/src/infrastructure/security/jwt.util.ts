import jwt, { type SignOptions } from 'jsonwebtoken'
import { EnvConfig } from '../config/env.config.js'
import { isString, isNullOrUndefined } from '../../shared/guards/type.guards.js'
import type { JwtUserClaims } from '../../shared/types/index.js'

export class JwtUtil {
  static generateToken(claims: JwtUserClaims): string {
    const { sub, ...restClaims } = claims
    const options: SignOptions = {
      expiresIn: Number.parseInt(EnvConfig.JWT_EXPIRATION),
      issuer: EnvConfig.JWT_ISSUER,
      subject: sub,
    }

    return jwt.sign(restClaims, EnvConfig.JWT_SECRET, options)
  }

  static verifyToken(token: string): { sub: string; email: string; roles?: string[] } {
    const decoded = jwt.verify(token, EnvConfig.JWT_SECRET, {
      issuer: EnvConfig.JWT_ISSUER,
    })

    if (isString(decoded) || isNullOrUndefined(decoded)) {
      throw new Error('Invalid token payload')
    }

    const { sub, email, roles } = decoded as Partial<JwtUserClaims>
    if (!sub || !email) throw new Error('Token missing required claims')
    return { sub, email, roles }
  }

  static decodeToken(token: string): unknown {
    return jwt.decode(token)
  }
}
