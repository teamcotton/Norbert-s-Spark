import pino from 'pino'

import type { LoggerPort } from '../ports/logger.port.js'

export class PinoLoggerService implements LoggerPort {
  private readonly logger: pino.Logger

  constructor() {
    const isDevelopment = process.env.NODE_ENV !== 'production'

    this.logger = pino({
      level: process.env.LOG_LEVEL ?? 'info',
      ...(isDevelopment && {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
          },
        },
      }),
    })
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.logger.info(context, message)
  }

  error(message: string, error?: Error, context?: Record<string, unknown>): void {
    this.logger.error({ ...context, err: error }, message)
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.logger.warn(context, message)
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.logger.debug(context, message)
  }
}
