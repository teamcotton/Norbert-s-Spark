import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Logo } from '@/assets/logo.js'

describe('Logo Component', () => {
  it('renders an SVG element', () => {
    const { container } = render(<Logo />)
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('renders with default width and height', () => {
    const { container } = render(<Logo />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('width', '192')
    expect(svg).toHaveAttribute('height', '192')
  })

  it('renders with custom width and height', () => {
    const { container } = render(<Logo width={100} height={100} />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('width', '100')
    expect(svg).toHaveAttribute('height', '100')
  })

  it('renders with string width and height', () => {
    const { container } = render(<Logo width="50px" height="50px" />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('width', '50px')
    expect(svg).toHaveAttribute('height', '50px')
  })

  it('applies custom className', () => {
    const { container } = render(<Logo className="custom-logo-class" />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveClass('custom-logo-class')
  })

  it('has correct viewBox attribute', () => {
    const { container } = render(<Logo />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('viewBox', '0 0 48 48')
  })

  it('has correct xmlns attribute', () => {
    const { container } = render(<Logo />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('xmlns', 'http://www.w3.org/2000/svg')
  })

  it('contains radial gradient definitions', () => {
    const { container } = render(<Logo />)
    const gradients = container.querySelectorAll('radialGradient')
    expect(gradients.length).toBeGreaterThan(0)
  })

  it('contains polygon elements', () => {
    const { container } = render(<Logo />)
    const polygons = container.querySelectorAll('polygon')
    expect(polygons.length).toBeGreaterThan(0)
  })

  it('renders without className when not provided', () => {
    const { container } = render(<Logo />)
    const svg = container.querySelector('svg')
    expect(svg).not.toHaveAttribute('class')
  })

  it('maintains aspect ratio with viewBox', () => {
    const { container } = render(<Logo width={96} height={96} />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('viewBox', '0 0 48 48')
    expect(svg).toHaveAttribute('width', '96')
    expect(svg).toHaveAttribute('height', '96')
  })
})
