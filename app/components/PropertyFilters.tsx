'use client'
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

interface Category {
  id: string
  name: string
  slug: string
  _count: { properties: number }
}

export interface PropertyFiltersProps {
  categories: Category[]
  currentCategory: string
  cities?: string[]
  districts?: string[]
  propertyProjects?: string[]
}

export default function PropertyFilters({ categories, currentCategory, cities, districts, propertyProjects }: PropertyFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [filters, setFilters] = useState({
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    rooms: searchParams.getAll("rooms") || [],
    minArea: searchParams.get("minArea") || "",
    maxArea: searchParams.get("maxArea") || "",
    city: searchParams.get("city") || "",
    district: searchParams.get("district") || "",
    propertyProject: searchParams.get("propertyProject") || "",
  })

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleRoomToggle = (room: string) => {
    setFilters((prev) => ({
      ...prev,
      rooms: prev.rooms.includes(room)
        ? prev.rooms.filter((r) => r !== room)
        : [...prev.rooms, room],
    }))
  }

  const applyFilters = () => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((v) => {
          if (v) params.append(key, v)
        })
      } else if (value) {
        params.set(key, value)
      }
    })
    router.push(`/ipasumi/${currentCategory}?${params.toString()}`)
  }

  const clearFilters = () => {
    setFilters({
      minPrice: "",
      maxPrice: "",
      rooms: [],
      minArea: "",
      maxArea: "",
      city: "",
      district: "",
      propertyProject: "",
    })
    router.push(`/ipasumi/${currentCategory}`)
  }

  return (
    <div className="space-y-6 bg-white p-6 rounded-xl shadow border w-full">

      <div className="flex justify-between items-center mb-2">
        <span className="text-lg font-semibold text-[#00332D]">Filtri</span>
        <button
          onClick={clearFilters}
          className="text-xs text-[#B91C1C] hover:underline"
        >
          Notīrīt visus
        </button>
      </div>

      <div className="mb-4">
        <div className="flex items-center space-x-2 mb-2">
          <span className="font-medium">Darījuma veids</span>
        </div>
        <div className="space-y-2 pl-7">
          <div className="flex space-x-2 items-center">
            <input type="checkbox" id="ire" className="rounded" />
            <label htmlFor="ire" className="text-sm">Īrē</label>
          </div>
          <div className="flex space-x-2 items-center">
            <input type="checkbox" id="pirkt" className="rounded" />
            <label htmlFor="pirkt" className="text-sm">Pirkt</label>
          </div>
        </div>
      </div>

      {Array.isArray(cities) && cities.length > 0 && (
        <div className="mb-4">
          <label htmlFor="city" className="block text-sm font-medium mb-1">Pilsēta</label>
          <select
            id="city"
            value={filters.city}
            onChange={(e) => handleFilterChange("city", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#00332D]"
          >
            <option value="">Visas pilsētas</option>
            {cities.map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>
      )}

      {Array.isArray(districts) && districts.length > 0 && (
        <div className="mb-4">
          <label htmlFor="district" className="block text-sm font-medium mb-1">Rajons</label>
          <select
            id="district"
            value={filters.district}
            onChange={(e) => handleFilterChange("district", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#00332D]"
          >
            <option value="">Visi rajoni</option>
            {districts.map((district) => (
              <option key={district} value={district}>{district}</option>
            ))}
          </select>
        </div>
      )}

      {Array.isArray(propertyProjects) && propertyProjects.length > 0 && (
        <div className="mb-4">
          <label htmlFor="propertyProject" className="block text-sm font-medium mb-1">Projekts</label>
          <select
            id="propertyProject"
            value={filters.propertyProject}
            onChange={(e) => handleFilterChange("propertyProject", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#00332D]"
          >
            <option value="">Visi projekti</option>
            {propertyProjects.map((project) => (
              <option key={project} value={project}>{project}</option>
            ))}
          </select>
        </div>
      )}

      <div className="mb-4">
        <h3 className="font-medium mb-2">Cena EUR</h3>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="No"
            value={filters.minPrice}
            onChange={(e) => handleFilterChange("minPrice", e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00332D]"
          />
          <input
            type="number"
            placeholder="Līdz"
            value={filters.maxPrice}
            onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00332D]"
          />
        </div>
      </div>

      <div className="mb-4">
        <h3 className="font-medium mb-2">Istabu skaits</h3>
        <div className="grid grid-cols-6 gap-2">
          {[1, 2, 3, 4, 5, '+'].map((num) => {
            const value = num.toString()
            const isActive = filters.rooms.includes(value)
            return (
              <button
                key={value}
                onClick={() => handleRoomToggle(value)}
                className={`aspect-square border rounded-md flex items-center justify-center text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#00332D] text-white border-[#00332D]'
                    : 'border-gray-300 hover:border-[#00332D] hover:text-[#00332D]'
                }`}
              >
                {value}
              </button>
            )
          })}
        </div>
      </div>

      <div className="mb-4">
        <h3 className="font-medium mb-2">Platība / m²</h3>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="No"
            value={filters.minArea}
            onChange={(e) => handleFilterChange("minArea", e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00332D]"
          />
          <input
            type="number"
            placeholder="Līdz"
            value={filters.maxArea}
            onChange={(e) => handleFilterChange("maxArea", e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00332D]"
          />
        </div>
      </div>

      <button
        onClick={applyFilters}
        className="w-full bg-[#00332D] text-white py-3 rounded-md font-medium hover:bg-[#004940] transition-colors mt-2"
      >
        Pielietot filtrus
      </button>
    </div>
  )
}
