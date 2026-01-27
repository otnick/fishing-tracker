'use client'

import { ReactNode } from 'react'
import Navigation from './Navigation'
import { useCatchStore } from '@/lib/store'

interface MainLayoutProps {
  children: ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  const user = useCatchStore((state) => state.user)

  return (
    <div className="min-h-screen bg-gradient-to-b from-ocean-deeper to-ocean-dark">
      <Navigation userEmail={user?.email} />
      
      {/* Main Content */}
      <main className="lg:pl-64 pb-20 lg:pb-4">
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
