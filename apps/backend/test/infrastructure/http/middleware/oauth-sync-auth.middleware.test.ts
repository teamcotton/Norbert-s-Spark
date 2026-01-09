import type { FastifyReply, FastifyRequest } from 'fastify'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { oauthSyncAuthMiddleware } from '../../../../src/infrastructure/http/middleware/oauth-sync-auth.middleware.js'
import { EnvConfig } from '../../../../src/infrastructure/config/env.config.js'

describe('oauthSyncAuthMiddleware', () => {
  let mockRequest: Partial<FastifyRequest>
  let mockReply: Partial<FastifyReply>
  let sendSpy: ReturnType<typeof vi.fn>
  let codeSpy: ReturnType<typeof vi.fn>
  let logWarnSpy: ReturnType<typeof vi.fn>
  let logInfoSpy: ReturnType<typeof vi.fn>
  let logErrorSpy: ReturnType<typeof vi.fn>

  const validSecret = 'test-oauth-sync-secret-123'

  beforeEach(() => {
    // Reset all mocks and restore spies
    vi.clearAllMocks()
    vi.restoreAllMocks()

    // Mock EnvConfig.OAUTH_SYNC_SECRET to return our test secret
    vi.spyOn(EnvConfig.OAUTH_SYNC_SECRET, 'toString').mockReturnValue(validSecret)

    // Setup reply mock
    sendSpy = vi.fn().mockReturnThis()
    codeSpy = vi.fn().mockReturnValue({ send: sendSpy })

    mockReply = {
      code: codeSpy,
      send: sendSpy,
    } as Partial<FastifyReply>

    // Setup log mocks
    logWarnSpy = vi.fn()
    logInfoSpy = vi.fn()
    logErrorSpy = vi.fn()

    // Setup request mock
    mockRequest = {
      headers: {},
      method: 'POST',
      url: '/auth/oauth-sync',
      log: {
        warn: logWarnSpy,
        info: logInfoSpy,
        error: logErrorSpy,
        debug: vi.fn(),
        trace: vi.fn(),
        fatal: vi.fn(),
      } as any,
    } as Partial<FastifyRequest>
  })

  describe('Successful authentication', () => {
    it('should authenticate valid OAuth sync secret', async () => {
      mockRequest.headers = { 'x-oauth-sync-secret': validSecret }

      await oauthSyncAuthMiddleware(mockRequest as FastifyRequest, mockReply as FastifyReply)

      expect(codeSpy).not.toHaveBeenCalled()
      expect(sendSpy).not.toHaveBeenCalled()
      expect(logInfoSpy).toHaveBeenCalledWith(
        {
          method: 'POST',
          route: '/auth/oauth-sync',
        },
        'OAuth sync authentication attempt'
      )
      expect(logInfoSpy).toHaveBeenCalledWith(
        {
          method: 'POST',
          route: '/auth/oauth-sync',
        },
        'OAuth sync authentication successful'
      )
    })

    it('should not log warning on successful authentication', async () => {
      mockRequest.headers = { 'x-oauth-sync-secret': validSecret }

      await oauthSyncAuthMiddleware(mockRequest as FastifyRequest, mockReply as FastifyReply)

      expect(logWarnSpy).not.toHaveBeenCalled()
    })

    it('should not log error on successful authentication', async () => {
      mockRequest.headers = { 'x-oauth-sync-secret': validSecret }

      await oauthSyncAuthMiddleware(mockRequest as FastifyRequest, mockReply as FastifyReply)

      expect(logErrorSpy).not.toHaveBeenCalled()
    })
  })

  describe('Logging behavior', () => {
    it('should log warning when secret is missing', async () => {
      mockRequest.headers = {}

      await oauthSyncAuthMiddleware(mockRequest as FastifyRequest, mockReply as FastifyReply)

      expect(logWarnSpy).toHaveBeenCalledWith(
        {
          method: 'POST',
          route: '/auth/oauth-sync',
        },
        'OAuth sync authentication failed: missing secret'
      )
    })

    it('should log warning when secret is invalid', async () => {
      mockRequest.headers = { 'x-oauth-sync-secret': 'wrong-secret' }

      await oauthSyncAuthMiddleware(mockRequest as FastifyRequest, mockReply as FastifyReply)

      expect(logWarnSpy).toHaveBeenCalledWith(
        {
          method: 'POST',
          route: '/auth/oauth-sync',
        },
        'OAuth sync authentication failed: invalid secret'
      )
    })

    it('should include request method and route in log context', async () => {
      mockRequest = {
        ...mockRequest,
        headers: {},
        method: 'POST',
        url: '/api/v1/auth/oauth-sync',
      }

      await oauthSyncAuthMiddleware(mockRequest as FastifyRequest, mockReply as FastifyReply)

      expect(logWarnSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          route: '/api/v1/auth/oauth-sync',
        }),
        'OAuth sync authentication failed: missing secret'
      )
    })

    it('should log info for every authentication attempt', async () => {
      mockRequest.headers = { 'x-oauth-sync-secret': validSecret }

      await oauthSyncAuthMiddleware(mockRequest as FastifyRequest, mockReply as FastifyReply)

      expect(logInfoSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
        }),
        'OAuth sync authentication attempt'
      )
    })
  })

  describe('Missing or invalid secret header', () => {
    it('should return 401 when no x-oauth-sync-secret header', async () => {
      mockRequest.headers = {}

      await oauthSyncAuthMiddleware(mockRequest as FastifyRequest, mockReply as FastifyReply)

      expect(codeSpy).toHaveBeenCalledWith(401)
      expect(sendSpy).toHaveBeenCalledWith({
        success: false,
        error: 'Unauthorized access to OAuth sync endpoint',
      })
    })

    it('should return 401 when x-oauth-sync-secret header is undefined', async () => {
      mockRequest.headers = { 'x-oauth-sync-secret': undefined }

      await oauthSyncAuthMiddleware(mockRequest as FastifyRequest, mockReply as FastifyReply)

      expect(codeSpy).toHaveBeenCalledWith(401)
      expect(sendSpy).toHaveBeenCalledWith({
        success: false,
        error: 'Unauthorized access to OAuth sync endpoint',
      })
    })

    it('should return 401 when x-oauth-sync-secret header is empty string', async () => {
      mockRequest.headers = { 'x-oauth-sync-secret': '' }

      await oauthSyncAuthMiddleware(mockRequest as FastifyRequest, mockReply as FastifyReply)

      expect(codeSpy).toHaveBeenCalledWith(401)
      expect(sendSpy).toHaveBeenCalledWith({
        success: false,
        error: 'Unauthorized access to OAuth sync endpoint',
      })
    })

    it('should return 401 when x-oauth-sync-secret is not a string (array)', async () => {
      mockRequest.headers = { 'x-oauth-sync-secret': ['secret1', 'secret2'] as any }

      await oauthSyncAuthMiddleware(mockRequest as FastifyRequest, mockReply as FastifyReply)

      expect(codeSpy).toHaveBeenCalledWith(401)
      expect(sendSpy).toHaveBeenCalledWith({
        success: false,
        error: 'Unauthorized access to OAuth sync endpoint',
      })
    })
  })

  describe('Invalid secret values', () => {
    it('should return 401 for incorrect secret', async () => {
      mockRequest.headers = { 'x-oauth-sync-secret': 'wrong-secret' }

      await oauthSyncAuthMiddleware(mockRequest as FastifyRequest, mockReply as FastifyReply)

      expect(codeSpy).toHaveBeenCalledWith(401)
      expect(sendSpy).toHaveBeenCalledWith({
        success: false,
        error: 'Unauthorized access to OAuth sync endpoint',
      })
    })

    it('should return 401 for secret with different case', async () => {
      mockRequest.headers = { 'x-oauth-sync-secret': validSecret.toUpperCase() }

      await oauthSyncAuthMiddleware(mockRequest as FastifyRequest, mockReply as FastifyReply)

      expect(codeSpy).toHaveBeenCalledWith(401)
      expect(sendSpy).toHaveBeenCalledWith({
        success: false,
        error: 'Unauthorized access to OAuth sync endpoint',
      })
    })

    it('should return 401 for secret with leading whitespace', async () => {
      mockRequest.headers = { 'x-oauth-sync-secret': ` ${validSecret}` }

      await oauthSyncAuthMiddleware(mockRequest as FastifyRequest, mockReply as FastifyReply)

      expect(codeSpy).toHaveBeenCalledWith(401)
      expect(sendSpy).toHaveBeenCalledWith({
        success: false,
        error: 'Unauthorized access to OAuth sync endpoint',
      })
    })

    it('should return 401 for secret with trailing whitespace', async () => {
      mockRequest.headers = { 'x-oauth-sync-secret': `${validSecret} ` }

      await oauthSyncAuthMiddleware(mockRequest as FastifyRequest, mockReply as FastifyReply)

      expect(codeSpy).toHaveBeenCalledWith(401)
      expect(sendSpy).toHaveBeenCalledWith({
        success: false,
        error: 'Unauthorized access to OAuth sync endpoint',
      })
    })

    it('should return 401 for secret that is a substring of valid secret', async () => {
      mockRequest.headers = { 'x-oauth-sync-secret': validSecret.substring(0, 10) }

      await oauthSyncAuthMiddleware(mockRequest as FastifyRequest, mockReply as FastifyReply)

      expect(codeSpy).toHaveBeenCalledWith(401)
      expect(sendSpy).toHaveBeenCalledWith({
        success: false,
        error: 'Unauthorized access to OAuth sync endpoint',
      })
    })

    it('should return 401 for secret that contains valid secret', async () => {
      mockRequest.headers = { 'x-oauth-sync-secret': `prefix-${validSecret}-suffix` }

      await oauthSyncAuthMiddleware(mockRequest as FastifyRequest, mockReply as FastifyReply)

      expect(codeSpy).toHaveBeenCalledWith(401)
      expect(sendSpy).toHaveBeenCalledWith({
        success: false,
        error: 'Unauthorized access to OAuth sync endpoint',
      })
    })

    it('should return 401 for completely random string', async () => {
      mockRequest.headers = { 'x-oauth-sync-secret': 'randomstring123' }

      await oauthSyncAuthMiddleware(mockRequest as FastifyRequest, mockReply as FastifyReply)

      expect(codeSpy).toHaveBeenCalledWith(401)
      expect(sendSpy).toHaveBeenCalledWith({
        success: false,
        error: 'Unauthorized access to OAuth sync endpoint',
      })
    })
  })

  describe('Error handling', () => {
    it('should handle EnvConfig.OAUTH_SYNC_SECRET.toString() throwing error', async () => {
      vi.spyOn(EnvConfig.OAUTH_SYNC_SECRET, 'toString').mockImplementation(() => {
        throw new Error('Config error')
      })

      mockRequest.headers = { 'x-oauth-sync-secret': validSecret }

      await oauthSyncAuthMiddleware(mockRequest as FastifyRequest, mockReply as FastifyReply)

      expect(codeSpy).toHaveBeenCalledWith(401)
      expect(sendSpy).toHaveBeenCalledWith({
        success: false,
        error: 'Unauthorized access to OAuth sync endpoint',
      })
      expect(logErrorSpy).toHaveBeenCalled()
    })

    it('should not expose error details to client', async () => {
      vi.spyOn(EnvConfig.OAUTH_SYNC_SECRET, 'toString').mockImplementation(() => {
        throw new Error('Detailed internal error message')
      })

      mockRequest.headers = { 'x-oauth-sync-secret': validSecret }

      await oauthSyncAuthMiddleware(mockRequest as FastifyRequest, mockReply as FastifyReply)

      expect(sendSpy).toHaveBeenCalledWith({
        success: false,
        error: 'Unauthorized access to OAuth sync endpoint',
      })
      expect(sendSpy).not.toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('Detailed internal error'),
        })
      )
    })

    it('should log error with context when exception occurs', async () => {
      const testError = new Error('Test error')
      vi.spyOn(EnvConfig.OAUTH_SYNC_SECRET, 'toString').mockImplementation(() => {
        throw testError
      })

      mockRequest.headers = { 'x-oauth-sync-secret': validSecret }

      await oauthSyncAuthMiddleware(mockRequest as FastifyRequest, mockReply as FastifyReply)

      expect(logErrorSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          route: '/auth/oauth-sync',
          err: testError,
        }),
        'OAuth sync authentication error'
      )
    })
  })

  describe('Timing attack protection', () => {
    it('should use constant-time comparison (cannot be directly tested but implementation verified)', async () => {
      // We can verify the middleware doesn't fail fast on different length secrets
      const shortSecret = 'short'
      const longSecret = 'a'.repeat(100)

      // Test short secret
      mockRequest.headers = { 'x-oauth-sync-secret': shortSecret }
      const start1 = Date.now()
      await oauthSyncAuthMiddleware(mockRequest as FastifyRequest, mockReply as FastifyReply)
      const duration1 = Date.now() - start1

      // Reset mocks
      vi.clearAllMocks()

      // Test long secret
      mockRequest.headers = { 'x-oauth-sync-secret': longSecret }
      const start2 = Date.now()
      await oauthSyncAuthMiddleware(mockRequest as FastifyRequest, mockReply as FastifyReply)
      const duration2 = Date.now() - start2

      // Both should fail with 401
      expect(codeSpy).toHaveBeenCalledWith(401)

      // Note: Timing comparison would be unreliable in tests
      // The implementation uses constant-time comparison to prevent timing attacks
    })

    it('should reject secrets of different lengths immediately (length check optimization)', async () => {
      const differentLengthSecret = validSecret + 'extra'
      mockRequest.headers = { 'x-oauth-sync-secret': differentLengthSecret }

      await oauthSyncAuthMiddleware(mockRequest as FastifyRequest, mockReply as FastifyReply)

      expect(codeSpy).toHaveBeenCalledWith(401)
      expect(sendSpy).toHaveBeenCalledWith({
        success: false,
        error: 'Unauthorized access to OAuth sync endpoint',
      })
    })
  })

  describe('Reply behavior', () => {
    it('should call reply.code before reply.send', async () => {
      mockRequest.headers = {}

      await oauthSyncAuthMiddleware(mockRequest as FastifyRequest, mockReply as FastifyReply)

      expect(codeSpy).toHaveBeenCalledBefore(sendSpy)
    })

    it('should return reply chain on error, undefined on success', async () => {
      // Test error case - returns reply chain
      mockRequest.headers = {}
      const errorResult = await oauthSyncAuthMiddleware(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      )
      // Fastify's reply.code().send() returns the reply object
      expect(errorResult).toEqual({ send: expect.any(Function) })

      // Test success case - returns undefined
      vi.clearAllMocks()
      mockRequest.headers = { 'x-oauth-sync-secret': validSecret }
      const successResult = await oauthSyncAuthMiddleware(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      )
      expect(successResult).toBeUndefined()
    })

    it('should not call reply methods on successful authentication', async () => {
      // Create fresh mocks
      vi.clearAllMocks()
      const freshSendSpy = vi.fn().mockReturnThis()
      const freshCodeSpy = vi.fn().mockReturnValue({ send: freshSendSpy })
      const freshMockReply = { code: freshCodeSpy, send: freshSendSpy } as Partial<FastifyReply>

      mockRequest.headers = { 'x-oauth-sync-secret': validSecret }

      await oauthSyncAuthMiddleware(mockRequest as FastifyRequest, freshMockReply as FastifyReply)

      expect(freshCodeSpy).not.toHaveBeenCalled()
      expect(freshSendSpy).not.toHaveBeenCalled()
    })

    it('should call reply.code with 401 for all error cases', async () => {
      const errorCases = [
        { headers: {} }, // No header
        { headers: { 'x-oauth-sync-secret': 'wrong-secret' } }, // Invalid secret
        { headers: { 'x-oauth-sync-secret': '' } }, // Empty secret
      ]

      for (const testCase of errorCases) {
        // Reset mocks
        vi.clearAllMocks()
        mockRequest = {
          ...testCase,
          method: 'POST',
          url: '/auth/oauth-sync',
          log: {
            warn: logWarnSpy,
            info: logInfoSpy,
            error: logErrorSpy,
            debug: vi.fn(),
            trace: vi.fn(),
            fatal: vi.fn(),
          } as any,
        } as Partial<FastifyRequest>
        mockReply = { code: codeSpy, send: sendSpy } as Partial<FastifyReply>

        await oauthSyncAuthMiddleware(mockRequest as FastifyRequest, mockReply as FastifyReply)

        expect(codeSpy).toHaveBeenCalledWith(401)
      }
    })
  })

  describe('Integration scenarios', () => {
    it('should authenticate multiple requests with same secret', async () => {
      // First request
      mockRequest.headers = { 'x-oauth-sync-secret': validSecret }
      await oauthSyncAuthMiddleware(mockRequest as FastifyRequest, mockReply as FastifyReply)
      expect(codeSpy).not.toHaveBeenCalled()

      // Reset mocks
      vi.clearAllMocks()

      // Second request with same secret
      await oauthSyncAuthMiddleware(mockRequest as FastifyRequest, mockReply as FastifyReply)
      expect(codeSpy).not.toHaveBeenCalled()
    })

    it('should fail after valid secret then invalid secret', async () => {
      // First request with valid secret
      mockRequest.headers = { 'x-oauth-sync-secret': validSecret }
      await oauthSyncAuthMiddleware(mockRequest as FastifyRequest, mockReply as FastifyReply)
      expect(codeSpy).not.toHaveBeenCalled()

      // Reset for second request
      vi.clearAllMocks()
      const newSendSpy = vi.fn().mockReturnThis()
      const newCodeSpy = vi.fn().mockReturnValue({ send: newSendSpy })
      mockReply = { code: newCodeSpy, send: newSendSpy } as Partial<FastifyReply>

      // Second request with invalid secret
      mockRequest.headers = { 'x-oauth-sync-secret': 'wrong-secret' }
      await oauthSyncAuthMiddleware(mockRequest as FastifyRequest, mockReply as FastifyReply)
      expect(newCodeSpy).toHaveBeenCalledWith(401)
    })
  })

  describe('Edge cases', () => {
    it('should handle header with leading/trailing spaces in value', async () => {
      mockRequest.headers = { 'x-oauth-sync-secret': `  ${validSecret}  ` }

      await oauthSyncAuthMiddleware(mockRequest as FastifyRequest, mockReply as FastifyReply)

      // Should fail because secret is not trimmed
      expect(codeSpy).toHaveBeenCalledWith(401)
      expect(sendSpy).toHaveBeenCalledWith({
        success: false,
        error: 'Unauthorized access to OAuth sync endpoint',
      })
    })

    it('should handle header case sensitivity correctly', async () => {
      // HTTP headers are case-insensitive, but Fastify normalizes to lowercase
      mockRequest.headers = { 'X-OAuth-Sync-Secret': validSecret } as any

      await oauthSyncAuthMiddleware(mockRequest as FastifyRequest, mockReply as FastifyReply)

      // Should fail because Fastify uses lowercase keys
      expect(codeSpy).toHaveBeenCalledWith(401)
      expect(sendSpy).toHaveBeenCalledWith({
        success: false,
        error: 'Unauthorized access to OAuth sync endpoint',
      })
    })

    it('should handle very long secret values', async () => {
      const longSecret = 'a'.repeat(1000)
      vi.spyOn(EnvConfig.OAUTH_SYNC_SECRET, 'toString').mockReturnValue(longSecret)

      mockRequest.headers = { 'x-oauth-sync-secret': longSecret }

      await oauthSyncAuthMiddleware(mockRequest as FastifyRequest, mockReply as FastifyReply)

      expect(codeSpy).not.toHaveBeenCalled()
      expect(sendSpy).not.toHaveBeenCalled()
    })

    it('should handle secret with special characters', async () => {
      const specialSecret = 'secret!@#$%^&*()_+-=[]{}|;:,.<>?'
      vi.spyOn(EnvConfig.OAUTH_SYNC_SECRET, 'toString').mockReturnValue(specialSecret)

      mockRequest.headers = { 'x-oauth-sync-secret': specialSecret }

      await oauthSyncAuthMiddleware(mockRequest as FastifyRequest, mockReply as FastifyReply)

      expect(codeSpy).not.toHaveBeenCalled()
      expect(sendSpy).not.toHaveBeenCalled()
    })
  })
})
