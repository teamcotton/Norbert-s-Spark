'use client'
import { Alert, Box, Button, Container, TextField, Typography } from '@mui/material'
import {
  DataGrid,
  type GridColDef,
  type GridPaginationModel,
  type GridRowSelectionModel,
} from '@mui/x-data-grid'
import { useState } from 'react'

import type { User } from '@/domain/user/user.js'

interface AdminPageProps {
  users: readonly User[]
  error: string | null
  loading: boolean
  searchQuery: string
  paginationModel: GridPaginationModel
  rowCount: number
  currentUserRole: 'admin' | 'moderator' | 'user'
  selectedUserIds: GridRowSelectionModel
  onSearchChange: (query: string) => void
  onPaginationChange: (model: GridPaginationModel) => void
  onSelectionChange: (ids: GridRowSelectionModel) => void
  onDeleteUsers: () => void
}

/**
 * Admin page component following DDD architecture.
 * This is a presentational component - all logic is handled by the hook.
 */
export function AdminPage({
  currentUserRole,
  error,
  loading,
  onDeleteUsers,
  onPaginationChange,
  onSearchChange,
  onSelectionChange,
  paginationModel,
  rowCount,
  searchQuery,
  selectedUserIds,
  users,
}: AdminPageProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  const handleDeleteClick = () => {
    setShowConfirmDialog(true)
  }

  const handleConfirmDelete = () => {
    setShowConfirmDialog(false)
    onDeleteUsers()
  }

  const handleCancelDelete = () => {
    setShowConfirmDialog(false)
  }
  // Define columns
  const columns: GridColDef<User>[] = [
    { field: 'name', headerName: 'Name', width: 200 },
    { field: 'email', headerName: 'Email', width: 250 },
    { field: 'role', headerName: 'Role', width: 150 },
    {
      field: 'createdAt',
      headerName: 'Created At',
      width: 200,
      valueFormatter: (value) => new Date(value).toLocaleDateString(),
    },
  ]

  // TODO: include API call to search by email as all emails must be unique
  // Filter users based on search query (searches name, email, and role)
  // Note: This is client-side filtering on the current page only
  const filteredUsers = users.filter((user) => {
    if (!searchQuery) return true

    const query = searchQuery.toLowerCase()
    return (
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.role.toLowerCase().includes(query)
    )
  })

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
          User Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {currentUserRole === 'admin'
            ? 'Manage user accounts and roles'
            : 'View user accounts (read-only access)'}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <TextField
          label="Search users"
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          sx={{ width: 300 }}
          placeholder="Search by email"
          helperText="Search through all users"
        />
      </Box>

      <Box sx={{ height: '100%', width: '100%' }}>
        <DataGrid
          rows={filteredUsers}
          columns={columns}
          loading={loading}
          rowCount={rowCount}
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={onPaginationChange}
          pageSizeOptions={[10, 25, 50, 100]}
          checkboxSelection={currentUserRole === 'admin'}
          disableRowSelectionOnClick
          rowSelectionModel={selectedUserIds}
          onRowSelectionModelChange={onSelectionChange}
          sx={{
            '& .MuiDataGrid-cell': {
              cursor: currentUserRole === 'admin' ? 'pointer' : 'default',
            },
          }}
        />
      </Box>

      {currentUserRole === 'admin' && (
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button
            variant="contained"
            color="error"
            disabled={selectedUserIds.ids.size === 0}
            onClick={handleDeleteClick}
            data-testid="delete-users-button"
          >
            Delete Users ({selectedUserIds.ids.size})
          </Button>
        </Box>
      )}

      {showConfirmDialog && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
          onClick={handleCancelDelete}
        >
          <Box
            sx={{
              bgcolor: 'background.paper',
              p: 4,
              borderRadius: 2,
              maxWidth: 500,
              boxShadow: 24,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Typography variant="h6" gutterBottom>
              Confirm Delete
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Are you sure you want to delete{' '}
              {Array.isArray(selectedUserIds) && selectedUserIds.length > 1
                ? 'these users'
                : 'this user'}
              ? All activity from{' '}
              {Array.isArray(selectedUserIds) && selectedUserIds.length > 1
                ? 'these users'
                : 'this user'}{' '}
              will also be deleted.
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={handleCancelDelete}
                data-testid="cancel-delete-button"
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={handleConfirmDelete}
                data-testid="confirm-delete-button"
              >
                Delete
              </Button>
            </Box>
          </Box>
        </Box>
      )}

      {currentUserRole === 'moderator' && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
          Note: You have read-only access. Contact an administrator to modify user data.
        </Typography>
      )}
    </Container>
  )
}
