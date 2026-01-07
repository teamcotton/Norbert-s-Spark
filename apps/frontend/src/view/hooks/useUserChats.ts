'use client'

import { useQuery } from '@tanstack/react-query'

import { getChatsByUserIdAction } from '@/infrastructure/serverActions/getChatsByUserId.server.js'

/**
 * React hook that loads the list of chat IDs associated with a given user.
 *
 * It uses React Query to fetch chats from the server and keeps the result cached
 * and synchronized. The query is only executed when a non-null `userId` is provided.
 *
 * @param userId - The identifier of the user whose chats should be fetched; if `null`,
 *   the query is disabled and no request is made.
 * @returns A React Query result object whose `data` field contains an array of chat IDs
 *   for the user when the query succeeds.
 */
export function useUserChats(userId: string | null) {
  const ONE_MINUTE_MS = 60_000
  return useQuery({
    queryKey: ['user-chats', userId],
    queryFn: async () => {
      const response = await getChatsByUserIdAction(userId!)
      return response.data // Extract just the array of chat IDs
    },
    enabled: !!userId, // Only run query if userId exists
    staleTime: ONE_MINUTE_MS, // 1 minute
  })
}
