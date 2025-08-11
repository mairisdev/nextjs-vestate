"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import Image from "next/image"
import ImageModal from "./ImageModal"

type Translations = {
  reviewsButton: string
  noReviewsText: string
  imageClickHint: string
  agentImageAlt: string
}

interface AgentsSectionClientProps {
  agents: any[]
  translations: Translations
}

export default function AgentsSectionClient({ agents, translations }: AgentsSectionClientProps) {
  const [imageModalOpen, setImageModalOpen] = useState(false)
  const [selectedImageUrl, setSelectedImageUrl] = useState("")

  if (!agents || agents.length === 0) return null

  return (
    <section id="musu-komanda" className="py-20 px-4 md:px-12 bg-[#F3F4F6]">
      <div className="max-w-7xl mx-auto">

        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-[#77D4B4]/10 rounded-full px-6 py-2 mb-4">
            <div className="w-2 h-2 bg-[#77D4B4] rounded-full animate-pulse"></div>
            <p className="text-sm font-semibold uppercase text-[#77D4B4]">
              Pieredzes un profesionalitātes apvienojums
            </p>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#00332D] mb-4">
            MŪSU LABĀKIE SPECIĀLISTI
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-[#77D4B4] to-[#5BC9A8] mx-auto rounded-full"></div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 items-start">
          {agents.map((agent, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl shadow-md flex flex-col overflow-hidden"
            >
              {agent.image && (
                <Image
                  src={agent.image}
                  alt={translations.agentImageAlt}
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
                        {translations.reviewsButton}
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
                                <p className="text-[12px] text-gray-500 font-semibold mb-4">
                                  {translations.imageClickHint}
                                </p>
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
                      {translations.noReviewsText}
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
