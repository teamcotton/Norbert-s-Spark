import { BaseException } from './base.exception.js'
import { ErrorCode } from '../constants/error-codes.js'
import { HttpStatus } from '../constants/http-status.js'

export class ConflictException extends BaseException {
  constructor(message: string, details?: Record<string, any>) {
    super(message, ErrorCode.ALREADY_EXISTS, HttpStatus.CONFLICT, details)
  }
}
