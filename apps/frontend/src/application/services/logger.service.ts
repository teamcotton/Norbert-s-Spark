const LogMethod = {
  TRACE: 'trace',
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
} as const

type LogMethodType = (typeof LogMethod)[keyof typeof LogMethod]

/**
 * Configuration options for the UnifiedLogger.
 */
export interface LoggerOptions {
  /**
   * The minimum log level to output. Messages below this level will be filtered out.
   * Hierarchy: TRACE < DEBUG < INFO < WARN < ERROR
   * @default 'debug'
   */
  method?: LogMethodType
  /**
   * An optional prefix to prepend to all log messages.
   * Useful for identifying the source of log messages (e.g., component name, module name).
   * @example '[AuthService]', '[UserAPI]'
   */
  prefix?: string
  /**
   * The numeric log level for compatibility purposes.
   */
  level?: number
}

/**
 * Represents a formatted log message with metadata.
 */
export interface FormattedLogMessage {
  /**
   * ISO 8601 timestamp when the log message was created.
   */
  timestamp: string
  /**
   * The prefix string for the logger instance, if configured.
   */
  prefix: string
  /**
   * The log method/level in uppercase (e.g., 'DEBUG', 'INFO', 'WARN', 'ERROR').
   */
  method: string
  /**
   * The actual log message content.
   */
  message: string
  /**
   * Optional numeric log level, included only if configured in LoggerOptions.
   */
  level?: number
}

/**
 * A unified logging service that provides consistent formatting and level-based filtering
 * across the application. Supports trace, debug, info, warn, and error methods with automatic
 * timestamp and prefix formatting. Returns formatted objects instead of strings for better
 * structured logging.
 *
 * @example
 * ```typescript
 * // Create a logger with default settings (DEBUG method)
 * const logger = new UnifiedLogger()
 * logger.info('Application started')
 *
 * // Create a logger with custom options
 * const logger = new UnifiedLogger({ method: 'debug', prefix: 'MyComponent' })
 * logger.debug('Debug information', { userId: 123 })
 * logger.error('An error occurred', error)
 *
 * // Create a logger with numeric level for compatibility
 * const logger = new UnifiedLogger({ method: 'info', level: 20 })
 * logger.info('Message') // Output includes level: 20
 *
 * // Change logging threshold dynamically
 * logger.setMethod('warn') // Only warn and error will log now
 * logger.getMethod() // Returns 'warn'
 * ```
 */
export class UnifiedLogger {
  private static readonly METHOD_LEVELS = [
    LogMethod.TRACE,
    LogMethod.DEBUG,
    LogMethod.INFO,
    LogMethod.WARN,
    LogMethod.ERROR,
  ]

  private method: LogMethodType
  private readonly prefix: string
  private level?: number

  constructor(options: LoggerOptions = {}) {
    this.level = options.level
    this.method = options.method || LogMethod.DEBUG
    this.prefix = options.prefix || ''
  }

  private shouldLog(method: LogMethodType): boolean {
    return (
      UnifiedLogger.METHOD_LEVELS.indexOf(method) >=
      UnifiedLogger.METHOD_LEVELS.indexOf(this.method)
    )
  }

  private formatMessage(
    level: LogMethodType,
    message: string,
    ..._args: unknown[]
  ): FormattedLogMessage {
    const timestamp = new Date().toISOString()
    const prefixPart = this.prefix ? `[${this.prefix}] ` : ''
    const result: FormattedLogMessage = {
      timestamp: timestamp,
      prefix: prefixPart,
      method: level.toUpperCase(),
      message,
    }

    if (this.level !== undefined) {
      result.level = this.level
    }

    return result
  }

  /**
   * Logs a trace-level message with optional additional arguments.
   * Trace messages are only logged in non-production environments and when the logger's
   * method threshold allows trace output.
   *
   * @param message - The main log message
   * @param args - Additional arguments to log (objects, errors, etc.)
   *
   * @example
   * ```typescript
   * logger.trace('Function called', { params: { id: 123 } })
   * logger.trace('Stack trace point', stackInfo)
   * ```
   */
  trace(message: string, ...args: unknown[]): void {
    if (this.shouldLog(LogMethod.TRACE) && process.env.NODE_ENV !== 'production') {
      console.trace(this.formatMessage(LogMethod.TRACE, message), ...args)
    }
  }

