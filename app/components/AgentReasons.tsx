"use client"

import Image from "next/image"

type AgentReasonsData = {
  heading: string
  imageUrl: string
  reasons: string[]
} | null

type Translations = {
  defaultHeading: string
  defaultImageAlt: string
  reason1: string
  reason2: string
  reason3: string
  reason4: string
  reason5: string
  reason6: string
  reason7: string
  reason8: string
  reason9: string
  reason10: string
  reason11: string
}

interface AgentReasonsClientProps {
  data: AgentReasonsData
  translations: Translations
}

export default function AgentReasonsClient({ data, translations }: AgentReasonsClientProps) {
  if (!translations.defaultHeading) {
    return null;
  }

  const heading = translations.defaultHeading;
  const imageUrl = data?.imageUrl || "/default-agent-image.webp";
  
  const reasonKeys = Array.from({ length: 20 }, (_, i) => `reason${i + 1}`);
  const reasons = reasonKeys
    .map(key => translations[key as keyof Translations])
    .filter(reason => reason && reason.trim() !== '');  

  if (reasons.length === 0) return null;

  const leftList = reasons.slice(0, Math.ceil(reasons.length / 2));
  const rightList = reasons.slice(Math.ceil(reasons.length / 2));

  return (
    <section className="bg-[#F3F4F6] py-8 px-4 sm:py-16 sm:px-12">
      <div className="max-w-[1600px] mx-auto">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-[#00332D] mb-8 sm:mb-12 text-center lg:text-left whitespace-pre-line">
          {heading}
        </h2>

        <div className="flex flex-col items-center lg:flex-row gap-12">
          <div className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8 text-sm text-[#00332D]">
              {[leftList, rightList].map((list, listIdx) => (
                <ul key={listIdx} className="space-y-8">
                  {list.map((text, idx) => {
                    const number = listIdx === 0 ? idx + 1 : idx + 1 + leftList.length
                    return (
                      <li key={number} className="flex items-center gap-4">
                        <div className="w-9 h-9 flex items-center justify-center border-2 border-[#77D4B4] rounded-full text-[#77D4B4] font-bold text-base shrink-0">
                          {number}.
                        </div>
                        <p className="text-base leading-relaxed">{text}</p>
                      </li>
                    )
                  })}
                </ul>
              ))}
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center">
            <Image
              src={imageUrl}
              alt={translations.defaultImageAlt || "Mākleris nodod atslēgas"}
              width={700}
              height={700}
              className="w-full h-auto rounded-md object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  )
}