import type { GridPaginationModel, GridRowSelectionModel } from '@mui/x-data-grid'
import { useState } from 'react'

import type { User } from '@/domain/user/user.js'
import { useUsers } from '@/view/hooks/queries/useUsers.js'

interface UseAdminPageReturn {
  currentUserRole: 'admin' | 'moderator' | 'user'
  error: string | null
  handlePaginationChange: (model: GridPaginationModel) => void
  handleSearchChange: (query: string) => void
  handleSelectionChange: (ids: GridRowSelectionModel) => void
  handleDeleteUsers: () => void
  handleDeleteClick: () => void
  handleConfirmDelete: () => void
  handleCancelDelete: () => void
  loading: boolean
  paginationModel: GridPaginationModel
  rowCount: number
  searchQuery: string
  selectedUserIds: GridRowSelectionModel
  showConfirmDialog: boolean
  users: readonly User[]
}

/**
 * Custom hook for admin page logic following DDD architecture.
 * Handles user data fetching, pagination, search, and error states.
 * Uses TanStack Query for automatic caching, refetching, and state management.
 */
export function useAdminPage(): UseAdminPageReturn {
  const [searchQuery, setSearchQuery] = useState('')
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  })
  const [selectedUserIds, setSelectedUserIds] = useState<GridRowSelectionModel>({
    type: 'include',
    ids: new Set(),
  })
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  // TODO: Replace with actual user role from authentication
  const currentUserRole = 'admin' as 'admin' | 'moderator' | 'user'

  // Use TanStack Query hook for data fetching with automatic caching
  const { error, isLoading, total, users } = useUsers({
    limit: paginationModel.pageSize,
    offset: paginationModel.page * paginationModel.pageSize,
  })

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
  }

  const handlePaginationChange = (model: GridPaginationModel) => {
    setPaginationModel(model)
  }

  const handleSelectionChange = (ids: GridRowSelectionModel) => {
    setSelectedUserIds(ids)
  }

  const handleDeleteClick = () => {
    setShowConfirmDialog(true)
  }

  const handleConfirmDelete = () => {
    setShowConfirmDialog(false)
    handleDeleteUsers()
  }

  const handleCancelDelete = () => {
    setShowConfirmDialog(false)
  }

  const handleDeleteUsers = () => {
    // TODO: Implement delete users functionality
    console.log('Delete users:', selectedUserIds)
  }

  return {
    currentUserRole,
    error,
    handlePaginationChange,
    handleSearchChange,
    handleSelectionChange,
    handleDeleteUsers,
    handleDeleteClick,
    handleConfirmDelete,
    handleCancelDelete,
    loading: isLoading,
    paginationModel,
    rowCount: total,
    searchQuery,
    selectedUserIds,
    showConfirmDialog,
    users,
  }
}