  /**
   * Logs a debug-level message with optional additional arguments.
   * Debug messages are only logged in non-production environments and when the logger's
   * method threshold allows debug output.
   *
   * @param message - The main log message
   * @param args - Additional arguments to log (objects, errors, etc.)
   *
   * @example
   * ```typescript
   * logger.debug('Processing item', { itemId: 456 })
   * logger.debug('Cache hit', cacheKey, value)
   * ```
   */
  debug(message: string, ...args: unknown[]): void {
    if (this.shouldLog(LogMethod.DEBUG) && process.env.NODE_ENV !== 'production') {
      console.debug(this.formatMessage(LogMethod.DEBUG, message), ...args)
    }
  }

  /**
   * Logs an info-level message with optional additional arguments.
   * Info messages are only logged in non-production environments and when the logger's
   * method threshold allows info output.
   *
   * @param message - The main log message
   * @param args - Additional arguments to log (objects, errors, etc.)
   *
   * @example
   * ```typescript
   * logger.info('User logged in', { userId: '123' })
   * logger.info('API request completed', responseData)
   * ```
   */
  info(message: string, ...args: unknown[]): void {
    if (this.shouldLog(LogMethod.INFO) && process.env.NODE_ENV !== 'production') {
      console.info(this.formatMessage(LogMethod.INFO, message), ...args)
    }
  }

  /**
   * Logs a warning-level message with optional additional arguments.
   * Warning messages are logged in all environments (including production) when the logger's
   * method threshold allows warn output.
   *
   * @param message - The main log message
   * @param args - Additional arguments to log (objects, errors, etc.)
   *
   * @example
   * ```typescript
   * logger.warn('Deprecated API usage', { api: 'oldEndpoint' })
   * logger.warn('Rate limit approaching', currentRate, limit)
   * ```
   */
  warn(message: string, ...args: unknown[]): void {
    if (this.shouldLog(LogMethod.WARN)) {
      console.warn(this.formatMessage(LogMethod.WARN, message), ...args)
    }
  }

  /**
   * Logs an error-level message with optional additional arguments.
   * Error messages are logged in all environments (including production) when the logger's
   * method threshold allows error output.
   *
   * @param message - The main log message
   * @param args - Additional arguments to log (errors, context objects, etc.)
   *
   * @example
   * ```typescript
   * logger.error('Failed to fetch data', error)
   * logger.error('Database connection lost', { host, port }, error)
   * ```
   */
  error(message: string, ...args: unknown[]): void {
    if (this.shouldLog(LogMethod.ERROR)) {
      console.error(this.formatMessage(LogMethod.ERROR, message), ...args)
    }
  }

  /**
   * Sets the minimum logging method threshold.
   * Messages below this threshold will be filtered out.
   *
   * @param method - The new logging method ('trace' | 'debug' | 'info' | 'warn' | 'error')
   *
   * @example
   * ```typescript
   * logger.setMethod('warn') // Only warn and error messages will be logged
   * logger.setMethod('debug') // Debug, info, warn, and error messages will be logged
   * ```
   */
  setMethod(method: LogMethodType): void {
    this.method = method
  }

  /**
   * Returns the current logging method threshold.
   *
   * @returns The current method ('trace' | 'debug' | 'info' | 'warn' | 'error')
   *
   * @example
   * ```typescript
   * const currentMethod = logger.getMethod() // e.g., 'debug'
   * ```
   */
  getMethod(): LogMethodType {
    return this.method
  }

  /**
   * Sets the optional numeric log level.
   * When set, this value will be included in the formatted log message output.
   * Useful for compatibility with logging systems that use numeric levels.
   *
   * @param level - The numeric log level
   *
   * @example
   * ```typescript
   * logger.setLevel(30) // Sets numeric level to 30
   * logger.info('Message') // Output will include level: 30
   * ```
   */
  setLevel(level: number): void {
    this.level = level
  }

  /**
   * Returns the current numeric log level if set, otherwise undefined.
   *
   * @returns The numeric level or undefined if not configured
   *
   * @example
   * ```typescript
   * const level = logger.getLevel() // e.g., 30 or undefined
   * ```
   */
  getLevel(): number | undefined {
    return this.level
  }
}

/**
 * Factory function to create a new UnifiedLogger instance.
 * Provides a convenient way to instantiate loggers without using 'new'.
 *
 * @param options - Optional configuration for the logger
 * @returns A new UnifiedLogger instance
 *
 * @example
 * ```typescript
 * const logger = createLogger({ method: 'info', prefix: 'API' })
 * logger.info('Request received')
 * ```
 */
export function createLogger(options?: LoggerOptions): UnifiedLogger {
  return new UnifiedLogger(options)
}
