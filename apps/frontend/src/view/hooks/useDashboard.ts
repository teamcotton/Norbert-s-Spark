import { useRouter } from 'next/navigation.js'

interface UseDashboardProps {
  userRoles: string[]
}

interface UseDashboardReturn {
  canAccessAdmin: boolean
  handleNavigate: (path: string) => void
  handleSignOut: () => void
}

/**
 * Custom hook for dashboard page business logic.
 * Manages navigation and role-based access control.
 *
 * @param {UseDashboardProps} props - Hook properties
 * @param {string[]} props.userRoles - Array of user roles
 * @returns {UseDashboardReturn} Dashboard state and handlers
 *
 * @example
 * ```tsx
 * const { canAccessAdmin, handleNavigate, handleSignOut } = useDashboard({ userRoles: ['user', 'admin'] })
 * ```
 */
export function useDashboard({ userRoles }: UseDashboardProps): UseDashboardReturn {
  const router = useRouter()

  // Check if user has admin or moderator role
  const canAccessAdmin = userRoles.includes('admin') || userRoles.includes('moderator')

  /**
   * Navigate to a specific path
   * @param {string} path - The path to navigate to
   */
  const handleNavigate = (path: string) => {
    router.push(path)
  }

  /**
   * Navigate to the sign out page
   */
  const handleSignOut = () => {
    router.push('/api/auth/signout')
  }

  return {
    canAccessAdmin,
    handleNavigate,
    handleSignOut,
  }
}
