import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'
import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { registerUser } from '@/application/actions/registerUser.js'
import { useRegisterUser } from '@/view/hooks/queries/useRegisterUser.js'

vi.mock('@/infrastructure/serverActions/registerUser.server.js', () => ({
  registerUserAction: vi.fn(),
}))

vi.mock('@/application/actions/registerUser.js', () => ({
  registerUser: vi.fn(),
}))

describe('useRegisterUser', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('calls server-action and invalidates queries when QueryClientProvider is present', async () => {
    const qc = new QueryClient()
    const invalidateSpy = vi.spyOn(qc, 'invalidateQueries')

    const sampleData = { email: 'a@b.com', name: 'A B', password: 'secret' }

    // The runtime mutation uses the application-level `registerUser`.
    // Ensure we mock that here so the hook's onSuccess receives the
    // expected payload and can invalidate queries.
    vi.mocked(registerUser).mockResolvedValue({ success: true, status: 200, data: { id: 1 } })

    function Wrapper({ children }: { children: React.ReactNode }) {
      return React.createElement(QueryClientProvider, { client: qc }, children)
    }

    const { result } = renderHook(() => useRegisterUser(), { wrapper: Wrapper })

    await act(async () => {
      await result.current.mutateAsync(sampleData)
    })

    expect(vi.mocked(registerUser)).toHaveBeenCalledWith(sampleData)
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['users'] })
  })

  it('uses application-level action in fallback when no QueryClientProvider', async () => {
    const sampleData = { email: 'x@y.com', name: 'X Y', password: 'pw123456' }

    vi.mocked(registerUser).mockResolvedValue({ success: true, status: 200, data: { id: 2 } })

    const { result } = renderHook(() => useRegisterUser())

    await act(async () => {
      const res = await result.current.mutateAsync(sampleData)
      expect(res).toEqual({ success: true, status: 200, data: { id: 2 } })
    })

    // ensure the application action was called (tests mock this function)
    expect(vi.mocked(registerUser)).toHaveBeenCalledWith(sampleData)
    // fallback exposes isSuccess flag after successful mutate
    expect(result.current.isSuccess).toBe(true)
  })
})
