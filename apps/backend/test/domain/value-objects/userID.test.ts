import { uuidv7 } from 'uuidv7'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { UserId, type UserIdType } from '../../../src/domain/value-objects/userID.js'
import { Uuid7Util } from '../../../src/shared/utils/uuid7.util.js'

// Mock Uuid7Util
vi.mock('../../../src/shared/utils/uuid7.util.js', () => ({
  Uuid7Util: {
    isValidUUID: vi.fn(),
    uuidVersionValidation: vi.fn(),
  },
}))

describe('UserId Value Object', () => {
  let validUuid: string

  beforeEach(() => {
    validUuid = uuidv7()
    vi.clearAllMocks()
    // Default mock behavior for valid UUID
    vi.mocked(Uuid7Util.isValidUUID).mockReturnValue(true)
    vi.mocked(Uuid7Util.uuidVersionValidation).mockReturnValue('v7')
  })

  describe('Constructor', () => {
    it('should create a UserId with a valid UUID', () => {
      const userId = new UserId(validUuid)

      expect(userId).toBeInstanceOf(UserId)
      expect(userId.getValue()).toBe(validUuid)
    })

    it('should validate UUID format using Uuid7Util.isValidUUID', () => {
      new UserId(validUuid)

      expect(Uuid7Util.isValidUUID).toHaveBeenCalledWith(validUuid)
      expect(Uuid7Util.isValidUUID).toHaveBeenCalledTimes(1)
    })

    it('should validate UUID version using Uuid7Util.uuidVersionValidation', () => {
      new UserId(validUuid)

      expect(Uuid7Util.uuidVersionValidation).toHaveBeenCalledWith(validUuid)
      expect(Uuid7Util.uuidVersionValidation).toHaveBeenCalledTimes(1)
    })

    it('should throw error for invalid UUID format', () => {
      vi.mocked(Uuid7Util.isValidUUID).mockReturnValue(false)
      const invalidUuid = 'not-a-valid-uuid'

      expect(() => new UserId(invalidUuid)).toThrow('Invalid userID UUID format provided')
    })

    it('should throw error for non-UUID strings', () => {
      vi.mocked(Uuid7Util.isValidUUID).mockReturnValue(false)

      expect(() => new UserId('user-123')).toThrow('Invalid userID UUID format provided')
      expect(() => new UserId('12345')).toThrow('Invalid userID UUID format provided')
      expect(() => new UserId('')).toThrow('Invalid userID UUID format provided')
    })

    it('should throw error for UUID with incorrect format structure', () => {
      vi.mocked(Uuid7Util.isValidUUID).mockReturnValue(false)
      const malformedUuid = '018d3f78-1234-7abc-def0' // Missing part

      expect(() => new UserId(malformedUuid)).toThrow('Invalid userID UUID format provided')
    })

    it('should throw error when version validation returns undefined', () => {
      vi.mocked(Uuid7Util.uuidVersionValidation).mockReturnValue(undefined)

      expect(() => new UserId(validUuid)).toThrow('Invalid userID UUID version: undefined')
    })

    it('should throw error when version validation indicates wrong version', () => {
      vi.mocked(Uuid7Util.uuidVersionValidation).mockReturnValue('Expected v7, but got v4')

      expect(() => new UserId(validUuid)).toThrow(
        'Invalid userID UUID version: Expected v7, but got v4'
      )
    })

    it('should accept different valid UUIDv7 strings', () => {
      const uuid1 = uuidv7()
      const uuid2 = uuidv7()
      const uuid3 = uuidv7()

      const userId1 = new UserId(uuid1)
      const userId2 = new UserId(uuid2)
      const userId3 = new UserId(uuid3)

      expect(userId1.getValue()).toBe(uuid1)
      expect(userId2.getValue()).toBe(uuid2)
      expect(userId3.getValue()).toBe(uuid3)
      expect(userId1.getValue()).not.toBe(userId2.getValue())
      expect(userId2.getValue()).not.toBe(userId3.getValue())
    })
  })

  describe('getValue()', () => {
    it('should return the UUID string value', () => {
      const userId = new UserId(validUuid)

      expect(userId.getValue()).toBe(validUuid)
      expect(typeof userId.getValue()).toBe('string')
    })

    it('should return consistent value on multiple calls', () => {
      const userId = new UserId(validUuid)

      const value1 = userId.getValue()
      const value2 = userId.getValue()
      const value3 = userId.getValue()

      expect(value1).toBe(value2)
      expect(value2).toBe(value3)
      expect(value1).toBe(validUuid)
    })

    it('should not return version string', () => {
      const userId = new UserId(validUuid)
      const value = userId.getValue()

      expect(value).not.toBe('v7')
      expect(value).not.toBe('v4')
      expect(value).toBe(validUuid)
    })

    it('should return UUID that matches UUIDv7 pattern', () => {
      const userId = new UserId(validUuid)
      const value = userId.getValue()

      // UUIDv7 format: 8-4-4-4-12 hexadecimal characters
      expect(value).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      )
    })
  })

  describe('Type Safety with UserIdType', () => {
    it('should be assignable to UserIdType with type assertion', () => {
      const userIdObj = new UserId(validUuid)
      const userId: UserIdType = userIdObj.getValue()

      expect(userIdObj).toBeInstanceOf(UserId)
      expect(userId).toBe(validUuid)
    })

    it('should maintain type brand for compile-time safety', () => {
      const userIdObj = new UserId(validUuid)
      const userId: UserIdType<string> = userIdObj.getValue()

      // This test verifies that the branded type works at compile-time
      // At runtime, UserIdType is just a branded string
      expect(userIdObj).toBeInstanceOf(UserId)
      // At runtime, UserIdType is just a branded string
      expect(typeof userId).toBe('string')
    })
  })

  describe('Immutability', () => {
    it('should return the same value after construction', () => {
      const userId = new UserId(validUuid)
      const initialValue = userId.getValue()

      // Attempt to get value multiple times
      userId.getValue()
      userId.getValue()

      expect(userId.getValue()).toBe(initialValue)
    })

    it('should maintain private value integrity', () => {
      const userId = new UserId(validUuid)
      const initialValue = userId.getValue()

      // Even if attempting to access or modify private internals,
      // getValue() should always return the original UUID
      const value1 = userId.getValue()
      const value2 = userId.getValue()

      expect(value1).toBe(initialValue)
      expect(value2).toBe(initialValue)
      expect(value1).toBe(value2)
    })
  })

  describe('Version Validation', () => {
    it('should accept valid v7 version', () => {
      vi.mocked(Uuid7Util.uuidVersionValidation).mockReturnValue('v7')

      expect(() => new UserId(validUuid)).not.toThrow()
    })

    it('should reject when version validation returns null', () => {
      vi.mocked(Uuid7Util.uuidVersionValidation).mockReturnValue(null as any)

      expect(() => new UserId(validUuid)).toThrow('Invalid userID UUID version: null')
    })

    it('should reject when version validation returns empty string', () => {
      vi.mocked(Uuid7Util.uuidVersionValidation).mockReturnValue('')

      expect(() => new UserId(validUuid)).toThrow('Invalid userID UUID version: ')
    })

    it('should reject when version indicates mismatch', () => {
      vi.mocked(Uuid7Util.uuidVersionValidation).mockReturnValue('Expected v7, but got v1')

      expect(() => new UserId(validUuid)).toThrow(
        'Invalid userID UUID version: Expected v7, but got v1'
      )
    })

    it('should call version validation after format validation', () => {
      vi.mocked(Uuid7Util.isValidUUID).mockReturnValue(false)

      expect(() => new UserId(validUuid)).toThrow('Invalid userID UUID format provided')
      expect(Uuid7Util.isValidUUID).toHaveBeenCalled()
      expect(Uuid7Util.uuidVersionValidation).not.toHaveBeenCalled()
    })
  })

  describe('Edge Cases', () => {
    it('should handle UUIDs with uppercase letters', () => {
      const uppercaseUuid = validUuid.toUpperCase()
      const userId = new UserId(uppercaseUuid)

      expect(userId.getValue()).toBe(uppercaseUuid)
    })

    it('should handle UUIDs with mixed case', () => {
      const mixedCaseUuid = validUuid
        .split('')
        .map((char, i) => (i % 2 === 0 ? char.toLowerCase() : char.toUpperCase()))
        .join('')
      const userId = new UserId(mixedCaseUuid)

      expect(userId.getValue()).toBe(mixedCaseUuid)
    })

    it('should throw error when Uuid7Util.isValidUUID returns false', () => {
      vi.mocked(Uuid7Util.isValidUUID).mockReturnValue(false)

      expect(() => new UserId(validUuid)).toThrow('Invalid userID UUID format provided')
      expect(Uuid7Util.isValidUUID).toHaveBeenCalledWith(validUuid)
    })

    it('should call both validation methods for valid UUIDs', () => {
      new UserId(validUuid)

      expect(Uuid7Util.isValidUUID).toHaveBeenCalledWith(validUuid)
      expect(Uuid7Util.uuidVersionValidation).toHaveBeenCalledWith(validUuid)
    })
  })

  describe('Multiple Instances', () => {
    it('should create independent instances with different UUIDs', () => {
      const uuid1 = uuidv7()
      const uuid2 = uuidv7()
      const userId1 = new UserId(uuid1)
      const userId2 = new UserId(uuid2)

      expect(userId1.getValue()).not.toBe(userId2.getValue())
      expect(userId1).not.toBe(userId2)
    })

    it('should create separate instances even with same UUID', () => {
      const userId1 = new UserId(validUuid)
      const userId2 = new UserId(validUuid)

      expect(userId1.getValue()).toBe(userId2.getValue())
      expect(userId1).not.toBe(userId2) // Different instances
    })

    it('should validate each instance independently', () => {
      const uuid1 = uuidv7()
      const uuid2 = uuidv7()

      new UserId(uuid1)
      new UserId(uuid2)

      expect(Uuid7Util.isValidUUID).toHaveBeenCalledTimes(2)
      expect(Uuid7Util.uuidVersionValidation).toHaveBeenCalledTimes(2)
    })
  })

  describe('Error Messages', () => {
    it('should provide clear error message for invalid UUID format', () => {
      vi.mocked(Uuid7Util.isValidUUID).mockReturnValue(false)

      expect(() => new UserId('invalid')).toThrow('Invalid userID UUID format provided')
    })

    it('should provide clear error message for invalid version', () => {
      vi.mocked(Uuid7Util.uuidVersionValidation).mockReturnValue('Expected v7, but got v5')

      expect(() => new UserId(validUuid)).toThrow(
        'Invalid userID UUID version: Expected v7, but got v5'
      )
    })

    it('should throw immediately on invalid UUID before version validation', () => {
      vi.mocked(Uuid7Util.isValidUUID).mockReturnValue(false)

      expect(() => new UserId('invalid')).toThrow('Invalid userID UUID format provided')
      expect(Uuid7Util.uuidVersionValidation).not.toHaveBeenCalled()
    })

    it('should include version details in error message', () => {
      vi.mocked(Uuid7Util.uuidVersionValidation).mockReturnValue(undefined)

      expect(() => new UserId(validUuid)).toThrow(/Invalid userID UUID version/)
    })
  })

  describe('Integration with Real UUIDs', () => {
    it('should work with actual uuidv7 generated values', () => {
      // Generate multiple real UUIDv7 values
      const realUuids = Array.from({ length: 5 }, () => uuidv7())

      realUuids.forEach((uuid) => {
        const userId = new UserId(uuid)
        expect(userId.getValue()).toBe(uuid)
        expect(typeof userId.getValue()).toBe('string')
      })
    })

    it('should maintain timestamp ordering property of UUIDv7', () => {
      const uuid1 = uuidv7()
      const uuid2 = uuidv7()

      const userId1 = new UserId(uuid1)
      const userId2 = new UserId(uuid2)

      // UUIDv7 should be lexicographically sortable by timestamp
      expect(uuid1 <= uuid2).toBe(true)
      expect(userId1.getValue() <= userId2.getValue()).toBe(true)
    })
  })

  describe('Comparison with ChatId', () => {
    it('should have similar validation behavior to other ID value objects', () => {
      // Both should validate format
      const userId = new UserId(validUuid)

      expect(Uuid7Util.isValidUUID).toHaveBeenCalledWith(validUuid)
      expect(Uuid7Util.uuidVersionValidation).toHaveBeenCalledWith(validUuid)
      expect(userId.getValue()).toBe(validUuid)
    })

    it('should throw errors in the same way for invalid inputs', () => {
      vi.mocked(Uuid7Util.isValidUUID).mockReturnValue(false)

      expect(() => new UserId('invalid')).toThrow('Invalid userID UUID format provided')
    })
  })
})
