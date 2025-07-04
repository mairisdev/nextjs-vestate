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
          Mūsu nesen pārdotie īpašumi
        </h2>
        <p className="text-sm text-gray-600 mb-12">
          Veiksmīgi īpašumu pārdošanas piemēri
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map((property) => (
            <div
              key={property.id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition duration-300 flex flex-col"
            >
              <div className="relative">
                <Image
                  src={property.images[0]}
                  alt={property.title}
                  width={600}
                  height={400}
                  className="w-full h-56 object-cover"
                />
                <span className={`absolute top-2 left-2 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md ${
                  property.status === "sold" ? "bg-red-600" : "bg-green-500"
                }`}>
                  {property.status === "sold" ? "PĀRDOTS" : "PĀRDOŠANĀ"}
                </span>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between text-left">
                <h3 className="text-lg font-semibold text-[#00332D] mb-1">
                  {property.title}
                </h3>
                <p className="text-xl font-bold text-[#00332D] mb-3">
                  {property.price} €
                </p>
                <ul className="text-sm text-gray-700 space-y-1 mb-4">
                  {[property.size, property.type, property.floor].map((text, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00332D] inline-block"></span>
                      <span className="text-base">{text}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => setSelected(property)}
                  className="mt-auto inline-block bg-[#00332D] text-white text-sm px-5 py-3 rounded-xl hover:bg-[#00443B] transition"
                >
                  Apskatīt vairāk
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Box */}
        <div className="mt-16 text-center">
          <p className="text-[#00332D] font-semibold text-md">
            <span className="inline-block text-blue-600 mr-2">ℹ</span>
            Jums nepieciešams pārdot nekustamo īpašumu?
          </p>
          <p className="text-[#00332D] font-semibold text-md mt-2">
            Noskaidrojiet sava dzīvokļa vai mājas pārdošanas termiņu un cenas jau tūlīt!
          </p>
          <button className="mt-6 bg-[#00332D] text-white px-6 py-3 rounded-md hover:bg-[#00443B]">
            Nosūtīt pieteikumu
          </button>
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
