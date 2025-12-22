import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Ensure environment uses local HTTPS so backendRequest takes the local-https path
const API_URL = 'https://localhost:4321'

describe('backendRequest effectiveTimeoutMs', () => {
  let originalEnv: string | undefined
  let setTimeoutSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    originalEnv = process.env.BACKEND_AI_CALLBACK_URL
    process.env.BACKEND_AI_CALLBACK_URL = API_URL

    // Mock node-fetch (dynamically imported by the module under test)
    vi.mock('node-fetch', () => ({
      default: vi.fn().mockResolvedValue({ ok: true, text: async () => '{}' }),
    }))

    // Spy on global setTimeout to capture the delay value used by backendRequest
    setTimeoutSpy = vi.spyOn(global as never, 'setTimeout')
  })

  afterEach(() => {
    vi.resetModules()
    vi.restoreAllMocks()
    if (originalEnv === undefined) delete process.env.BACKEND_AI_CALLBACK_URL
    else process.env.BACKEND_AI_CALLBACK_URL = originalEnv
  })

  it('uses provided finite positive timeoutMs when valid', async () => {
    const { backendRequest } = await import('@/infrastructure/serverActions/baseServerAction.js')

    await backendRequest({ method: 'GET', endpoint: '/ping', timeoutMs: 2000 })

    // first arg is the callback, second is the delay
    expect(setTimeoutSpy).toHaveBeenCalled()
    const delay = setTimeoutSpy.mock.calls[0][1]
    expect(delay).toBe(2000)
  })

  it('falls back to default when timeoutMs is negative or non-finite', async () => {
    const { backendRequest } = await import('@/infrastructure/serverActions/baseServerAction.js')

    await backendRequest({ method: 'GET', endpoint: '/ping', timeoutMs: -100 })

    expect(setTimeoutSpy).toHaveBeenCalled()
    const delay = setTimeoutSpy.mock.calls[0][1]
    // per implementation the default is 15000 for invalid values
    expect(delay).toBe(15000)
  })
})
