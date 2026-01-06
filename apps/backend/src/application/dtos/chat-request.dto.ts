import { TypeException } from '../../shared/exceptions/type.exception.js'
import { ValidationException } from '../../shared/exceptions/validation.exception.js'
import { isString } from '@norberts-spark/shared'
import type { UIMessage } from 'ai'

/**
 * Data Transfer Object for AI chat requests
 *
 * Encapsulates the required fields for AI chat interactions and provides validation
 * to ensure data integrity before processing chat requests.
 *
 * @class
 * @property {string} id - Unique identifier for the chat session (readonly)
 * @property {string} trigger - The trigger type for the chat interaction (readonly)
 * @property {UIMessage[]} messages - Array of UI messages in the chat history (readonly)
 *
 * @example
 * ```typescript
 * // Validate and create ChatRequestDto from request body
 * const chatDto = ChatRequestDto.validate(req.body)
 * console.log(chatDto.id) // 'chat-123'
 * console.log(chatDto.trigger) // 'user-input'
 * console.log(chatDto.messages.length) // 3
 * ```
 *
 * @example
 * ```typescript
 * // Direct instantiation (use validate() for safety)
 * const chatDto = new ChatRequestDto('chat-123', 'user-input', messages)
 * ```
 */
export class ChatRequestDto {
  constructor(
    public readonly id: string,
    public readonly trigger: string,
    public readonly messages: UIMessage[]
  ) {}

  /**
   * Validates and creates a ChatRequestDto instance from raw data
   *
   * Performs comprehensive validation on input data to ensure it contains
   * valid id, trigger, and messages fields before creating a ChatRequestDto instance.
   *
   * @static
   * @param {any} data - Raw data object to validate (typically from request body)
   * @returns {ChatRequestDto} Validated ChatRequestDto instance
   *
   * @throws {TypeException} If data is not a valid object (null, undefined, or array)
   * @throws {ValidationException} If id is missing or not a string
   * @throws {ValidationException} If trigger is missing or not a string
   * @throws {ValidationException} If messages is missing or not an array
   *
   * @example
   * ```typescript
   * // Valid data
   * const dto = ChatRequestDto.validate({
   *   id: 'chat-123',
   *   trigger: 'user-input',
   *   messages: [{ role: 'user', content: 'Hello' }]
   * })
   * ```
   *
   * @example
   * ```typescript
   * // Invalid data - throws ValidationException
   * try {
   *   const dto = ChatRequestDto.validate({ id: 'chat-123' })
   * } catch (error) {
   *   console.error(error.message) // 'Trigger is required and must be a string'
   * }
   * ```
   */
  static validate(data: any): ChatRequestDto {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new TypeException('Data must be a valid object')
    }
    if (!data.id || !isString(data.id)) {
      throw new ValidationException('Id is required and must be a string')
    }
    if (!data.trigger || !isString(data.trigger)) {
      throw new ValidationException('Trigger is required and must be a string')
    }
    if (!data.messages || !Array.isArray(data.messages)) {
      throw new ValidationException('Messages is required and must be an array')
    }

    return new ChatRequestDto(data.id, data.trigger, data.messages)
  }
}
