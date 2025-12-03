import { describe, expect, it } from 'vitest'

describe('Sample Test Suite', () => {
  it('should pass a simple test', () => {
    expect(1 + 1).toBe(2)
  })

  it('should test string operations', () => {
    const str = 'Level 2 Gym'
    expect(str).toContain('Gym')
  })
})
