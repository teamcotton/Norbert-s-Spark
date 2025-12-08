import { BaseException } from './base.exception.js'
import { ErrorCode } from '../constants/error-codes.js'
import { HttpStatus } from '../constants/http-status.js'

export class ExternalServiceExceptionException extends BaseException {
  constructor(message: string, details?: Record<string, any>) {
    super(message, ErrorCode.EXTERNAL_SERVICE_ERROR, HttpStatus.INTERNAL_SERVER_ERROR, details)
  }
}
