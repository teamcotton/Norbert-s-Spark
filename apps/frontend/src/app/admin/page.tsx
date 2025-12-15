import type { User } from '@/domain/user/user.js'

import AdminClient from './AdminClient.js'

async function getUsers(): Promise<readonly User[]> {
  try {
    const apiUrl = process.env.BACKEND_AI_CALLBACK_URL
    if (!apiUrl) {
      console.warn('BACKEND_AI_CALLBACK_URL not set')
      return []
    }

    // eslint-disable-next-line no-console
    console.log('Fetching users from API:', `${apiUrl}/users`)

    const response = await fetch(`${apiUrl}/users`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Don't cache, always fetch fresh data
    })

    if (!response.ok) {
      console.warn('Failed to fetch users from API')
      return []
    }

    const data = (await response.json()) as {
      success: boolean
      data: Array<{
        userId: string
        email: string
        name: string
        role: string
        createdAt: string
      }>
    }
    // Map userId to id for MUI DataGrid compatibility
    return (
      data.data?.map((user) => ({
        id: user.userId,
        name: user.name,
        email: user.email,
        role: user.role as 'user' | 'admin' | 'moderator',
        createdAt: user.createdAt,
      })) || []
    )
    // No finally block needed: agent is request-local, not global
  } catch (error) {
    console.warn('Error fetching users, using empty array:', error)
    return []
  }
}

export default async function AdminPage() {
  const users = await getUsers()

  return <AdminClient users={users} />
}
