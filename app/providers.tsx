
'use client'
import { QueryClient, QueryClientProvider, HydrationBoundary } from '@tanstack/react-query'
import { useState } from 'react'

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, 
        gcTime: 1000 * 60 * 30,   
        refetchOnWindowFocus: false, 
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary>
        {children}
      </HydrationBoundary>
    </QueryClientProvider>
  )
}