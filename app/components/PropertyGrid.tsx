"use client"

import { useEffect, useState } from "react"
import PropertyCard from "./PropertyCard"
import Pagination from "./Pagination"
import { useRouter, useSearchParams } from "next/navigation"
import { Property } from "@/types/property"

interface PropertyGridProps {
  properties: Property[]
  currentPage: number
  totalPages: number
  category: string
  total?: number
}

export default function PropertyGrid({ 
  properties, 
  currentPage, 
  totalPages, 
  category,
  total 
}: PropertyGridProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [hasPrivateAccess, setHasPrivateAccess] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false) // Hydration fix

  // Hydration fix - čekojam vai esam client side
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Pārbaudam localStorage piekļuvi TIKAI client side
  useEffect(() => {
    if (!isClient) return // Nepalaižam server side
    
    try {
      const storedEmail = localStorage.getItem("private_access_email")
      const storedValidUntil = localStorage.getItem("private_access_valid_until")
      
      if (storedEmail && storedValidUntil) {
        const validUntil = parseInt(storedValidUntil)
        if (validUntil > Date.now()) {
          setUserEmail(storedEmail)
          setHasPrivateAccess(true)
        } else {
          // Piekļuve beigusies
          localStorage.removeItem("private_access_email")
          localStorage.removeItem("private_access_valid_until")
        }
      }
    } catch (error) {
      console.warn('LocalStorage not available:', error)
    }
  }, [isClient])

  const currentSort = searchParams.get('kartot-pec') || ''

  const sortOptions = [
    { label: 'Pēc datuma (jaunākie)', value: 'newest' },
    { label: 'Pēc datuma (vecākie)', value: 'oldest' },
    { label: 'Pēc cenas (lētākie)', value: 'price_asc' },
    { label: 'Pēc cenas (dārgākie)', value: 'price_desc' },
    { label: 'Pēc platības (mazākie)', value: 'area_asc' },
    { label: 'Pēc platības (lielākie)', value: 'area_desc' },
  ]

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(Array.from(searchParams.entries()))
    if (e.target.value) {
      params.set('kartot-pec', e.target.value)
    } else {
      params.delete('kartot-pec')
    }
    params.delete('page') // Reset to page 1 when sorting
    router.push(`/ipasumi/${category}?${params.toString()}`)
  }

  // Sadalam īpašumus pēc tipa
  const publicProperties = properties.filter(p => p.visibility === 'public')
  const privateProperties = properties.filter(p => p.visibility === 'private')

  const handleLogout = () => {
    if (!isClient) return
    
    try {
      localStorage.removeItem("private_access_email")
      localStorage.removeItem("private_access_valid_until")
      setHasPrivateAccess(false)
      setUserEmail(null)
      window.location.reload()
    } catch (error) {
      console.warn('LocalStorage not available:', error)
    }
  }

  const getValidUntilDate = () => {
    if (!isClient) return ''
    
    try {
      const validUntil = localStorage.getItem("private_access_valid_until")
      return validUntil ? new Date(parseInt(validUntil)).toLocaleString('lv-LV') : ''
    } catch (error) {
      return ''
    }
  }

  return (
    <div className="space-y-8">
      
      {/* Piekļuves statuss un info - rādām tikai client side */}
      {isClient && privateProperties.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
                {hasPrivateAccess ? (
                  <>
                    <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                    Jums ir piekļuve privātajiem sludinājumiem
                  </>
                ) : (
                  <>
                    <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                    Privātie sludinājumi
                  </>
                )}
              </h3>
              <p className="text-sm text-blue-700">
                {hasPrivateAccess 
                  ? `Piekļuve aktīva līdz: ${getValidUntilDate()}`
                  : `Atrasti ${privateProperties.length} privāti sludinājumi. Nospiediet uz sludinājuma, lai pieprasītu piekļuvi.`
                }
              </p>
            </div>
            {hasPrivateAccess && (
              <button
                onClick={handleLogout}
                className="text-red-600 hover:text-red-800 text-sm underline whitespace-nowrap ml-4"
              >
                Atcelt piekļuvi
              </button>
            )}
          </div>
        </div>
      )}

      {/* Sortēšanas izvēlne */}
      {properties.length > 0 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {total !== undefined ? (
              <>Atrasti <span className="font-semibold">{total}</span> īpašumi</>
            ) : (
              <>Rādīti <span className="font-semibold">{properties.length}</span> īpašumi</>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <label htmlFor="sort" className="text-sm text-gray-600">
              Kārtot:
            </label>
            <select
              id="sort"
              value={currentSort}
              onChange={handleSortChange}
              className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-[#00332D] bg-white"
            >
              <option value="">Pēc noklusējuma</option>
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Īpašumu grid */}
      {properties.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <PropertyCard 
                key={property.id} 
                property={property}
                hasAccess={hasPrivateAccess || property.visibility === 'public'}
              />
            ))}
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            categorySlug={category}
            className="pt-4"
          />
        </>
      ) : (
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nav atrasti īpašumi
            </h3>
            <p className="text-gray-500 mb-4">
              Nav atrasti īpašumi ar norādītajiem filtriem.
            </p>
            <button
              onClick={() => {
                const params = new URLSearchParams()
                router.push(`/ipasumi/${category}?${params.toString()}`)
              }}
              className="text-[#00332D] hover:text-[#004d42] font-medium underline"
            >
              Notīrīt visus filtrus
            </button>
          </div>
        </div>
      )}
    </div>
  )
}