import { ValidationException } from '../../shared/exceptions/validation.exception.js'
import { ValidationUtil } from '../../shared/utils/validation.util.js'
/**
 * Unique symbol for email branding to ensure type safety.
 * This prevents regular strings from being used where Email types are expected.
 */
declare const EmailBrand: unique symbol

/**
 * Branded email type that wraps the Email class with compile-time type safety.
 * The brand ensures that only validated Email instances can be used where this type is expected.
 *
 * @template T - The string literal type of the email address (defaults to string)
 */
export type EmailType<T extends string = string> = Email<T> & { readonly [EmailBrand]: T }

/**
 * Email value object representing a validated email address.
 *
 * Emails are automatically normalized to lowercase and trimmed of whitespace.
 * Validation ensures basic email format: localpart@domain.tld
 *
 * The class uses TypeScript's branded type pattern to provide compile-time type safety,
 * preventing regular strings from being accidentally used where validated emails are required.
 *
 * @template T - The string literal type of the email address (defaults to string)
 *
 * @example
 * const email = new Email('user@example.com')
 * email.getValue() // 'user@example.com'
 *
 * @example
 * const email1 = new Email('test@example.com')
 * const email2 = new Email('TEST@EXAMPLE.COM')
 * email1.equals(email2) // true (case-insensitive comparison)
 */
export class Email<T extends string = string> {
  private readonly value: string
  declare readonly [EmailBrand]: T

  constructor(email: T) {
    const normalized = email.toLowerCase().trim()
    this.validate(normalized)
    this.value = normalized
  }

  private validate(email: string): void {
    if (!ValidationUtil.isEmail(email)) {
      throw new ValidationException('Invalid email format')
    }
  }

  getValue(): string {
    return this.value
  }

  equals(other: Email<string>): boolean {
    return this.value === other.value
  }
}
