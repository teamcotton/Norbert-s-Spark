import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { Dashboard } from '../../../view/client-components/Dashboard.js'

describe('Dashboard Component', () => {
  const mockOnNavigate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Core Rendering', () => {
    it('should render the dashboard title', () => {
      render(<Dashboard canAccessAdmin={false} onNavigate={mockOnNavigate} />)

      const title = screen.getByRole('heading', { name: /dashboard/i, level: 1 })
      expect(title).toBeInTheDocument()
    })

    it('should render the MUI Container component', () => {
      const { container } = render(<Dashboard canAccessAdmin={false} onNavigate={mockOnNavigate} />)

      const muiContainer = container.querySelector('.MuiContainer-root')
      expect(muiContainer).toBeInTheDocument()
    })

    it('should render the grid layout Box', () => {
      const { container } = render(<Dashboard canAccessAdmin={false} onNavigate={mockOnNavigate} />)

      const gridBox = container.querySelector('.MuiBox-root')
      expect(gridBox).toBeInTheDocument()
    })
  })

  describe('Navigation Cards', () => {
    describe('Chat Card', () => {
      it('should render Chat card with icon, title, and description', () => {
        render(<Dashboard canAccessAdmin={false} onNavigate={mockOnNavigate} />)

        expect(screen.getByText('Chat')).toBeInTheDocument()
        expect(screen.getByText('Start a conversation with AI')).toBeInTheDocument()
        expect(screen.getByTestId('ChatIcon')).toBeInTheDocument()
      })

      it('should call onNavigate with /ai when Chat card is clicked', () => {
        render(<Dashboard canAccessAdmin={false} onNavigate={mockOnNavigate} />)

        const chatCard = screen.getByText('Chat').closest('.MuiCardActionArea-root')
        fireEvent.click(chatCard!)

        expect(mockOnNavigate).toHaveBeenCalledWith('/ai')
        expect(mockOnNavigate).toHaveBeenCalledTimes(1)
      })
    })

    describe('Profile Card', () => {
      it('should render Profile card with icon, title, and description', () => {
        render(<Dashboard canAccessAdmin={false} onNavigate={mockOnNavigate} />)

        expect(screen.getByText('Profile')).toBeInTheDocument()
        expect(screen.getByText('View and edit your profile')).toBeInTheDocument()
        expect(screen.getByTestId('PersonIcon')).toBeInTheDocument()
      })

      it('should call onNavigate with /profile when Profile card is clicked', () => {
        render(<Dashboard canAccessAdmin={false} onNavigate={mockOnNavigate} />)

        const profileCard = screen.getByText('Profile').closest('.MuiCardActionArea-root')
        fireEvent.click(profileCard!)

        expect(mockOnNavigate).toHaveBeenCalledWith('/profile')
        expect(mockOnNavigate).toHaveBeenCalledTimes(1)
      })
    })

    describe('Admin Card', () => {
      it('should NOT render Admin card when canAccessAdmin is false', () => {
        render(<Dashboard canAccessAdmin={false} onNavigate={mockOnNavigate} />)

        expect(screen.queryByText('Admin')).not.toBeInTheDocument()
        expect(screen.queryByText('Manage users and settings')).not.toBeInTheDocument()
        expect(screen.queryByTestId('AdminPanelSettingsIcon')).not.toBeInTheDocument()
      })

      it('should render Admin card when canAccessAdmin is true', () => {
        render(<Dashboard canAccessAdmin={true} onNavigate={mockOnNavigate} />)

        expect(screen.getByText('Admin')).toBeInTheDocument()
        expect(screen.getByText('Manage users and settings')).toBeInTheDocument()
        expect(screen.getByTestId('AdminPanelSettingsIcon')).toBeInTheDocument()
      })

      it('should call onNavigate with /admin when Admin card is clicked', () => {
        render(<Dashboard canAccessAdmin={true} onNavigate={mockOnNavigate} />)

        const adminCard = screen.getByText('Admin').closest('.MuiCardActionArea-root')
        fireEvent.click(adminCard!)

        expect(mockOnNavigate).toHaveBeenCalledWith('/admin')
        expect(mockOnNavigate).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('Card Count Based on Role', () => {
    it('should render exactly 2 cards when canAccessAdmin is false', () => {
      const { container } = render(<Dashboard canAccessAdmin={false} onNavigate={mockOnNavigate} />)

      const cards = container.querySelectorAll('.MuiCard-root')
      expect(cards).toHaveLength(2)
    })

    it('should render exactly 3 cards when canAccessAdmin is true', () => {
      const { container } = render(<Dashboard canAccessAdmin={true} onNavigate={mockOnNavigate} />)

      const cards = container.querySelectorAll('.MuiCard-root')
      expect(cards).toHaveLength(3)
    })
  })

  describe('Material UI Icons', () => {
    it('should render ChatIcon for Chat card', () => {
      render(<Dashboard canAccessAdmin={false} onNavigate={mockOnNavigate} />)

      expect(screen.getByTestId('ChatIcon')).toBeInTheDocument()
    })

    it('should render PersonIcon for Profile card', () => {
      render(<Dashboard canAccessAdmin={false} onNavigate={mockOnNavigate} />)

      expect(screen.getByTestId('PersonIcon')).toBeInTheDocument()
    })

    it('should render AdminPanelSettingsIcon when admin access is granted', () => {
      render(<Dashboard canAccessAdmin={true} onNavigate={mockOnNavigate} />)

      expect(screen.getByTestId('AdminPanelSettingsIcon')).toBeInTheDocument()
    })
  })

  describe('Navigation Callback Behavior', () => {
    it('should not call onNavigate on initial render', () => {
      render(<Dashboard canAccessAdmin={false} onNavigate={mockOnNavigate} />)

      expect(mockOnNavigate).not.toHaveBeenCalled()
    })

    it('should handle multiple card clicks correctly', () => {
      render(<Dashboard canAccessAdmin={true} onNavigate={mockOnNavigate} />)

      const chatCard = screen.getByText('Chat').closest('.MuiCardActionArea-root')
      const profileCard = screen.getByText('Profile').closest('.MuiCardActionArea-root')
      const adminCard = screen.getByText('Admin').closest('.MuiCardActionArea-root')

      fireEvent.click(chatCard!)
      fireEvent.click(profileCard!)
      fireEvent.click(adminCard!)

      expect(mockOnNavigate).toHaveBeenCalledTimes(3)
      expect(mockOnNavigate).toHaveBeenNthCalledWith(1, '/ai')
      expect(mockOnNavigate).toHaveBeenNthCalledWith(2, '/profile')
      expect(mockOnNavigate).toHaveBeenNthCalledWith(3, '/admin')
    })

    it('should handle same card clicked multiple times', () => {
      render(<Dashboard canAccessAdmin={false} onNavigate={mockOnNavigate} />)

      const chatCard = screen.getByText('Chat').closest('.MuiCardActionArea-root')

      fireEvent.click(chatCard!)
      fireEvent.click(chatCard!)
      fireEvent.click(chatCard!)

      expect(mockOnNavigate).toHaveBeenCalledTimes(3)
      expect(mockOnNavigate).toHaveBeenCalledWith('/ai')
    })
  })

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(<Dashboard canAccessAdmin={false} onNavigate={mockOnNavigate} />)

      const h1 = screen.getByRole('heading', { level: 1 })
      expect(h1).toHaveTextContent('Dashboard')

      const h2Cards = screen.getAllByRole('heading', { level: 2 })
      expect(h2Cards.length).toBeGreaterThanOrEqual(2)
    })

    it('should render cards as interactive elements', () => {
      render(<Dashboard canAccessAdmin={false} onNavigate={mockOnNavigate} />)

      const chatActionArea = screen.getByText('Chat').closest('.MuiCardActionArea-root')
      const profileActionArea = screen.getByText('Profile').closest('.MuiCardActionArea-root')

      expect(chatActionArea).toBeInTheDocument()
      expect(profileActionArea).toBeInTheDocument()
    })
  })

  describe('Responsive Layout', () => {
    it('should apply grid layout with responsive columns', () => {
      const { container } = render(<Dashboard canAccessAdmin={false} onNavigate={mockOnNavigate} />)

      const gridBox = container.querySelector('.MuiBox-root')
      expect(gridBox).toBeInTheDocument()
    })

    it('should render within a Container with maxWidth="lg"', () => {
      const { container } = render(<Dashboard canAccessAdmin={false} onNavigate={mockOnNavigate} />)

      const muiContainer = container.querySelector('.MuiContainer-maxWidthLg')
      expect(muiContainer).toBeInTheDocument()
    })
  })

  describe('Component Props', () => {
    it('should accept canAccessAdmin boolean prop', () => {
      const { rerender } = render(<Dashboard canAccessAdmin={false} onNavigate={mockOnNavigate} />)

      expect(screen.queryByText('Admin')).not.toBeInTheDocument()

      rerender(<Dashboard canAccessAdmin={true} onNavigate={mockOnNavigate} />)

      expect(screen.getByText('Admin')).toBeInTheDocument()
    })

    it('should accept onNavigate callback prop', () => {
      const customNavigate = vi.fn()
      render(<Dashboard canAccessAdmin={false} onNavigate={customNavigate} />)

      const chatCard = screen.getByText('Chat').closest('.MuiCardActionArea-root')
      fireEvent.click(chatCard!)

      expect(customNavigate).toHaveBeenCalledWith('/ai')
    })
  })
})
