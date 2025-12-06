import { describe, expect, it } from 'vitest'

import { ValidationUtil } from '../../../src/shared/utils/validation.util.js'

describe('ValidationUtil', () => {
  describe('isEmail', () => {
    it('should validate standard email addresses', () => {
      expect(ValidationUtil.isEmail('user@example.com')).toBe(true)
      expect(ValidationUtil.isEmail('john.doe@company.co.uk')).toBe(true)
      expect(ValidationUtil.isEmail('test+tag@domain.com')).toBe(true)
    })

    it('should validate emails with dots in local part', () => {
      expect(ValidationUtil.isEmail('first.last@example.com')).toBe(true)
      expect(ValidationUtil.isEmail('user.name.test@domain.com')).toBe(true)
    })

    it('should validate emails with numbers', () => {
      expect(ValidationUtil.isEmail('user123@example.com')).toBe(true)
      expect(ValidationUtil.isEmail('123user@domain456.com')).toBe(true)
    })

    it('should validate emails with subdomains', () => {
      expect(ValidationUtil.isEmail('user@mail.example.com')).toBe(true)
      expect(ValidationUtil.isEmail('test@sub.domain.example.co.uk')).toBe(true)
    })

    it('should reject invalid email formats', () => {
      expect(ValidationUtil.isEmail('invalid-email')).toBe(false)
      expect(ValidationUtil.isEmail('missing@domain')).toBe(false)
      expect(ValidationUtil.isEmail('@example.com')).toBe(false)
      expect(ValidationUtil.isEmail('user@')).toBe(false)
    })

    it('should reject emails with spaces', () => {
      expect(ValidationUtil.isEmail('user @example.com')).toBe(false)
      expect(ValidationUtil.isEmail('user@exam ple.com')).toBe(false)
    })

    it('should reject empty strings', () => {
      expect(ValidationUtil.isEmail('')).toBe(false)
    })

    it('should reject emails without @ symbol', () => {
      expect(ValidationUtil.isEmail('userexample.com')).toBe(false)
    })

    it('should reject emails with multiple @ symbols', () => {
      expect(ValidationUtil.isEmail('user@@example.com')).toBe(false)
      expect(ValidationUtil.isEmail('user@domain@example.com')).toBe(false)
    })
  })

  describe('isUrl', () => {
    it('should validate HTTPS URLs', () => {
      expect(ValidationUtil.isUrl('https://example.com')).toBe(true)
      expect(ValidationUtil.isUrl('https://www.example.com')).toBe(true)
    })

    it('should validate HTTP URLs', () => {
      expect(ValidationUtil.isUrl('http://example.com')).toBe(true)
      expect(ValidationUtil.isUrl('http://localhost')).toBe(true)
    })

    it('should validate URLs with ports', () => {
      expect(ValidationUtil.isUrl('http://localhost:3000')).toBe(true)
      expect(ValidationUtil.isUrl('https://example.com:8080')).toBe(true)
    })

    it('should validate URLs with paths', () => {
      expect(ValidationUtil.isUrl('https://example.com/path/to/resource')).toBe(true)
      expect(ValidationUtil.isUrl('http://example.com/api/v1/users')).toBe(true)
    })

    it('should validate URLs with query strings', () => {
      expect(ValidationUtil.isUrl('https://example.com?param=value')).toBe(true)
      expect(ValidationUtil.isUrl('https://example.com/search?q=test&page=1')).toBe(true)
    })

    it('should validate FTP URLs', () => {
      expect(ValidationUtil.isUrl('ftp://files.example.com')).toBe(true)
    })

    it('should validate URLs with fragments', () => {
      expect(ValidationUtil.isUrl('https://example.com#section')).toBe(true)
      expect(ValidationUtil.isUrl('https://example.com/page#anchor')).toBe(true)
    })

    it('should reject URLs without protocol', () => {
      expect(ValidationUtil.isUrl('example.com')).toBe(false)
      expect(ValidationUtil.isUrl('www.example.com')).toBe(false)
    })

    it('should reject invalid URL formats', () => {
      expect(ValidationUtil.isUrl('not a url')).toBe(false)
      expect(ValidationUtil.isUrl('just-text')).toBe(false)
    })

    it('should reject empty strings', () => {
      expect(ValidationUtil.isUrl('')).toBe(false)
    })
  })

  describe('isUUID', () => {
    it('should validate standard UUIDs', () => {
      expect(ValidationUtil.isUUID('123e4567-e89b-12d3-a456-426614174000')).toBe(true)
      expect(ValidationUtil.isUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true)
    })

    it('should validate UUIDs with uppercase letters', () => {
      expect(ValidationUtil.isUUID('123E4567-E89B-12D3-A456-426614174000')).toBe(true)
      expect(ValidationUtil.isUUID('550E8400-E29B-41D4-A716-446655440000')).toBe(true)
    })

    it('should validate UUIDs with mixed case', () => {
      expect(ValidationUtil.isUUID('123e4567-E89B-12d3-A456-426614174000')).toBe(true)
    })

    it('should validate all zeros UUID', () => {
      expect(ValidationUtil.isUUID('00000000-0000-0000-0000-000000000000')).toBe(true)
    })

    it('should validate all f UUID', () => {
      expect(ValidationUtil.isUUID('ffffffff-ffff-ffff-ffff-ffffffffffff')).toBe(true)
      expect(ValidationUtil.isUUID('FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF')).toBe(true)
    })

    it('should reject UUIDs without hyphens', () => {
      expect(ValidationUtil.isUUID('123e4567e89b12d3a456426614174000')).toBe(false)
    })

    it('should reject UUIDs with wrong format', () => {
      expect(ValidationUtil.isUUID('invalid-uuid')).toBe(false)
      expect(ValidationUtil.isUUID('123-456-789')).toBe(false)
    })

    it('should reject UUIDs with wrong length', () => {
      expect(ValidationUtil.isUUID('123e4567-e89b-12d3-a456-42661417400')).toBe(false)
      expect(ValidationUtil.isUUID('123e4567-e89b-12d3-a456-4266141740000')).toBe(false)
    })

    it('should reject UUIDs with invalid characters', () => {
      expect(ValidationUtil.isUUID('123g4567-e89b-12d3-a456-426614174000')).toBe(false)
      expect(ValidationUtil.isUUID('123e4567-e89b-12d3-a456-42661417400z')).toBe(false)
    })

    it('should reject empty strings', () => {
      expect(ValidationUtil.isUUID('')).toBe(false)
    })
  })

  describe('isStrongPassword', () => {
    it('should validate strong passwords with all requirements', () => {
      expect(ValidationUtil.isStrongPassword('MyP@ssw0rd')).toBe(true)
      expect(ValidationUtil.isStrongPassword('SecureP@ss1')).toBe(true)
      expect(ValidationUtil.isStrongPassword('Test123!@#')).toBe(false) // contains # which is not allowed
    })

    it('should validate passwords with allowed special characters', () => {
      expect(ValidationUtil.isStrongPassword('Pass@123')).toBe(true)
      expect(ValidationUtil.isStrongPassword('Pass$123')).toBe(true)
      expect(ValidationUtil.isStrongPassword('Pass!123')).toBe(true)
      expect(ValidationUtil.isStrongPassword('Pass%123')).toBe(true)
      expect(ValidationUtil.isStrongPassword('Pass*123')).toBe(true)
      expect(ValidationUtil.isStrongPassword('Pass?123')).toBe(true)
      expect(ValidationUtil.isStrongPassword('Pass&123')).toBe(true)
    })

    it('should validate passwords exactly 8 characters', () => {
      expect(ValidationUtil.isStrongPassword('Aa1@bcde')).toBe(true)
    })

    it('should validate long strong passwords', () => {
      expect(ValidationUtil.isStrongPassword('VeryLongP@ssw0rd123')).toBe(true)
      expect(ValidationUtil.isStrongPassword('SuperSecure!Password123')).toBe(true)
    })

    it('should reject passwords less than 8 characters', () => {
      expect(ValidationUtil.isStrongPassword('Aa1@bcd')).toBe(false)
      expect(ValidationUtil.isStrongPassword('Short1!')).toBe(false)
    })

    it('should reject passwords without uppercase letters', () => {
      expect(ValidationUtil.isStrongPassword('password1!')).toBe(false)
      expect(ValidationUtil.isStrongPassword('nouppercase123@')).toBe(false)
    })

    it('should reject passwords without lowercase letters', () => {
      expect(ValidationUtil.isStrongPassword('PASSWORD1!')).toBe(false)
      expect(ValidationUtil.isStrongPassword('NOLOWERCASE123@')).toBe(false)
    })

    it('should reject passwords without digits', () => {
      expect(ValidationUtil.isStrongPassword('Password!')).toBe(false)
      expect(ValidationUtil.isStrongPassword('NoDigits@Here')).toBe(false)
    })

    it('should reject passwords without special characters', () => {
      expect(ValidationUtil.isStrongPassword('Password123')).toBe(false)
      expect(ValidationUtil.isStrongPassword('NoSpecialChar1')).toBe(false)
    })

    it('should reject passwords with disallowed special characters', () => {
      expect(ValidationUtil.isStrongPassword('Pass#123')).toBe(false)
      expect(ValidationUtil.isStrongPassword('Pass^123')).toBe(false)
      expect(ValidationUtil.isStrongPassword('Pass(123)')).toBe(false)
    })

    it('should reject empty strings', () => {
      expect(ValidationUtil.isStrongPassword('')).toBe(false)
    })

    it('should reject passwords with spaces', () => {
      expect(ValidationUtil.isStrongPassword('Pass word1!')).toBe(false)
    })
  })

  describe('isPhoneNumber', () => {
    it('should validate E.164 phone numbers with + prefix', () => {
      expect(ValidationUtil.isPhoneNumber('+14155552671')).toBe(true)
      expect(ValidationUtil.isPhoneNumber('+442071838750')).toBe(true)
      expect(ValidationUtil.isPhoneNumber('+33123456789')).toBe(true)
    })

    it('should validate E.164 phone numbers without + prefix', () => {
      expect(ValidationUtil.isPhoneNumber('14155552671')).toBe(true)
      expect(ValidationUtil.isPhoneNumber('442071838750')).toBe(true)
    })

    it('should validate short phone numbers', () => {
      expect(ValidationUtil.isPhoneNumber('+123')).toBe(true)
      expect(ValidationUtil.isPhoneNumber('12')).toBe(true)
    })

    it('should validate maximum length phone numbers', () => {
      expect(ValidationUtil.isPhoneNumber('+123456789012345')).toBe(true) // 15 digits
      expect(ValidationUtil.isPhoneNumber('123456789012345')).toBe(true) // 15 digits
    })

    it('should reject phone numbers starting with 0', () => {
      expect(ValidationUtil.isPhoneNumber('+0123456789')).toBe(false)
      expect(ValidationUtil.isPhoneNumber('0123456789')).toBe(false)
    })

    it('should reject phone numbers with separators', () => {
      expect(ValidationUtil.isPhoneNumber('+1-415-555-2671')).toBe(false)
      expect(ValidationUtil.isPhoneNumber('+1 415 555 2671')).toBe(false)
      expect(ValidationUtil.isPhoneNumber('+1(415)555-2671')).toBe(false)
    })

    it('should reject phone numbers that are too short', () => {
      expect(ValidationUtil.isPhoneNumber('1')).toBe(false)
      expect(ValidationUtil.isPhoneNumber('+1')).toBe(false)
    })

    it('should reject phone numbers that are too long', () => {
      expect(ValidationUtil.isPhoneNumber('+1234567890123456')).toBe(false) // 16 digits
      expect(ValidationUtil.isPhoneNumber('1234567890123456')).toBe(false) // 16 digits
    })

    it('should reject phone numbers with letters', () => {
      expect(ValidationUtil.isPhoneNumber('+1415555CALL')).toBe(false)
      expect(ValidationUtil.isPhoneNumber('1800FLOWERS')).toBe(false)
    })

    it('should reject empty strings', () => {
      expect(ValidationUtil.isPhoneNumber('')).toBe(false)
    })

    it('should reject non-numeric characters', () => {
      expect(ValidationUtil.isPhoneNumber('+141555526@1')).toBe(false)
      expect(ValidationUtil.isPhoneNumber('141555526#1')).toBe(false)
    })
  })

  describe('edge cases', () => {
    it('should handle empty strings across all validators', () => {
      expect(ValidationUtil.isEmail('')).toBe(false)
      expect(ValidationUtil.isUrl('')).toBe(false)
      expect(ValidationUtil.isUUID('')).toBe(false)
      expect(ValidationUtil.isStrongPassword('')).toBe(false)
      expect(ValidationUtil.isPhoneNumber('')).toBe(false)
    })

    it('should handle whitespace-only strings', () => {
      expect(ValidationUtil.isEmail('   ')).toBe(false)
      expect(ValidationUtil.isUrl('   ')).toBe(false)
      expect(ValidationUtil.isUUID('   ')).toBe(false)
      expect(ValidationUtil.isStrongPassword('   ')).toBe(false)
      expect(ValidationUtil.isPhoneNumber('   ')).toBe(false)
    })

    it('should handle very long strings', () => {
      const longString = 'a'.repeat(1000)
      expect(ValidationUtil.isEmail(longString)).toBe(false)
      expect(ValidationUtil.isUrl(longString)).toBe(false)
      expect(ValidationUtil.isUUID(longString)).toBe(false)
      expect(ValidationUtil.isStrongPassword(longString)).toBe(false)
      expect(ValidationUtil.isPhoneNumber(longString)).toBe(false)
    })
  })
})
