'use server'
import type { User } from '@/domain/user/user.js'
import { backendRequest } from '@/infrastructure/serverActions/baseServerAction.js'

export async function findAllUsersAction(
  limit = 10,
  offset = 0
): Promise<{ success: boolean; data?: User[]; pagination?: unknown; error?: string }> {
  const endpoint = `/users?limit=${limit}&offset=${offset}`

  try {
    const result = await backendRequest<{ success: boolean; data?: User[]; pagination?: unknown }>({
      method: 'GET',
      endpoint,
      timeoutMs: 8000,
    })
    return result
  } catch (err) {
    return { success: false, data: [], pagination: { total: 0 }, error: (err as Error).message }
  }
}
