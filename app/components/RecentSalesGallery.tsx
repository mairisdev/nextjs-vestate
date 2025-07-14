"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import Link from "next/link"

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
    if (!selected) return
    setCurrentImage((prev) => (prev + 1) % selected.images.length)
  }

  const prevImage = () => {
    if (!selected) return
    setCurrentImage((prev) => (prev === 0 ? selected.images.length - 1 : prev - 1))
  }

  if (!properties || properties.length === 0) {
    return (
      <section id="musu-darbi" className="py-20 px-4 md:px-12 bg-[#F3F4F6]">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-[#00332D] mb-2">
            {translations.defaultHeading}
          </h2>
          <p className="text-sm text-gray-600 mb-12">
            {translations.noPropertiesText}
          </p>
        </div>
      </section>
    )
  }

  return (
    <section id="musu-darbi" className="py-20 px-4 md:px-12 bg-[#F3F4F6]">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-[#00332D] mb-2">
          {translations.defaultHeading}
        </h2>
        <p className="text-sm text-gray-600 mb-12">
          {translations.defaultSubheading}
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map((property, idx) => (
            <div
              key={property.id}
              className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl hover:shadow-[#77dDB4]/20 transition-all duration-500 flex flex-col transform hover:-translate-y-2 border border-gray-100 hover:border-[#77dDB4]/50"
            >
              <div className="relative overflow-hidden">
                <Image
                  src={property.images[0]}
                  alt={translations[`property${idx + 1}Title`] || property.title}
                  width={600}
                  height={400}
                  className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className={`absolute top-3 left-3 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg backdrop-blur-sm border-2 ${
                  property.status === "sold" 
                    ? "bg-red-500/90 border-red-300/50" 
                    : "bg-[#77dDB4]/90 border-[#77dDB4]/50"
                }`}>
                  {property.status === "sold" ? translations.statusSold : translations.statusActive}
                </span>
                
                {/* Cenas badge */}
                <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm rounded-xl px-3 py-2 shadow-lg border border-[#77dDB4]/30">
                  <p className="text-lg font-bold text-[#00332D]">
                    {translations[`property${idx + 1}Price`] || property.price} €
                  </p>
                </div>
              </div>
              
              <div className="p-6 flex-1 flex flex-col justify-between text-left">
                <div>
                  <h3 className="text-xl font-bold text-[#00332D] mb-4 group-hover:text-[#00443B] transition-colors">
                    {translations[`property${idx + 1}Title`] || property.title}
                  </h3>
                  
                  <div className="space-y-3 mb-6">
                    {[
                      translations[`property${idx + 1}Size`] || property.size,
                      translations[`property${idx + 1}Type`] || property.type,
                      translations[`property${idx + 1}Floor`] || property.floor
                    ].map((text, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#77dDB4] to-[#00332D] flex-shrink-0"></div>
                        <span className="text-base text-gray-700 font-medium">{text}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <button
                  onClick={() => setSelected(property)}
                  className="group/btn relative bg-gradient-to-r from-[#00332D] to-[#00443B] text-white font-semibold px-6 py-3 rounded-xl shadow-lg shadow-[#00332D]/20 hover:shadow-xl hover:shadow-[#00332D]/30 transition-all duration-300 transform hover:scale-105 border-2 border-transparent hover:border-[#77dDB4] overflow-hidden"
                >
                  <span className="relative z-10 flex items-center justify-center">
                    {translations.viewMoreButton}
                    <svg className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#77dDB4] to-[#5BC9A8] opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                </button>
              </div>
            </div>
          ))}
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
                <Image
                  src={selected.images[currentImage]}
                  alt={selected.title}
                  width={800}
                  height={600}
                  className="w-full h-96 object-cover rounded-t-2xl"
                />
                
                {selected.images.length > 1 && (
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
                )}
                
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {selected.images.map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-2 h-2 rounded-full transition-all ${
                        idx === currentImage ? "bg-white" : "bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="p-8">
                <h3 className="text-3xl font-bold text-[#00332D] mb-4">
                  {selected.title}
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-600 mb-1">Cena</p>
                    <p className="text-lg font-bold text-[#00332D]">{selected.price} €</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-600 mb-1">Platība</p>
                    <p className="text-lg font-bold text-[#00332D]">{selected.size}</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-600 mb-1">Tips</p>
                    <p className="text-lg font-bold text-[#00332D]">{selected.type}</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-600 mb-1">Stāvs</p>
                    <p className="text-lg font-bold text-[#00332D]">{selected.floor}</p>
                  </div>
                </div>

                {selected.description && (
                  <div className="mb-6">
                    <h4 className="text-xl font-semibold text-[#00332D] mb-3">Apraksts</h4>
                    <p className="text-gray-700 leading-relaxed">{selected.description}</p>
                  </div>
                )}

                <div className="flex gap-4">
                  <Link
                    href={selected.link}
                    className="flex-1 bg-gradient-to-r from-[#00332D] to-[#00443B] text-white text-center font-semibold py-4 px-6 rounded-xl hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    Apskatīt pilnu informāciju
                  </Link>
                  <button
                    onClick={closeModal}
                    className="px-6 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-[#77dDB4] hover:text-[#00332D] transition-colors"
                  >
                    {translations.modalCloseButton}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
