// app/components/RecentSalesGallery.tsx
"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, X } from "lucide-react"

export type Property = {
  id: string
  title: string
  price: string
  size: string
  type: string
  floor: string
  description: string
  link: string
  status: "sold" | "active"
  images: string[]
}

interface ClientGalleryProps {
  properties: Property[]
  translations: {
    defaultHeading: string
    defaultSubheading: string
    statusSold: string
    statusActive: string
    viewMoreButton: string
    modalCloseButton: string
    noPropertiesText: string
    [key: string]: string
  }
}

export default function ClientGallery({ properties, translations }: ClientGalleryProps) {
  const [selected, setSelected] = useState<Property | null>(null)
  const [currentImage, setCurrentImage] = useState(0)

  const closeModal = () => {
    setSelected(null)
    setCurrentImage(0)
  }

  const nextImage = () => {
    if (!selected || !selected.images || selected.images.length === 0) return
    setCurrentImage((prev) => (prev + 1) % selected.images.length)
  }

  const prevImage = () => {
    if (!selected || !selected.images || selected.images.length === 0) return
    setCurrentImage((prev) => (prev === 0 ? selected.images.length - 1 : prev - 1))
  }

  // Funkcija drošai attēla src pārbaudei
  const getImageSrc = (imageUrl: string | undefined | null): string => {
    if (!imageUrl || imageUrl.trim() === "" || imageUrl === "{}") {
      return "/placeholder.jpg" // Fallback attēls
    }
    return imageUrl
  }

  // Funkcija pārbaudīt vai attēls ir derīgs
  const isValidImage = (imageUrl: string | undefined | null): boolean => {
    return !!(imageUrl && imageUrl.trim() !== "" && imageUrl !== "{}")
  }

  // Drošas pārbaudes properties masīvam
  const safeProperties = Array.isArray(properties) ? properties : []

  if (safeProperties.length === 0) {
    return (
      <section id="musu-darbi" className="py-20 px-4 md:px-12 bg-[#F3F4F6]">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-[#00332D] mb-2">
            {translations.defaultHeading || "Mūsu darbi"}
          </h2>
          <p className="text-sm text-gray-600 mb-12">
            {translations.noPropertiesText || "Pagaidām nav pārdoto īpašumu"}
          </p>
        </div>
      </section>
    )
  }

  return (
    <section id="musu-darbi" className="py-20 px-4 md:px-12 bg-[#F3F4F6]">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-[#00332D] mb-2">
          {translations.defaultHeading || "Mūsu darbi"}
        </h2>
        <p className="text-sm text-gray-600 mb-12">
          {translations.defaultSubheading || "Apskatieties mūsu veiksmīgi pārdotos īpašumus"}
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {safeProperties.map((property, idx) => {
            // Drošas pārbaudes attēliem
            const validImages = Array.isArray(property.images) 
              ? property.images.filter(img => isValidImage(img)) 
              : []
            const mainImageUrl = validImages.length > 0 ? validImages[0] : null
            
            return (
              <div
                key={property.id || idx}
                className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl hover:shadow-[#77dDB4]/20 transition-all duration-500 flex flex-col transform hover:-translate-y-2 border border-gray-100 hover:border-[#77dDB4]/50"
              >
                <div className="relative overflow-hidden">
                  {/* Drošs attēla renderēšana */}
                  {isValidImage(mainImageUrl) ? (
                    <Image
                      src={getImageSrc(mainImageUrl)}
                      alt={translations[`property${idx + 1}Title`] || property.title || "Īpašums"}
                      width={600}
                      height={400}
                      className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        // Fallback ja attēls neielādējas
                        const target = e.target as HTMLImageElement
                        target.src = "/placeholder.jpg"
                      }}
                    />
                  ) : (
                    // Ja nav derīga attēla, rādām placeholder
                    <div className="w-full h-56 bg-gray-200 flex items-center justify-center">
                      <p className="text-gray-500 text-sm">Nav attēla</p>
                    </div>
                  )}
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className={`absolute top-3 left-3 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg backdrop-blur-sm border-2 ${
                    property.status === "sold" 
                      ? "bg-red-500/90 border-red-300/50" 
                      : "bg-[#77dDB4]/90 border-[#77dDB4]/50"
                  }`}>
                    {property.status === "sold" 
                      ? (translations.statusSold || "Pārdots")
                      : (translations.statusActive || "Pārdošanā")
                    }
                  </span>
                </div>
                
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold text-[#00332D] mb-2 line-clamp-2">
                    {translations[`property${idx + 1}Title`] || property.title || "Īpašums"}
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-4 flex-1">
                    <span><strong>Cena:</strong> {property.price || "Nav norādīta"}</span>
                    <span><strong>Platība:</strong> {property.size || "Nav norādīta"}</span>
                    <span><strong>Tips:</strong> {property.type || "Nav norādīts"}</span>
                    <span><strong>Stāvs:</strong> {property.floor || "Nav norādīts"}</span>
                  </div>
                  
                  <button
                    onClick={() => setSelected(property)}
                    className="group/btn relative bg-gradient-to-r from-[#00332D] to-[#00443B] text-white font-semibold px-6 py-3 rounded-xl shadow-lg shadow-[#00332D]/20 hover:shadow-xl hover:shadow-[#00332D]/30 transition-all duration-300 transform hover:scale-105 border-2 border-transparent hover:border-[#77dDB4] overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center justify-center">
                      {translations.viewMoreButton || "Skatīt vairāk"}
                      <svg className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-[#77dDB4] to-[#5BC9A8] opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Modal */}
        {selected && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors shadow-lg"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>

              <div className="relative">
                {/* Drošas pārbaudes modāla attēliem */}
                {(() => {
                  const validModalImages = Array.isArray(selected.images) 
                    ? selected.images.filter(img => isValidImage(img)) 
                    : []
                  
                  const currentModalImage = validModalImages[currentImage]
                  
                  if (isValidImage(currentModalImage)) {
                    return (
                      <Image
                        src={getImageSrc(currentModalImage)}
                        alt={selected.title || "Īpašums"}
                        width={800}
                        height={600}
                        className="w-full h-96 object-cover rounded-t-2xl"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = "/placeholder.jpg"
                        }}
                      />
                    )
                  } else {
                    return (
                      <div className="w-full h-96 bg-gray-200 rounded-t-2xl flex items-center justify-center">
                        <p className="text-gray-500">Nav pieejami attēli</p>
                      </div>
                    )
                  }
                })()}
                
                {/* Navigation arrows - rādām tikai ja ir vairāki derīgi attēli */}
                {(() => {
                  const validModalImages = Array.isArray(selected.images) 
                    ? selected.images.filter(img => isValidImage(img)) 
                    : []
                  
                  if (validModalImages.length > 1) {
                    return (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-full p-3 hover:bg-white transition-colors shadow-lg"
                        >
                          <ChevronLeft className="w-6 h-6 text-gray-600" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-full p-3 hover:bg-white transition-colors shadow-lg"
                        >
                          <ChevronRight className="w-6 h-6 text-gray-600" />
                        </button>
                      </>
                    )
                  }
                  return null
                })()}
                
                {/* Image indicators */}
                {(() => {
                  const validModalImages = Array.isArray(selected.images) 
                    ? selected.images.filter(img => isValidImage(img)) 
                    : []
                  
                  if (validModalImages.length > 1) {
                    return (
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                        {validModalImages.map((_, idx) => (
                          <div
                            key={idx}
                            className={`w-2 h-2 rounded-full transition-all ${
                              idx === currentImage ? "bg-white" : "bg-white/50"
                            }`}
                          />
                        ))}
                      </div>
                    )
                  }
                  return null
                })()}
              </div>

              <div className="p-6">
                <h3 className="text-2xl font-bold text-[#00332D] mb-4">
                  {selected.title || "Īpašums"}
                </h3>
                
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2 text-sm">
                    <p><strong>Cena:</strong> {selected.price || "Nav norādīta"}</p>
                    <p><strong>Platība:</strong> {selected.size || "Nav norādīta"}</p>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p><strong>Tips:</strong> {selected.type || "Nav norādīts"}</p>
                    <p><strong>Stāvs:</strong> {selected.floor || "Nav norādīts"}</p>
                  </div>
                </div>
                
                {selected.description && selected.description.trim() !== "" && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-[#00332D] mb-2">Apraksts:</h4>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {selected.description}
                    </p>
                  </div>
                )}
                
                <button
                  onClick={closeModal}
                  className="w-full bg-[#00332D] text-white font-semibold py-3 rounded-xl hover:bg-[#00443B] transition-colors"
                >
                  {translations.modalCloseButton || "Aizvērt"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}