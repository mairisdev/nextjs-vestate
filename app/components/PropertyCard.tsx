"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { Eye, MapPin, Home, Maximize, User, Lock } from "lucide-react"
import PrivateAccessModal from "./PrivateAccessModal"

interface PropertyCardProps {
  property: {
    id: string
    title: string
    price: number
    currency: string
    address: string
    city: string
    rooms: number | null
    area: number | null
    mainImage: string | null
    visibility: 'public' | 'private'
    category: {
      name: string
      slug: string
    }
    agent?: {
      firstName: string
      lastName: string
    } | null
  }
  hasAccess?: boolean // Vai lietotājam ir piekļuve privātajiem
}

export default function PropertyCard({ property, hasAccess = false }: PropertyCardProps) {
  const [showModal, setShowModal] = useState(false)
  
  const isPrivate = property.visibility === 'private'
  const canView = !isPrivate || hasAccess

  const formatPrice = (price: number, currency: string) => {
    return `${(price / 100).toLocaleString()} ${currency}`
  }

  const handleCardClick = () => {
    if (canView) {
      // Redirect to property page
      window.location.href = `/ipasumi/${property.category.slug}/${property.id}`
    } else {
      // Show access modal
      setShowModal(true)
    }
  }

  return (
    <>
      <div 
        className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer group ${
          isPrivate && !hasAccess ? 'opacity-60 hover:opacity-80' : ''
        }`}
        onClick={handleCardClick}
      >
        {/* Attēls */}
        <div className="relative h-48 overflow-hidden">
          <Image
            src={property.mainImage || "/placeholder-property.jpg"}
            alt={property.title}
            fill
            className={`object-cover group-hover:scale-105 transition-transform duration-300 ${
              isPrivate && !hasAccess ? 'filter blur-sm' : ''
            }`}
          />
          
          {/* Privāta sludinājuma badge */}
          {isPrivate && (
            <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
              <Lock className="w-3 h-3" />
              Privāts
            </div>
          )}
          
          {/* Cena */}
          <div className="absolute bottom-3 left-3 bg-[#00332D] text-white px-3 py-1 rounded-lg font-bold">
            {isPrivate && !hasAccess ? "***" : formatPrice(property.price, property.currency)}
          </div>
        </div>

        {/* Saturs */}
        <div className="p-4">
          <h3 className="font-bold text-lg text-[#00332D] mb-2 line-clamp-1">
            {isPrivate && !hasAccess ? "*** Privāts sludinājums ***" : property.title}
          </h3>
          
          <div className="flex items-center text-gray-600 mb-3">
            <MapPin className="w-4 h-4 mr-1" />
            <span className="text-sm">
              {isPrivate && !hasAccess ? "***" : `${property.address}, ${property.city}`}
            </span>
          </div>

          {/* Informācija */}
          <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
            {property.rooms && (
              <div className="flex items-center">
                <Home className="w-4 h-4 mr-1" />
                <span>{isPrivate && !hasAccess ? "***" : `${property.rooms} ist.`}</span>
              </div>
            )}
            
            {property.area && (
              <div className="flex items-center">
                <Maximize className="w-4 h-4 mr-1" />
                <span>{isPrivate && !hasAccess ? "***" : `${property.area}m²`}</span>
              </div>
            )}
            
            {property.agent && (
              <div className="flex items-center">
                <User className="w-4 h-4 mr-1" />
                <span className="text-xs">
                  {isPrivate && !hasAccess 
                    ? "***" 
                    : `${property.agent.firstName} ${property.agent.lastName}`
                  }
                </span>
              </div>
            )}
          </div>

          {/* Darbība poga */}
          {isPrivate && !hasAccess ? (
            <button 
              onClick={(e) => {
                e.stopPropagation()
                setShowModal(true)
              }}
              className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              Skatīt vairāk
            </button>
          ) : (
            <button className="w-full bg-[#00332D] hover:bg-[#004d42] text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
              <Eye className="w-4 h-4" />
              Skatīt detaļas
            </button>
          )}
        </div>
      </div>

      {/* Privātās piekļuves modals */}
      {showModal && (
        <PrivateAccessModal 
          onClose={() => setShowModal(false)}
          propertyId={property.id}
        />
      )}
    </>
  )
}