
"use client"

import Image from "next/image"
import { useState } from "react"
import { X, ChevronLeft, ChevronRight } from "lucide-react"

type Property = {
  title: string
  price: string
  size: string
  type: string
  floor: string
  description: string
  images: string[]
  status: "sold" | "active"
}

type Props = {
  property: Property
  onClose: () => void
}

const properties = [
  {
    title: "3 istabu dzīvoklis Salaspilī",
    price: "€75 800",
    size: "77m2",
    type: "103 sērija",
    floor: "4 stāvs",
    description: "Plašs un saulains dzīvoklis ar balkonu un zaļu apkārtni.",
    images: [
      "/recent-sales/Salaspils1.webp",
      "/recent-sales/Salaspils2.webp",
      "/recent-sales/Salaspils3.webp",
    ],
    status: "sold"
  },
  {
    title: "2 istabu dzīvoklis Sarkandaugavā",
    price: "€37 700",
    size: "45m2",
    type: "Hruščova sērija",
    floor: "3 stāvs",
    description: "Renovēts dzīvoklis ar ērtu plānojumu un labu sabiedrisko transportu.",
    images: [
      "/recent-sales/Sarkandaugava1.webp",
      "/recent-sales/Sarkandaugava2.webp",
    ],
    status: "sold"
  },
  {
    title: "Puse no mājas Dārzciemā",
    price: "€78 000",
    size: "85m2",
    type: "Zeme 900m2",
    floor: "4 istabas",
    description: "Privātmājas daļa ar dārzu klusā rajonā.",
    images: [
      "/recent-sales/Darzciems1.webp",
      "/recent-sales/Darzciems2.webp",
    ],
    status: "active"
  },
]

export default function RecentSales() {
  const [selected, setSelected] = useState<typeof properties[0] | null>(null)
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
    setCurrentImage((prev) =>
      prev === 0 ? selected.images.length - 1 : prev - 1
    )
  }

  return (
    <section className="py-20 px-4 md:px-12 bg-[#F3F4F6]">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-[#00332D] mb-2">
          Mūsu nesen pārdotie īpašumi
        </h2>
        <p className="text-sm text-gray-600 mb-12">
          Veiksmīgi īpašumu pārdošanas piemēri
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map((property, idx) => (
            <div
              key={idx}
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

                {property.status === "sold" && (
                  <span className="absolute top-2 left-2 bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md">
                    PĀRDOTS
                  </span>
                )}
                {property.status === "active" && (
                  <span className="absolute top-2 left-2 bg-green-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md">
                    PĀRDOŠANĀ
                  </span>
                )}
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between text-left">
                <h3 className="text-lg font-semibold text-[#00332D] mb-2">
                  {property.title}
                </h3>
                <p className="text-xl font-bold text-[#00332D] mb-2">
                  {property.price}
                </p>
                <ul className="text-sm text-gray-700 space-y-1 mb-4">
                  <li>{property.size}</li>
                  <li>{property.type}</li>
                  <li>{property.floor}</li>
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

        {/* Popup Modal */}
        {selected && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-3xl rounded-xl overflow-hidden shadow-xl relative">
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-gray-500 hover:text-black"
              >
                <X size={24} />
              </button>
              <div className="grid md:grid-cols-2">
                {/* Gallery with arrows */}
                <div className="w-full h-[300px] md:h-full relative flex items-center justify-center">
                  <Image
                    src={selected.images[currentImage]}
                    alt={selected.title + " image"}
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

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-[#00332D] mb-2">
                    {selected.title}
                  </h3>
                  <p className="text-lg font-bold text-[#00332D] mb-2">
                    {selected.price}
                  </p>
                  <p className="text-sm text-gray-600 mb-4">
                    {selected.size} · {selected.type} · {selected.floor}
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
