"use client"

import { useEffect, useState } from "react"

export default function FirstSection() {
  const [sectionData, setSectionData] = useState<{
    backgroundImage: string | null
    headline: string
    buttonText: string
    buttonLink: string
  }>({
    backgroundImage: null,
    headline: "",
    buttonText: "",
    buttonLink: "",
  })

  useEffect(() => {
    const fetchSectionData = async () => {
      const response = await fetch('/api/first-section')
      const data = await response.json()

      // Pārliecināmies, ka dati tiek ielādēti, pirms tos piekļūstam
      if (data) {
        setSectionData(data)
      }
    }

    fetchSectionData()
  }, [])

  // Pārbaudām, vai attēls ir ielādēts, un ja nav, rādām noklusējuma attēlu
  const backgroundImage = sectionData.backgroundImage
    ? sectionData.backgroundImage
    : "/default-image.webp"

  return (
    <section
      className="relative w-full min-h-[600px] bg-fixed bg-center bg-cover bg-no-repeat flex items-center justify-end px-6 md:px-12"
      style={{ backgroundImage: `url('${backgroundImage}')` }}
    >
      <div className="bg-[#00332D]/90 text-white p-6 md:p-12 w-full md:w-[600px] backdrop-blur-sm rounded-md flex flex-col items-center justify-center text-center">
        <h2 className="text-xl md:text-1xl font-semibold mb-6">
          {sectionData.headline || 'Default Headline'}
        </h2>

        <button className="bg-white text-[#00332D] font-semibold text-sm px-6 py-4 rounded-md border-2 border-white hover:bg-transparent hover:text-white transition duration-300 ease-in-out">
          {sectionData.buttonText || 'Default Button Text'}
        </button>
      </div>
    </section>
  )
}
