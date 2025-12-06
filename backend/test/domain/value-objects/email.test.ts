import { describe, expect, it } from 'vitest'

import { EmailClass } from '../../../src/domain/value-objects/email.js'
import { ValidationException } from '../../../src/shared/exceptions/validation.exception.js'

describe('EmailClass', () => {
  describe('constructor', () => {
    it('should create an email with valid email address', () => {
      const email = new EmailClass('test@example.com')
      expect(email).toBeInstanceOf(EmailClass)
      expect(email.getValue()).toBe('test@example.com')
    })

    it('should convert email to lowercase', () => {
      const email = new EmailClass('TEST@EXAMPLE.COM')
      expect(email.getValue()).toBe('test@example.com')
    })

    it('should trim whitespace from email', () => {
      const email = new EmailClass('  test@example.com  ')
      expect(email.getValue()).toBe('test@example.com')
    })

    it('should trim and lowercase email', () => {
      const email = new EmailClass('  TEST@EXAMPLE.COM  ')
      expect(email.getValue()).toBe('test@example.com')
    })

    it('should throw error for invalid email format', () => {
      expect(() => new EmailClass('invalid-email')).toThrow(ValidationException)
      expect(() => new EmailClass('invalid-email')).toThrow('Invalid email format')
    })

    it('should throw error for email without @', () => {
      expect(() => new EmailClass('testexample.com')).toThrow(ValidationException)
      expect(() => new EmailClass('testexample.com')).toThrow('Invalid email format')
    })

    it('should throw error for email without domain', () => {
      expect(() => new EmailClass('test@')).toThrow(ValidationException)
      expect(() => new EmailClass('test@')).toThrow('Invalid email format')
    })

    it('should throw error for email without local part', () => {
      expect(() => new EmailClass('@example.com')).toThrow(ValidationException)
      expect(() => new EmailClass('@example.com')).toThrow('Invalid email format')
    })

    it('should throw error for email without TLD', () => {
      expect(() => new EmailClass('test@example')).toThrow(ValidationException)
      expect(() => new EmailClass('test@example')).toThrow('Invalid email format')
    })

    it('should throw error for email with spaces', () => {
      expect(() => new EmailClass('test @example.com')).toThrow(ValidationException)
      expect(() => new EmailClass('test @example.com')).toThrow('Invalid email format')
    })

    it('should throw error for empty string', () => {
      expect(() => new EmailClass('')).toThrow(ValidationException)
      expect(() => new EmailClass('')).toThrow('Invalid email format')
    })
  })

  describe('getValue', () => {
    it('should return the email value', () => {
      const email = new EmailClass('user@domain.com')
      expect(email.getValue()).toBe('user@domain.com')
    })

    it('should return normalized email value', () => {
      const email = new EmailClass('  USER@DOMAIN.COM  ')
      expect(email.getValue()).toBe('user@domain.com')
    })
  })

  describe('equals', () => {
    it('should return true for identical emails', () => {
      const email1 = new EmailClass('test@example.com')
      const email2 = new EmailClass('test@example.com')
      expect(email1.equals(email2)).toBe(true)
    })

    it('should return true for emails with different casing', () => {
      const email1 = new EmailClass('test@example.com')
      const email2 = new EmailClass('TEST@EXAMPLE.COM')
      expect(email1.equals(email2)).toBe(true)
    })

    it('should return true for emails with whitespace differences', () => {
      const email1 = new EmailClass('test@example.com')
      const email2 = new EmailClass('  test@example.com  ')
      expect(email1.equals(email2)).toBe(true)
    })

    it('should return false for different emails', () => {
      const email1 = new EmailClass('test@example.com')
      const email2 = new EmailClass('other@example.com')
      expect(email1.equals(email2)).toBe(false)
    })

    it('should return false for different domains', () => {
      const email1 = new EmailClass('test@example.com')
      const email2 = new EmailClass('test@other.com')
      expect(email1.equals(email2)).toBe(false)
    })

    it('should handle comparison with itself', () => {
      const email = new EmailClass('test@example.com')
      expect(email.equals(email)).toBe(true)
    })
  })

  describe('valid email formats', () => {
    it('should accept standard email format', () => {
      const email = new EmailClass('user@example.com')
      expect(email.getValue()).toBe('user@example.com')
    })

    it('should accept email with subdomain', () => {
      const email = new EmailClass('user@mail.example.com')
      expect(email.getValue()).toBe('user@mail.example.com')
    })

    it('should accept email with numbers', () => {
      const email = new EmailClass('user123@example456.com')
      expect(email.getValue()).toBe('user123@example456.com')
    })

    it('should accept email with dots in local part', () => {
      const email = new EmailClass('first.last@example.com')
      expect(email.getValue()).toBe('first.last@example.com')
    })

    it('should accept email with plus sign', () => {
      const email = new EmailClass('user+tag@example.com')
      expect(email.getValue()).toBe('user+tag@example.com')
    })

    it('should accept email with hyphen in domain', () => {
      const email = new EmailClass('user@my-domain.com')
      expect(email.getValue()).toBe('user@my-domain.com')
    })

    it('should accept email with underscore', () => {
      const email = new EmailClass('user_name@example.com')
      expect(email.getValue()).toBe('user_name@example.com')
    })

    it('should accept email with long TLD', () => {
      const email = new EmailClass('user@example.museum')
      expect(email.getValue()).toBe('user@example.museum')
    })
  })

  describe('immutability', () => {
    it('should not allow modification of value through getValue', () => {
      const email = new EmailClass('test@example.com')
      const value = email.getValue()
      expect(value).toBe('test@example.com')
      // Value is a string primitive, so it's already immutable
      expect(email.getValue()).toBe('test@example.com')
    })

    it('should maintain original value after equals comparison', () => {
      const email1 = new EmailClass('test@example.com')
      const email2 = new EmailClass('other@example.com')
      email1.equals(email2)
      expect(email1.getValue()).toBe('test@example.com')
      expect(email2.getValue()).toBe('other@example.com')
    })
  })

  describe('type safety', () => {
    it('should work with string literal types', () => {
      const email = new EmailClass('typed@example.com' as const)
      expect(email.getValue()).toBe('typed@example.com')
    })

    it('should work with generic string types', () => {
      const emailString: string = 'generic@example.com'
      const email = new EmailClass(emailString)
      expect(email.getValue()).toBe('generic@example.com')
    })
  })
})
