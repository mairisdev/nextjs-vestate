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

export default function ClientGallery({ properties }: { properties: Property[] }) {
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

  return (
    <section id="musu-darbi" className="py-20 px-4 md:px-12 bg-[#F3F4F6]">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-[#00332D] mb-2">
          Karstākie piedāvājumi
        </h2>
        <p className="text-sm text-gray-600 mb-12">
          Atrodi savu sapņu īpašumu jau šodien!
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map((property) => (
            <div
              key={property.id}
              className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl hover:shadow-[#77dDB4]/20 transition-all duration-500 flex flex-col transform hover:-translate-y-2 border border-gray-100 hover:border-[#77dDB4]/50"
            >
              <div className="relative overflow-hidden">
                <Image
                  src={property.images[0]}
                  alt={property.title}
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
                  {property.status === "sold" ? "PĀRDOTS" : "PĀRDOŠANĀ"}
                </span>
                
                {/* Cenas badge */}
                <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm rounded-xl px-3 py-2 shadow-lg border border-[#77dDB4]/30">
                  <p className="text-lg font-bold text-[#00332D]">
                    {property.price} €
                  </p>
                </div>
              </div>
              
              <div className="p-6 flex-1 flex flex-col justify-between text-left">
                <div>
                  <h3 className="text-xl font-bold text-[#00332D] mb-4 group-hover:text-[#00443B] transition-colors">
                    {property.title}
                  </h3>
                  
                  <div className="space-y-3 mb-6">
                    {[property.size, property.type, property.floor].map((text, i) => (
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
                    Apskatīt vairāk
                    <svg className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#77dDB4]/20 to-[#77dDB4]/10 transform scale-x-0 group-hover/btn:scale-x-100 transition-transform duration-300 origin-left"></div>
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="relative bg-gradient-to-br from-[#77dDB4]/10 via-white to-[#77dDB4]/5 border-2 border-[#77dDB4]/30 rounded-2xl p-8 shadow-2xl shadow-[#77dDB4]/20 backdrop-blur-sm">

            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
              <div className="bg-gradient-to-r from-[#77dDB4] to-[#00332D] text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-2xl font-bold text-white">?</span>
              </div>
            </div>
            
            <div className="pt-4">
              <h3 className="text-[#00332D] font-bold text-xl mb-4 leading-tight">
                Jums nepieciešams pārdot nekustamo īpašumu?
              </h3>
              
              <p className="text-[#00332D]/80 font-medium text-lg mb-6 leading-relaxed">
                Noskaidrojiet sava dzīvokļa vai mājas pārdošanas termiņu un cenas jau tūlīt!
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="#kontakti">
                  <button className="group relative bg-gradient-to-r from-[#00332D] to-[#00443B] text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg shadow-[#00332D]/30 hover:shadow-xl hover:shadow-[#00332D]/40 transform hover:scale-105 transition-all duration-300 border-2 border-transparent hover:border-[#77dDB4] overflow-hidden">
                    <span className="relative z-10 flex items-center">
                      Nosūtīt pieteikumu
                      <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-[#77dDB4]/20 to-[#77dDB4]/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                  </button>
                </Link>
                
                <div className="flex items-center text-[#00332D]/70 font-medium">
                  <div className="flex items-center bg-[#77dDB4]/20 px-4 py-2 rounded-lg">
                    <span className="text-[#77dDB4] mr-2">✓</span>
                    Bezmaksas konsultācija
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal */}
        {selected && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-3xl rounded-xl overflow-hidden shadow-xl relative">
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-gray-500 hover:text-black z-50"
              >
                <X size={24} />
              </button>
              <div className="grid md:grid-cols-2">
                <div className="w-full h-[300px] md:h-full relative flex items-center justify-center">
                  <Image
                    src={selected.images[currentImage]}
                    alt={selected.title}
                    fill
                    className="object-cover rounded-l-xl"
                  />
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 p-1 rounded-full hover:bg-white"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 p-1 rounded-full hover:bg-white"
                  >
                    <ChevronRight size={24} />
                  </button>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-[#00332D] mb-2">
                    {selected.title}
                  </h3>
                  <p className="text-lg font-bold text-[#00332D] mb-2">
                    {selected.price} EUR
                  </p>
                  <p className="text-sm text-gray-600 mb-4">
                    <span className="font-semibold">{selected.size}</span> · <span className="font-semibold">{selected.type}</span> · <span className="font-semibold">{selected.floor}</span>
                  </p>
                  <p className="text-sm text-gray-800 mb-6">
                    {selected.description}
                  </p>
                  <button className="bg-[#00332D] text-white px-4 py-2 rounded-md hover:bg-[#00443B]">
                    Sazināties ar mūsu aģentu
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
