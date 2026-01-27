'use client'

import { useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import MainLayout from '@/components/layout/MainLayout'
import { useCatchStore } from '@/lib/store'

export default function AppLayout({ children }: { children: ReactNode }) {
  const user = useCatchStore((state) => state.user)
  const router = useRouter()

  useEffect(() => {
    // Redirect to home if not logged in
    if (user === null) {
      router.push('/')
    }
  }, [user, router])

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-ocean-deeper to-ocean-dark flex items-center justify-center">
        <div className="text-white text-2xl">Laden...</div>
      </div>
    )
  }

  return <MainLayout>{children}</MainLayout>
}
