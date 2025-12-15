import 'modern-normalize/modern-normalize.css'

import type { Metadata } from 'next'
import React from 'react'

import QueryProvider from '@/infrastructure/react-query/QueryProvider.js'

import ThemeRegistry from './ThemeRegistry.js'

export const metadata: Metadata = {
  title: 'Level 2 Gym',
  description: 'A monorepo built with PNPM and Turborepo',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <ThemeRegistry>
          <QueryProvider>{children}</QueryProvider>
        </ThemeRegistry>
      </body>
    </html>
  )
}
