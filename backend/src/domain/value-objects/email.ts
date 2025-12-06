import { ValidationException } from '../../shared/exceptions/validation.exception.js'

declare const EmailBrand: unique symbol
export type Email<T extends string = string> = EmailClass<T> & { readonly [EmailBrand]: T }

export class EmailClass<T extends string> {
  private readonly value: string
  declare readonly [EmailBrand]: T

  constructor(email: T) {
    const normalized = email.toLowerCase().trim()
    this.validate(normalized)
    this.value = normalized
  }

  private validate(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      throw new ValidationException('Invalid email format')
    }
  }

  getValue(): string {
    return this.value
  }

  equals(other: EmailClass<string>): boolean {
    return this.value === other.value
  }
}
