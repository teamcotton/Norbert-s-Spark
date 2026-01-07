'use client'

import { useQuery } from '@tanstack/react-query'

import { getChatsByUserIdAction } from '@/infrastructure/serverActions/getChatsByUserId.server.js'

export function useUserChats(userId: string | null) {
  return useQuery({
    queryKey: ['user-chats', userId],
    queryFn: async () => {
      const response = await getChatsByUserIdAction(userId!)
      return response.data // Extract just the array of chat IDs
    },
    enabled: !!userId, // Only run query if userId exists
    staleTime: 60 * 1000, // 1 minute
  })
}
