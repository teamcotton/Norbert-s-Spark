import { describe, expect, it } from 'vitest'

import { useAdminPage } from '../../../src/view/hooks/useAdminPage.js'

describe('useAdminPage', () => {
  it('should return default values', () => {
    const { currentUserRole, error, loading, paginationModel, rowCount, searchQuery, users } = useAdminPage()

    expect(currentUserRole).toBe('admin')
    expect(error).toBeNull()
    expect(loading).toBe(false)
    expect(paginationModel).toEqual({ page: 0, pageSize: 10 })
    expect(rowCount).toBe(0)
    expect(searchQuery).toBe('')
    expect(users).toEqual([])
  })
})