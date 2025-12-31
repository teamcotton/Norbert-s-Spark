'use client'

import type { Session } from 'next-auth'
import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react'

interface SessionProviderProps {
  readonly children: React.ReactNode
  readonly session?: Session | null
}

/**
 * Client-side SessionProvider wrapper for next-auth
 * Wraps the app to provide session context to all client components
 *
 * @example
 * ```tsx
 * <SessionProvider>
 *   <YourApp />
 * </SessionProvider>
 * ```
 */
export function SessionProvider({ children, session }: Readonly<SessionProviderProps>) {
  return <NextAuthSessionProvider session={session}>{children}</NextAuthSessionProvider>
}
