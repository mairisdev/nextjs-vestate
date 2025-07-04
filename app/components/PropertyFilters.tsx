'use client'
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { MapPin, ChevronDown } from "lucide-react"

interface Category {
  id: string
  name: string
  slug: string
  _count: { properties: number }
}

interface PropertyFiltersProps {
  categories: Category[]
  currentCategory: string
}

export default function PropertyFilters({ categories, currentCategory }: PropertyFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [filters, setFilters] = useState({
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    rooms: searchParams.get('rooms') || '',
    minArea: searchParams.get('minArea') || '',
    maxArea: searchParams.get('maxArea') || '',
  })

  const [showNewProjects, setShowNewProjects] = useState(false)

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const applyFilters = () => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value)
    })
    
    router.push(`/ipasumi/${currentCategory}?${params.toString()}`)
  }

  const clearFilters = () => {
    setFilters({
      minPrice: '',
      maxPrice: '',
      rooms: '',
      minArea: '',
      maxArea: '',
    })
    router.push(`/ipasumi/${currentCategory}`)
  }

  return (
    <div className="space-y-6">
      {/* Reset filters button */}
      <button 
        onClick={clearFilters}
        className="text-sm text-[#00332D] hover:underline"
      >
        Notīrīt filtru
      </button>

      {/* Location filter */}
      <div className="bg-white p-4 rounded-lg border">
        <div className="flex items-center space-x-2 mb-3">
          <MapPin className="w-5 h-5 text-[#B91C1C]" />
          <span className="font-medium">Vieta</span>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </div>
        
        <div className="space-y-2">
          <div className="flex space-x-2">
            <input type="checkbox" id="ire" className="rounded" />
            <label htmlFor="ire" className="text-sm">Īrē</label>
          </div>
          <div className="flex space-x-2">
            <input type="checkbox" id="pirkt" className="rounded" />
            <label htmlFor="pirkt" className="text-sm">Pirkt</label>
          </div>
        </div>
      </div>

      {/* Price filter */}
      <div className="bg-white p-4 rounded-lg border">
        <h3 className="font-medium mb-3">Cena EUR</h3>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="300"
            value={filters.minPrice}
            onChange={(e) => handleFilterChange('minPrice', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00332D]"
          />
          <input
            type="number"
            placeholder="300 000+"
            value={filters.maxPrice}
            onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00332D]"
          />
        </div>
        
        {/* Price range slider placeholder */}
        <div className="mt-4">
          <div className="relative">
            <div className="w-full h-2 bg-gray-200 rounded-full">
              <div className="absolute left-0 w-6 h-6 bg-[#B91C1C] rounded-full -mt-2 border-2 border-white shadow"></div>
              <div className="absolute right-0 w-6 h-6 bg-[#B91C1C] rounded-full -mt-2 border-2 border-white shadow"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Rooms filter */}
      <div className="bg-white p-4 rounded-lg border">
        <h3 className="font-medium mb-3">Istabu skaits</h3>
        <div className="grid grid-cols-6 gap-2">
          {[1, 2, 3, 4, 5, '+'].map((num) => (
            <button
              key={num}
              onClick={() => handleFilterChange('rooms', num.toString())}
              className={`aspect-square border rounded-md flex items-center justify-center text-sm font-medium transition-colors ${
                filters.rooms === num.toString()
                  ? 'bg-[#00332D] text-white border-[#00332D]'
                  : 'border-gray-300 hover:border-[#00332D] hover:text-[#00332D]'
              }`}
            >
              {num}
            </button>
          ))}
        </div>
      </div>

      {/* New projects */}
      <div className="bg-white p-4 rounded-lg border">
        <h3 className="font-medium mb-3">Projekts</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <input 
              type="checkbox" 
              id="newProjects"
              checked={showNewProjects}
              onChange={(e) => setShowNewProjects(e.target.checked)}
              className="rounded" 
            />
            <label htmlFor="newProjects" className="text-sm">
              Atlasīt tikai jaunos projektus
            </label>
          </div>
        </div>
        
        {/* Dropdown placeholder */}
        <div className="mt-3">
          <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00332D]">
            <option>Visi projekti</option>
          </select>
          <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Area filter */}
      <div className="bg-white p-4 rounded-lg border">
        <h3 className="font-medium mb-3">Platība / m²</h3>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="No"
            value={filters.minArea}
            onChange={(e) => handleFilterChange('minArea', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00332D]"
          />
          <input
            type="number"
            placeholder="Līdz"
            value={filters.maxArea}
            onChange={(e) => handleFilterChange('maxArea', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00332D]"
          />
        </div>
      </div>

      {/* Apply filters button */}
      <button
        onClick={applyFilters}
        className="w-full bg-[#00332D] text-white py-3 rounded-md font-medium hover:bg-[#004940] transition-colors"
      >
        Pielietot filtrus
      </button>
    </div>
  )
}
