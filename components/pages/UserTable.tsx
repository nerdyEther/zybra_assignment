import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    ColumnDef,
    SortingState,
    ColumnFiltersState
  } from '@tanstack/react-table'
  import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
  import { Button } from "@/components/ui/button"
  import { Input } from "@/components/ui/input"
  import {
    Popover,
    PopoverContent,
    PopoverTrigger,
  } from "@/components/ui/popover"
  import {
    Alert,
    AlertDescription,
    AlertTitle,
  } from "@/components/ui/alert"
  import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
  } from "@/components/ui/pagination"
  import { useState, useEffect, useMemo, useCallback } from 'react'
  import { 
    ChevronDown, 
    ChevronUp, 
    ChevronsUpDown, 
    Loader2,
    Filter,
    X,
    AlertCircle,
    RefreshCcw
  } from 'lucide-react'
  
  interface User {
    id: number
    name: string
    username: string
    email: string
    website: string
  }
  
  interface UserTableProps {
    data: User[]
    isLoading: boolean
    error?: Error | null
    onRetry?: () => void
    currentPage: number
    onPageChange: (pageIndex: number) => void
    globalFilter: string
  }
  
  type UserKeys = keyof Omit<User, 'id'>
  
  const columns: Array<ColumnDef<User>> = [
    {
      id: 'name',
      accessorKey: 'name',
      header: 'Name',
    },
    {
      id: 'username',
      accessorKey: 'username',
      header: 'Username', 
    },
    {
      id: 'email',
      accessorKey: 'email',
      header: 'Email',
    },
    {
      id: 'website',
      accessorKey: 'website',
      header: 'Website',
    },
  ]
  
  export default function UserTable({ 
    data, 
    isLoading, 
    error,
    onRetry,
    currentPage,
    onPageChange,
    globalFilter 
  }: UserTableProps) {
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [isFilterOpen, setIsFilterOpen] = useState(false)
    const [isMobile, setIsMobile] = useState(false)
    
    const pageSize = 5
  
    // Handle window resize for responsive pagination
    useEffect(() => {
      const checkMobile = () => {
        setIsMobile(window?.innerWidth < 640)
      }
      
      // Check initial value
      if (typeof window !== 'undefined') {
        checkMobile()
        
        // Add resize listener
        window.addEventListener('resize', checkMobile)
        
        // Cleanup
        return () => window.removeEventListener('resize', checkMobile)
      }
    }, [])
  
    const table = useReactTable({
      data: data ?? [],
      columns,
      getCoreRowModel: getCoreRowModel(),
      getSortedRowModel: getSortedRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      state: {
        sorting,
        columnFilters,
        globalFilter,
        pagination: {
          pageIndex: Math.max(0, Math.min(currentPage - 1, Math.ceil((data?.length ?? 0) / pageSize) - 1)),
          pageSize,
        },
      },
      onSortingChange: setSorting,
      onColumnFiltersChange: setColumnFilters,
      manualPagination: false,
    })
  
    const filteredRows = table.getFilteredRowModel().rows
    const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize))
  
    useEffect(() => {
      const maxPage = totalPages
      if (currentPage > maxPage) {
        onPageChange(maxPage)
      } else if (currentPage < 1) {
        onPageChange(1)
      }
    }, [currentPage, totalPages, onPageChange])
  
    const handleFilterClear = () => {
      setColumnFilters([])
    }
  
    const activeFilters = columnFilters.length > 0
  
    const generatePaginationItems = useCallback((current: number, total: number) => {
      const items = []
      const maxVisiblePages = isMobile ? 3 : 5
      const halfVisible = Math.floor(maxVisiblePages / 2)
      
      let startPage = Math.max(1, current - halfVisible)
      const endPage = Math.min(total, startPage + maxVisiblePages - 1)
      
      if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1)
      }
      
      if (startPage > 1) {
        items.push(1)
        if (startPage > 2) items.push('ellipsis')
      }
      
      for (let i = startPage; i <= endPage; i++) {
        items.push(i)
      }
      
      if (endPage < total) {
        if (endPage < total - 1) items.push('ellipsis')
        items.push(total)
      }
      
      return items
    }, [isMobile])
  
    const paginationItems = useMemo(
      () => generatePaginationItems(currentPage, totalPages),
      [generatePaginationItems, currentPage, totalPages]
    )
  
    if (error) {
      return (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error loading users</AlertTitle>
          <AlertDescription className="mt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <span>{error.message || 'An unexpected error occurred'}</span>
            {onRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="gap-2 w-full sm:w-auto"
              >
                <RefreshCcw className="h-4 w-4" />
                Retry
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )
    }
  
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
          <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full sm:w-auto flex items-center gap-2 bg-white relative hover:bg-gray-50 shadow-sm transition-all duration-200 hover:shadow-md"
                disabled={isLoading}
              >
                <Filter className="h-4 w-4" />
                Filters
                {activeFilters && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center animate-pulse">
                    {columnFilters.length}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent 
              className="w-[calc(100vw-2rem)] sm:w-80 p-4 shadow-xl border-gray-200"
              align="start"
              side="bottom"
              sideOffset={8}
              alignOffset={-4}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-800">Filters</h3>
                  {activeFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs hover:bg-red-50 hover:text-red-600 transition-colors"
                      onClick={handleFilterClear}
                    >
                      Clear all
                      <X className="ml-2 h-3 w-3" />
                    </Button>
                  )}
                </div>
                <div className="space-y-4">
                  {columns.map((column) => {
                    const columnRef = table.getColumn(column.id as UserKeys)
                    return (
                      <div key={column.id} className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          {column.header as string}
                        </label>
                        <Input
                          placeholder={`Filter by ${column.header as string}...`}
                          value={columnRef?.getFilterValue() as string ?? ''}
                          onChange={(e) =>
                            columnRef?.setFilterValue(e.target.value)
                          }
                          className="h-8 text-sm focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                        />
                      </div>
                    )
                  })}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
  
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-x-auto">
          <div className="min-w-[640px]">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="border-b hover:bg-transparent">
                    {headerGroup.headers.map((header) => (
                      <TableHead 
                        key={header.id}
                        className="h-12 px-4 text-sm bg-gray-50 font-medium text-gray-700 first:rounded-tl-xl last:rounded-tr-xl transition-colors duration-200 whitespace-nowrap"
                      >
                        <div
                          className={`flex items-center ${!isLoading ? 'cursor-pointer hover:text-blue-600' : ''} transition-colors duration-200`}
                          onClick={() => !isLoading && header.column.toggleSorting()}
                        >
                          {header.column.columnDef.header as string}
                          {!isLoading && (
                            {
                              asc: <ChevronUp className="ml-2 h-4 w-4 text-blue-500" />,
                              desc: <ChevronDown className="ml-2 h-4 w-4 text-blue-500" />,
                            }[header.column.getIsSorted() as string] ?? (
                              <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50 hover:opacity-100 transition-opacity duration-200" />
                            )
                          )}
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell 
                      colSpan={columns.length} 
                      className="h-32 text-center"
                    >
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="relative">
                          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
                        </div>
                        <span className="text-sm text-gray-500">Loading users...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow 
                      key={row.id} 
                      className="border-b hover:bg-blue-50/50 transition-colors duration-200"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell 
                          key={cell.id}
                          className="px-4 py-4 text-sm text-gray-600"
                        >
                          {cell.getValue() as string}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell 
                      colSpan={columns.length} 
                      className="h-32 text-center"
                    >
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <div className="text-gray-400 rounded-full bg-gray-50 p-3">
                          <X className="h-6 w-6" />
                        </div>
                        <span className="text-sm text-gray-500">
                          {globalFilter || activeFilters 
                            ? 'No results found for the current filters'
                            : 'No users available'}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
  
        <div className="flex items-center justify-center sm:justify-between">
          <Pagination>
            <PaginationContent className="flex-wrap gap-2">
              <PaginationItem className="hidden sm:inline-block">
                <PaginationPrevious 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault()
                    if (currentPage > 1) {
                      onPageChange(currentPage - 1)
                    }
                  }}
                  className={currentPage <= 1 || isLoading ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              
              {paginationItems.map((item, index) => (
                <PaginationItem key={index}>
                  {item === 'ellipsis' ? (
                    <PaginationEllipsis />
                  ) : (
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        onPageChange(item as number)
                      }}
                      isActive={currentPage === item}
                      className={isLoading ? "pointer-events-none" : ""}
                    >
                      {item}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}
              
              <PaginationItem className="hidden sm:inline-block">
                <PaginationNext 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault()
                    if (currentPage < totalPages) {
                      onPageChange(currentPage + 1)
                    }
                  }}
                  className={currentPage >= totalPages || isLoading ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    )
  }