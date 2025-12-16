import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { PinoLoggerService } from '@/application/services/logger.service.js'

// Mock pino
vi.mock('pino', () => {
  const mockLogger = {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  }

  const pino = vi.fn(() => mockLogger)

  return {
    default: pino,
  }
})

describe('PinoLoggerService', () => {
  let originalEnv: typeof process.env
  let loggerService: PinoLoggerService
  let mockPinoInstance: {
    info: ReturnType<typeof vi.fn>
    error: ReturnType<typeof vi.fn>
    warn: ReturnType<typeof vi.fn>
    debug: ReturnType<typeof vi.fn>
  }

  beforeEach(async () => {
    // Save original environment
    originalEnv = { ...process.env }

    vi.clearAllMocks()

    // Get the mocked pino function
    const pino = await import('pino')
    loggerService = new PinoLoggerService()

    // Get the mock logger instance
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockPinoInstance = (pino.default as any).mock.results[0]?.value
  })

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv
    vi.unstubAllEnvs()
  })

  describe('Constructor', () => {
    it('should create logger instance with default configuration', async () => {
      const pino = await import('pino')
      expect(pino.default).toHaveBeenCalled()
    })

    it('should configure logger with LOG_LEVEL from environment', async () => {
      process.env.LOG_LEVEL = 'debug'

      new PinoLoggerService()

      const pino = await import('pino')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const lastCall = (pino.default as any).mock.calls[(pino.default as any).mock.calls.length - 1]
      expect(lastCall[0]).toHaveProperty('level', 'debug')
    })

    it('should configure pino-pretty transport in development mode', async () => {
      vi.stubEnv('NODE_ENV', 'development')

      new PinoLoggerService()

      const pino = await import('pino')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const lastCall = (pino.default as any).mock.calls[(pino.default as any).mock.calls.length - 1]
      expect(lastCall[0]).toHaveProperty('transport')
      expect(lastCall[0].transport).toEqual({
        target: 'pino-pretty',
        options: {
          colorize: true,
        },
      })
    })

    it('should not configure pino-pretty transport in production mode', async () => {
      vi.stubEnv('NODE_ENV', 'production')

      new PinoLoggerService()

      const pino = await import('pino')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const lastCall = (pino.default as any).mock.calls[(pino.default as any).mock.calls.length - 1]
      expect(lastCall[0]).not.toHaveProperty('transport')
    })
  })

  describe('info', () => {
    it('should log info message without context', () => {
      const message = 'Test info message'

      loggerService.info(message)

      expect(mockPinoInstance.info).toHaveBeenCalledWith(undefined, message)
      expect(mockPinoInstance.info).toHaveBeenCalledTimes(1)
    })

    it('should log info message with context', () => {
      const message = 'User logged in'
      const context = { userId: '123', email: 'test@example.com' }

      loggerService.info(message, context)

      expect(mockPinoInstance.info).toHaveBeenCalledWith(context, message)
      expect(mockPinoInstance.info).toHaveBeenCalledTimes(1)
    })

    it('should log info message with empty context object', () => {
      const message = 'Empty context test'

      loggerService.info(message, {})

      expect(mockPinoInstance.info).toHaveBeenCalledWith({}, message)
    })

    it('should log info message with nested context', () => {
      const message = 'Nested context'
      const context = {
        user: { id: '456', name: 'John' },
        metadata: { timestamp: Date.now() },
      }

      loggerService.info(message, context)

      expect(mockPinoInstance.info).toHaveBeenCalledWith(context, message)
    })
  })

  describe('error', () => {
    it('should log error message without error object or context', () => {
      const message = 'Test error message'

      loggerService.error(message)

      expect(mockPinoInstance.error).toHaveBeenCalledWith({ err: undefined }, message)
      expect(mockPinoInstance.error).toHaveBeenCalledTimes(1)
    })

    it('should log error message with Error object', () => {
      const message = 'An error occurred'
      const error = new Error('Test error')

      loggerService.error(message, error)

      expect(mockPinoInstance.error).toHaveBeenCalledWith({ err: error }, message)
    })

    it('should log error message with Error object and context', () => {
      const message = 'Database connection failed'
      const error = new Error('Connection timeout')
      const context = { database: 'users', retries: 3 }

      loggerService.error(message, error, context)

      expect(mockPinoInstance.error).toHaveBeenCalledWith({ ...context, err: error }, message)
    })

    it('should log error message with context but no Error object', () => {
      const message = 'Request failed'
      const context = { statusCode: 500, endpoint: '/api/users' }

      loggerService.error(message, undefined, context)

      expect(mockPinoInstance.error).toHaveBeenCalledWith({ ...context, err: undefined }, message)
    })

    it('should handle error with custom properties', () => {
      const message = 'Custom error'
      const error = new Error('Base error') as Error & {
        statusCode?: number
        details?: { reason: string }
      }
      error.statusCode = 404
      error.details = { reason: 'Not found' }
      const context = { requestId: 'abc-123' }

      loggerService.error(message, error, context)

      expect(mockPinoInstance.error).toHaveBeenCalledWith({ ...context, err: error }, message)
    })

    it('should merge context and error correctly', () => {
      const message = 'Merged error'
      const error = new Error('Test')
      const context = { key1: 'value1', key2: 'value2' }

      loggerService.error(message, error, context)

      const callArgs = mockPinoInstance.error.mock.calls[0]
      expect(callArgs).toBeDefined()
      expect(callArgs![0]).toHaveProperty('key1', 'value1')
      expect(callArgs![0]).toHaveProperty('key2', 'value2')
      expect(callArgs![0]).toHaveProperty('err', error)
    })
  })

  describe('warn', () => {
    it('should log warning message without context', () => {
      const message = 'Test warning message'

      loggerService.warn(message)

      expect(mockPinoInstance.warn).toHaveBeenCalledWith(undefined, message)
      expect(mockPinoInstance.warn).toHaveBeenCalledTimes(1)
    })

    it('should log warning message with context', () => {
      const message = 'Deprecated API usage'
      const context = { api: '/old-endpoint', version: '1.0' }

      loggerService.warn(message, context)

      expect(mockPinoInstance.warn).toHaveBeenCalledWith(context, message)
      expect(mockPinoInstance.warn).toHaveBeenCalledTimes(1)
    })

    it('should log warning message with empty context object', () => {
      const message = 'Empty context warning'

      loggerService.warn(message, {})

      expect(mockPinoInstance.warn).toHaveBeenCalledWith({}, message)
    })

    it('should log warning message with complex context', () => {
      const message = 'High memory usage'
      const context = {
        memory: { used: 512, total: 1024, percentage: 50 },
        timestamp: new Date().toISOString(),
      }

      loggerService.warn(message, context)

      expect(mockPinoInstance.warn).toHaveBeenCalledWith(context, message)
    })
  })

  describe('debug', () => {
    it('should log debug message without context', () => {
      const message = 'Test debug message'

      loggerService.debug(message)

      expect(mockPinoInstance.debug).toHaveBeenCalledWith(undefined, message)
      expect(mockPinoInstance.debug).toHaveBeenCalledTimes(1)
    })

    it('should log debug message with context', () => {
      const message = 'Function execution'
      const context = { function: 'getUserData', duration: 123, params: { id: '456' } }

      loggerService.debug(message, context)

      expect(mockPinoInstance.debug).toHaveBeenCalledWith(context, message)
      expect(mockPinoInstance.debug).toHaveBeenCalledTimes(1)
    })

    it('should log debug message with empty context object', () => {
      const message = 'Empty context debug'

      loggerService.debug(message, {})

      expect(mockPinoInstance.debug).toHaveBeenCalledWith({}, message)
    })

    it('should log debug message with detailed context', () => {
      const message = 'Query executed'
      const context = {
        query: 'SELECT * FROM users',
        params: [1, 2, 3],
        duration: 45,
        rows: 10,
      }

      loggerService.debug(message, context)

      expect(mockPinoInstance.debug).toHaveBeenCalledWith(context, message)
    })
  })

  describe('LoggerPort Interface Compliance', () => {
    it('should implement all required methods from LoggerPort', () => {
      expect(loggerService).toHaveProperty('info')
      expect(loggerService).toHaveProperty('error')
      expect(loggerService).toHaveProperty('warn')
      expect(loggerService).toHaveProperty('debug')

      expect(typeof loggerService.info).toBe('function')
      expect(typeof loggerService.error).toBe('function')
      expect(typeof loggerService.warn).toBe('function')
      expect(typeof loggerService.debug).toBe('function')
    })

    it('should have correct method signatures', () => {
      // Test that methods can be called with expected parameters
      expect(() => loggerService.info('test')).not.toThrow()
      expect(() => loggerService.info('test', {})).not.toThrow()

      expect(() => loggerService.error('test')).not.toThrow()
      expect(() => loggerService.error('test', new Error())).not.toThrow()
      expect(() => loggerService.error('test', new Error(), {})).not.toThrow()

      expect(() => loggerService.warn('test')).not.toThrow()
      expect(() => loggerService.warn('test', {})).not.toThrow()

      expect(() => loggerService.debug('test')).not.toThrow()
      expect(() => loggerService.debug('test', {})).not.toThrow()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty string messages', () => {
      loggerService.info('')
      loggerService.error('')
      loggerService.warn('')
      loggerService.debug('')

      expect(mockPinoInstance.info).toHaveBeenCalledWith(undefined, '')
      expect(mockPinoInstance.error).toHaveBeenCalledWith({ err: undefined }, '')
      expect(mockPinoInstance.warn).toHaveBeenCalledWith(undefined, '')
      expect(mockPinoInstance.debug).toHaveBeenCalledWith(undefined, '')
    })

    it('should handle very long messages', () => {
      const longMessage = 'a'.repeat(10000)

      loggerService.info(longMessage)

      expect(mockPinoInstance.info).toHaveBeenCalledWith(undefined, longMessage)
    })

    it('should handle special characters in messages', () => {
      const specialMessage = '特殊文字 émojis 🎉 \n\t\r symbols @#$%'

      loggerService.info(specialMessage)

      expect(mockPinoInstance.info).toHaveBeenCalledWith(undefined, specialMessage)
    })

    it('should handle context with null values', () => {
      const context = { key: null, another: undefined }

      loggerService.info('test', context)

      expect(mockPinoInstance.info).toHaveBeenCalledWith(context, 'test')
    })

    it('should handle context with circular references', () => {
      const context: Record<string, unknown> = { name: 'test' }
      context.self = context

      // Should not throw when logging circular references
      expect(() => loggerService.info('circular', context)).not.toThrow()
    })

    it('should handle multiple rapid log calls', () => {
      for (let i = 0; i < 100; i++) {
        loggerService.info(`Message ${i}`)
      }

      expect(mockPinoInstance.info).toHaveBeenCalledTimes(100)
    })
  })

  describe('Integration Scenarios', () => {
    it('should log a complete request lifecycle', () => {
      const requestId = 'req-123'
      const context = { requestId, method: 'GET', path: '/api/users' }

      loggerService.info('Request started', context)
      loggerService.debug('Validating request', { ...context, validation: 'passed' })
      loggerService.info('Request completed', { ...context, statusCode: 200, duration: 123 })

      expect(mockPinoInstance.info).toHaveBeenCalledTimes(2)
      expect(mockPinoInstance.debug).toHaveBeenCalledTimes(1)
    })

    it('should log an error scenario with context propagation', () => {
      const requestId = 'req-456'
      const context = { requestId, userId: '789' }

      loggerService.info('Processing user request', context)
      loggerService.warn('User not in cache', context)

      const error = new Error('Database connection failed')
      loggerService.error('Request failed', error, {
        ...context,
        statusCode: 500,
      })

      expect(mockPinoInstance.info).toHaveBeenCalledTimes(1)
      expect(mockPinoInstance.warn).toHaveBeenCalledTimes(1)
      expect(mockPinoInstance.error).toHaveBeenCalledTimes(1)
    })

    it('should handle mixed logging levels', () => {
      loggerService.debug('Debug info')
      loggerService.info('Info message')
      loggerService.warn('Warning message')
      loggerService.error('Error message')

      expect(mockPinoInstance.debug).toHaveBeenCalledTimes(1)
      expect(mockPinoInstance.info).toHaveBeenCalledTimes(1)
      expect(mockPinoInstance.warn).toHaveBeenCalledTimes(1)
      expect(mockPinoInstance.error).toHaveBeenCalledTimes(1)
    })
  })
})
