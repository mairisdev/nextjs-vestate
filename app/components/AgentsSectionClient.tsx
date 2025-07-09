"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import Image from "next/image"
import ImageModal from "./ImageModal"

export default function AgentsSectionClient({ agents }: { agents: any[] }) {
  const [imageModalOpen, setImageModalOpen] = useState(false)
  const [selectedImageUrl, setSelectedImageUrl] = useState("")

  if (!agents || agents.length === 0) return null

  return (
    <section id="musu-komanda" className="py-20 px-4 md:px-12 bg-[#F3F4F6]">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-[#00332D] mb-12">
          Mūsu aģenti
        </h2>

        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 items-start">
          {agents.map((agent, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl shadow-md flex flex-col overflow-hidden"
            >
              {agent.image && (
                <Image
                  src={agent.image}
                  alt={agent.name || "Aģenta bilde"}
                  width={400}
                  height={300}
                  className="w-full h-[360px] md:h-[300px] object-cover"
                />
              )}

              <div className="p-4 text-[#00332D] flex flex-col justify-between flex-grow">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">{agent.name}</h3>
                  <p className="text-sm">{agent.title}</p>
                  <p className="text-sm text-gray-500 mt-1">{agent.phone}</p>
                </div>

                <div className="mt-auto min-h-[60px]">
                  {agent.reviews.length > 0 ? (
                    <details className="text-sm group">
                      <summary className="cursor-pointer flex items-center gap-2 text-white bg-[#00332D] hover:bg-[#00443B] transition rounded-xl py-2 px-4">
                        Atsauksmes
                        <ChevronDown
                          size={16}
                          className="transition-transform group-open:rotate-180"
                        />
                      </summary>
                      <div className="mt-2 space-y-3 text-gray-700 bg-gray-100 p-3 rounded-md">
                        {agent.reviews.map((review: any, i: number) => (
                          <div key={i} className="text-xs space-y-1">
                            {review.imageUrl && (
                            <div className="space-y-1">
                                <img
                                src={review.imageUrl}
                                alt={review.author}
                                onClick={() => {
                                    setSelectedImageUrl(review.imageUrl)
                                    setImageModalOpen(true)
                                }}
                                className="w-30 h-30 rounded-md object-contain cursor-pointer hover:scale-105 transition"
                                />
                                <p className="text-[12px] text-gray-500 font-semibold mb-4">Spiediet uz attēla, lai to apskatītu</p>
                            </div>
                            )}
                            <p className="text-[13px] text-gray-700">{review.content}</p>
                            <div className="flex justify-between items-center text-[11px] text-gray-500 font-medium">
                              <span>{review.author}</span>
                              <span className="text-[#77D4B4] text-sm">
                                {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </details>
                  ) : (
                    <div className="text-sm text-gray-700 bg-gray-100 p-3 rounded-md">
                      Šobrīd nav atsauksmju.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ImageModal
        open={imageModalOpen}
        imageUrl={selectedImageUrl}
        onClose={() => setImageModalOpen(false)}
      />
    </section>
  )
}
