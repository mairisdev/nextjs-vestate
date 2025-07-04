import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface Property {
  id: string
  title: string
  price: number
  currency: string
  address: string
  city: string
  district: string | null
  rooms: number | null
  area: number | null
  floor: number | null
  totalFloors: number | null
  status: string
  mainImage: string | null
  category: {
    name: string
    slug: string
  }
}

interface PropertyGridProps {
  properties: Property[]
  currentPage: number
  totalPages: number
  category: string
}

export default function PropertyGrid({ properties, currentPage, totalPages, category }: PropertyGridProps) {
  const formatPrice = (price: number, currency: string) => {
    return `${(price / 100).toLocaleString()} €`
  }

  const getStatusLabel = (status: string) => {
    const statusMap = {
      'AVAILABLE': 'Pieejams',
      'RESERVED': 'Rezervēts', 
      'SOLD': 'Pārdots',
      'RENTED': 'Izīrēts',
      'UNAVAILABLE': 'Nav pieejams'
    }
    return statusMap[status as keyof typeof statusMap] || status
  }

  const getStatusColor = (status: string) => {
    const colorMap = {
      'AVAILABLE': 'bg-green-600',
      'RESERVED': 'bg-yellow-600',
      'SOLD': 'bg-red-600', 
      'RENTED': 'bg-blue-600',
      'UNAVAILABLE': 'bg-gray-600'
    }
    return colorMap[status as keyof typeof colorMap] || 'bg-gray-600'
  }

  return (
    <div className="space-y-6">
      {/* Sort controls */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <span>Kārtot pēc:</span>
          <select className="border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-[#00332D]">
            <option>Datums</option>
            <option>Cena (augošā)</option>
            <option>Cena (dilstošā)</option>
            <option>Platība</option>
          </select>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span>Cena</span>
          <span className="mx-2">|</span>
          <button className="text-[#00332D] font-medium">Sarakst kartē</button>
        </div>
      </div>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => (
          <Link 
            key={property.id} 
            href={`/ipasumi/${category}/${property.id}`}
            className="group"
          >
            <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 group-hover:-translate-y-1">
              {/* Image */}
              <div className="relative h-48 bg-gray-200">
                {property.mainImage ? (
                <img
                    src={`/uploads/properties/${property.mainImage}`}
                    alt={property.title}
                    className="w-full h-full object-cover"
                />
                ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                    Nav attēla
                </div>
                )}
                
                {/* Status badge */}
                <div className={`absolute top-3 left-3 px-2 py-1 rounded text-white text-xs font-medium ${getStatusColor(property.status)}`}>
                  {getStatusLabel(property.status)}
                </div>
                
                {/* Room count badge */}
                {property.rooms && (
                  <div className="absolute top-3 right-3 bg-[#00332D] text-white px-2 py-1 rounded text-xs font-medium">
                    {property.rooms} istaba{property.rooms !== 1 ? 's' : ''}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-[#00332D] transition-colors">
                  {property.title}
                </h3>
                
                <p className="text-sm text-gray-600 mb-2">
                  {property.address}, {property.city}
                  {property.district && `, ${property.district}`}
                </p>

                {/* Property details */}
                <div className="flex items-center space-x-4 text-xs text-gray-500 mb-3">
                  {property.rooms && (
                    <span>{property.rooms}/{property.totalFloors || '?'} stāvs</span>
                  )}
                  {property.area && (
                    <span>{property.area} m²</span>
                  )}
                  {property.floor && property.totalFloors && (
                    <span>{property.floor}/{property.totalFloors} stāvs</span>
                  )}
                </div>

                {/* Price */}
                <div className="flex items-center justify-between">
                  <div className="text-lg font-bold text-[#00332D]">
                    {formatPrice(property.price, property.currency)}
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 pt-8">
          {currentPage > 1 && (
            <Link 
              href={`/ipasumi/${category}?page=${currentPage - 1}`}
              className="flex items-center px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Iepriekšējā
            </Link>
          )}

          <div className="flex space-x-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Link
                key={page}
                href={`/ipasumi/${category}?page=${page}`}
                className={`px-3 py-2 rounded-md transition-colors ${
                  page === currentPage
                    ? 'bg-[#00332D] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {page}
              </Link>
            ))}
          </div>

          {currentPage < totalPages && (
            <Link 
              href={`/ipasumi/${category}?page=${currentPage + 1}`}
              className="flex items-center px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Nākamā
              <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          )}
        </div>
      )}

      {properties.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Nav atrasti īpašumi pēc norādītajiem kritērijiem.</p>
          <p className="text-gray-400 text-sm mt-2">Izmēģiniet mainīt filtrus vai meklēšanas parametrus.</p>
        </div>
      )}
    </div>
  )
}
