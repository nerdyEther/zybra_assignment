'use client'

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Search } from 'lucide-react'
import { getUsers } from '@/app/api/users'
import UserTable from "@/components/pages/UserTable"
import { useState, useMemo, useEffect } from 'react'

interface User {
  id: number
  name: string
  username: string
  email: string
  website: string
}

function UsersPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentPage = Number(searchParams.get('page')) || 1
  const [globalFilter, setGlobalFilter] = useState('')
  const queryClient = useQueryClient()

  useEffect(() => {
    queryClient.prefetchQuery({
      queryKey: ['users'],
      queryFn: () => getUsers(),
      staleTime: Infinity,
      gcTime: 1000 * 60 * 30,
    })
  }, [queryClient])

  const { data, isLoading, error, refetch } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: () => getUsers(),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    retry: 2,
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })

  const filteredUsers = useMemo(() => {
    const users = data ?? []
    if (!globalFilter) return users
    
    const searchTerm = globalFilter.toLowerCase()
    return users.filter((user) => 
      user.name.toLowerCase().includes(searchTerm) ||
      user.username.toLowerCase().includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm) ||
      user.website.toLowerCase().includes(searchTerm)
    )
  }, [data, globalFilter])

  const handlePageChange = (pageIndex: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', pageIndex.toString())
    router.push(`/users?${params.toString()}`)
  }

  const handleSearch = (value: string) => {
    setGlobalFilter(value)
    if (currentPage !== 1) {
      handlePageChange(1)
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50/95 flex items-center justify-center p-4">
        <div className="text-red-500 bg-red-50 p-4 rounded-lg border border-red-200 w-full max-w-md">
          Error loading users: {error instanceof Error ? error.message : 'An error occurred'}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/95">
      <div className="p-4 md:p-6 lg:p-8 max-w-[1400px] mx-auto">
        <div className="mb-6 md:mb-8 bg-white p-4 md:p-6 rounded-xl shadow-sm space-y-6">
          {/* Header Section - Stacks on mobile */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="w-full sm:w-auto">
              <h1 className="text-xl md:text-2xl font-semibold tracking-tight">User management</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage your team members here.
              </p>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <span className="text-sm font-medium">Demo User</span>
              <Avatar className="h-8 w-8 md:h-10 md:w-10">
                <AvatarImage src="https://github.com/shadcn.png" alt="User avatar" />
                <AvatarFallback>DU</AvatarFallback>
              </Avatar>
            </div>
          </div>

          {/* Controls Section - Stacks on mobile */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mt-4 md:mt-8">
            <div className="flex items-center gap-2 w-full md:w-auto">
              <h2 className="text-lg font-medium">All users</h2>
              <span className="px-2 py-1 rounded-full bg-gray-100 text-sm text-gray-600">
                {filteredUsers.length}
              </span>
            </div>
            <div className="relative w-full md:w-[300px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users..."
                value={globalFilter}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9 w-full bg-gray-50"
              />
            </div>
          </div>
        </div>

        {/* Responsive padding for table container */}
        <div className="-mx-4 md:mx-0">
          <UserTable 
            data={filteredUsers}
            isLoading={isLoading}
            error={error as Error | null}
            onRetry={() => refetch()}
            currentPage={currentPage}
            onPageChange={handlePageChange}
            globalFilter={globalFilter}
          />
        </div>
      </div>
    </div>
  )
}

export default function UsersPage() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen bg-gray-50/95 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <UsersPageContent />
    </Suspense>
  )
}