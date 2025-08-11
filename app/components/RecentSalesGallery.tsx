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

        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-[#77D4B4]/10 rounded-full px-6 py-2 mb-4">
            <div className="w-2 h-2 bg-[#77D4B4] rounded-full animate-pulse"></div>
            <p className="text-sm font-semibold uppercase text-[#77D4B4]">
              {translations.defaultSubheading || "Apskatieties mūsu veiksmīgi pārdotos īpašumus"}
            </p>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#00332D] mb-4">
            {translations.defaultHeading || "Mūsu darbi"}
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-[#77D4B4] to-[#5BC9A8] mx-auto rounded-full"></div>
        </div>

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
                    <span><strong>Cena:</strong> {property.price || "Nav norādīta"}€</span>
                    <span><strong>Platība:</strong> {property.size || "Nav norādīta"} m2</span>
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

        {/* Modal - samazināts izmērs */}
        {selected && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden relative shadow-2xl">
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 z-20 bg-black/20 backdrop-blur-md rounded-full p-2 hover:bg-black/30 transition-all duration-300 text-white hover:scale-110"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Attēla sekcija - samazināts augstums */}
              <div className="relative h-[50vh] min-h-[300px]">
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
                        fill
                        className="object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = "/placeholder.jpg"
                        }}
                      />
                    )
                  } else {
                    return (
                      <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-3">
                            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <p className="text-gray-500">Nav pieejami attēli</p>
                        </div>
                      </div>
                    )
                  }
                })()}
                
                {/* Tumšs overlay apakšā */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent h-20"></div>
                
                {/* Navigation arrows - mazākas */}
                {(() => {
                  const validModalImages = Array.isArray(selected.images) 
                    ? selected.images.filter(img => isValidImage(img)) 
                    : []
                  
                  if (validModalImages.length > 1) {
                    return (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-md rounded-full p-3 hover:bg-white/20 transition-all duration-300 text-white hover:scale-110 border border-white/20"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-md rounded-full p-3 hover:bg-white/20 transition-all duration-300 text-white hover:scale-110 border border-white/20"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </>
                    )
                  }
                  return null
                })()}
                
                {/* Indicators - mazāki */}
                {(() => {
                  const validModalImages = Array.isArray(selected.images) 
                    ? selected.images.filter(img => isValidImage(img)) 
                    : []
                  
                  if (validModalImages.length > 1) {
                    return (
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                        {validModalImages.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCurrentImage(idx)}
                            className={`w-2 h-2 rounded-full transition-all duration-300 border ${
                              idx === currentImage 
                                ? "bg-white border-white" 
                                : "bg-transparent border-white/60 hover:border-white"
                            }`}
                          />
                        ))}
                      </div>
                    )
                  }
                  return null
                })()}

                {/* Status badge - mazāks */}
                <div className="absolute top-4 left-4 z-10">
                  <span className={`text-white text-xs font-bold px-3 py-1 rounded-full shadow-xl backdrop-blur-md border ${
                    selected.status === "sold" 
                      ? "bg-red-500/80 border-red-300/50" 
                      : "bg-[#77dDB4]/80 border-[#77dDB4]/50"
                  }`}>
                    {selected.status === "sold" 
                      ? (translations.statusSold || "Pārdots")
                      : (translations.statusActive || "Pārdošanā")
                    }
                  </span>
                </div>
              </div>

              {/* Satura sekcija - kompaktāka */}
              <div className="max-h-[40vh] overflow-y-auto">
                <div className="p-6">
<div className="pb-6 mb-6 border-b border-gray-200">
  <div className="text-center">
    <h3 className="text-3xl font-bold text-[#00332D] mb-4 leading-tight">
      {selected.title || "Īpašums"}
    </h3>
    
    <div className="inline-flex items-center gap-4 bg-gradient-to-r from-[#77dDB4]/10 to-[#5BC9A8]/10 rounded-2xl px-6 py-4 border border-[#77dDB4]/20">
      <div className="text-center">
        <p className="text-sm font-medium text-gray-600 mb-1">Piedāvājuma cena</p>
        <p className="text-2xl font-bold text-[#00332D]">
          {selected.price || "Nav norādīta"}€
        </p>
      </div>
    </div>
  </div>
</div>
                  
                  {/* Property details - kompaktāks */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                      <div className="text-lg font-bold text-[#00332D] mb-1">
                        {selected.size || "—"} m2
                      </div>
                      <div className="text-xs text-gray-600">Platība</div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                      <div className="text-lg font-bold text-[#00332D] mb-1">
                        {selected.type || "—"}
                      </div>
                      <div className="text-xs text-gray-600">Tips</div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                      <div className="text-lg font-bold text-[#00332D] mb-1">
                        {selected.floor || "—"}
                      </div>
                      <div className="text-xs text-gray-600">Stāvs</div>
                    </div>
                  </div>
                  
                  {/* Apraksts - kompaktāks */}
                  {selected.description && selected.description.trim() !== "" && (
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-[#00332D] mb-3">Apraksts</h4>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {selected.description}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* Action buttons - kompaktākas */}
                  <div className="flex gap-3">
                    <button
                      onClick={closeModal}
                      className="flex-1 bg-gray-100 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-200 transition-all duration-300"
                    >
                      {translations.modalCloseButton || "Aizvērt"}
                    </button>
                    {selected.link && selected.link !== "#" && (
                      <button
                        onClick={() => window.open(selected.link, '_blank')}
                        className="flex-1 bg-gradient-to-r from-[#00332D] to-[#00443B] text-white font-semibold py-3 rounded-xl hover:shadow-xl hover:shadow-[#00332D]/30 transition-all duration-300 transform hover:scale-105"
                      >
                        Skatīt sludinājumu
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}