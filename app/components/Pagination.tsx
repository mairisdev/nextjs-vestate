"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"

interface PaginationProps {
  currentPage: number
  totalPages: number
  categorySlug?: string
  baseUrl?: string
  className?: string
}

export default function Pagination({ 
  currentPage, 
  totalPages, 
  categorySlug,
  baseUrl,
  className = ""
}: PaginationProps) {
  const searchParams = useSearchParams()

  // Ja nav vairāk par 1 lappusi, nerādām pagination
  if (totalPages <= 1) return null

  // Izveidojam base URL
  const getBaseUrl = () => {
    if (baseUrl) return baseUrl
    if (categorySlug) return `/ipasumi/${categorySlug}`
    return ""
  }

  // Funkcija, kas izveido URL ar query parameters
  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    if (page === 1) {
      params.delete('page')
    } else {
      params.set('page', page.toString())
    }
    
    const queryString = params.toString()
    return `${getBaseUrl()}${queryString ? `?${queryString}` : ''}`
  }

  // Aprēķinām, kuras lapas rādīt
  const getVisiblePages = () => {
    const delta = 2 // Cik lapas rādīt pa abām pusēm no pašreizējās
    const pages: (number | string)[] = []
    
    // Vienmēr rādām pirmo lapu
    if (currentPage - delta > 1) {
      pages.push(1)
      if (currentPage - delta > 2) {
        pages.push('...')
      }
    }
    
    // Rādām lapas ap pašreizējo
    for (let i = Math.max(1, currentPage - delta); i <= Math.min(totalPages, currentPage + delta); i++) {
      pages.push(i)
    }
    
    // Vienmēr rādām pēdējo lapu
    if (currentPage + delta < totalPages) {
      if (currentPage + delta < totalPages - 1) {
        pages.push('...')
      }
      pages.push(totalPages)
    }
    
    return pages
  }

  const visiblePages = getVisiblePages()

  return (
    <nav className={`flex justify-center items-center space-x-2 ${className}`} aria-label="Lapas navigācija">
      
      {/* Iepriekšējā lapa */}
      {currentPage > 1 ? (
        <Link 
          href={createPageUrl(currentPage - 1)}
          className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-gray-700 transition-colors"
          aria-label="Iepriekšējā lapa"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          <span className="hidden sm:inline">Iepriekšējā</span>
        </Link>
      ) : (
        <span className="flex items-center px-3 py-2 text-sm font-medium text-gray-300 bg-gray-100 border border-gray-300 rounded-md cursor-not-allowed">
          <ChevronLeft className="w-4 h-4 mr-1" />
          <span className="hidden sm:inline">Iepriekšējā</span>
        </span>
      )}

      {/* Lapas numuri */}
      <div className="flex space-x-1">
        {visiblePages.map((page, index) => {
          if (page === '...') {
            return (
              <span
                key={`ellipsis-${index}`}
                className="flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-500"
              >
                <MoreHorizontal className="w-4 h-4" />
              </span>
            )
          }

          const pageNumber = page as number
          const isCurrentPage = pageNumber === currentPage

          return (
            <Link
              key={pageNumber}
              href={createPageUrl(pageNumber)}
              className={`flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md transition-colors min-w-[40px] ${
                isCurrentPage
                  ? 'bg-[#00332D] text-white border border-[#00332D] shadow-sm'
                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-900'
              }`}
              aria-label={`Lapa ${pageNumber}`}
              aria-current={isCurrentPage ? 'page' : undefined}
            >
              {pageNumber}
            </Link>
          )
        })}
      </div>

      {/* Nākamā lapa */}
      {currentPage < totalPages ? (
        <Link 
          href={createPageUrl(currentPage + 1)}
          className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-gray-700 transition-colors"
          aria-label="Nākamā lapa"
        >
          <span className="hidden sm:inline">Nākamā</span>
          <ChevronRight className="w-4 h-4 ml-1" />
        </Link>
      ) : (
        <span className="flex items-center px-3 py-2 text-sm font-medium text-gray-300 bg-gray-100 border border-gray-300 rounded-md cursor-not-allowed">
          <span className="hidden sm:inline">Nākamā</span>
          <ChevronRight className="w-4 h-4 ml-1" />
        </span>
      )}
    </nav>
  )
}

// Papildu komponente īsākai pagination (mazākām lapām)
export function SimplePagination({ 
  currentPage, 
  totalPages, 
  categorySlug,
  baseUrl,
  className = ""
}: PaginationProps) {
  const searchParams = useSearchParams()

  if (totalPages <= 1) return null

  const getBaseUrl = () => {
    if (baseUrl) return baseUrl
    if (categorySlug) return `/ipasumi/${categorySlug}`
    return ""
  }

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    if (page === 1) {
      params.delete('page')
    } else {
      params.set('page', page.toString())
    }
    
    const queryString = params.toString()
    return `${getBaseUrl()}${queryString ? `?${queryString}` : ''}`
  }

  return (
    <nav className={`flex justify-between items-center ${className}`} aria-label="Lapas navigācija">
      
      {/* Iepriekšējā lapa */}
      {currentPage > 1 ? (
        <Link 
          href={createPageUrl(currentPage - 1)}
          className="flex items-center px-4 py-2 text-sm font-medium text-[#00332D] bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Iepriekšējā
        </Link>
      ) : (
        <span className="flex items-center px-4 py-2 text-sm font-medium text-gray-300 bg-gray-100 border border-gray-300 rounded-md cursor-not-allowed">
          <ChevronLeft className="w-4 h-4 mr-2" />
          Iepriekšējā
        </span>
      )}

      {/* Pašreizējā lapa info */}
      <span className="text-sm text-gray-700">
        Lapa <span className="font-medium">{currentPage}</span> no <span className="font-medium">{totalPages}</span>
      </span>

      {/* Nākamā lapa */}
      {currentPage < totalPages ? (
        <Link 
          href={createPageUrl(currentPage + 1)}
          className="flex items-center px-4 py-2 text-sm font-medium text-[#00332D] bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          Nākamā
          <ChevronRight className="w-4 h-4 ml-2" />
        </Link>
      ) : (
        <span className="flex items-center px-4 py-2 text-sm font-medium text-gray-300 bg-gray-100 border border-gray-300 rounded-md cursor-not-allowed">
          Nākamā
          <ChevronRight className="w-4 h-4 ml-2" />
        </span>
      )}
    </nav>
  )
}
