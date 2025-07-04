"use client"

import { useEffect, useState } from "react"

export default function FirstSection() {
  const [sectionData, setSectionData] = useState<{
    backgroundImage: string | null
    headline: string
    buttonText: string
    buttonLink: string
  } | null>(null)

  useEffect(() => {
    const fetchSectionData = async () => {
      const response = await fetch('/api/first-section')
      const data = await response.json()

      if (data && (data.headline || data.buttonText || data.backgroundImage)) {
        setSectionData(data)
      } else {
        setSectionData(null)
      }
    }

    fetchSectionData()
  }, [])

  if (!sectionData) return null

  const backgroundImage = sectionData.backgroundImage || "/default-image.webp"

return (
  <section
    className="first-section relative w-full min-h-[600px] bg-fixed bg-center bg-cover bg-no-repeat flex items-center justify-end px-6 md:px-12"
    style={{ backgroundImage: `url('${backgroundImage}')` }}
  >
    <div className="first-section-content bg-[#00332D]/90 text-white p-6 md:p-12 w-full md:w-[600px] backdrop-blur-sm rounded-md flex flex-col items-center justify-center text-center">
      <h2 className="first-section-heading text-xl sm:text-2xl font-semibold mb-6">
        {sectionData.headline}
      </h2>

      <button className="first-section-button bg-white text-[#00332D] font-semibold text-sm sm:text-base px-6 py-4 rounded-md border-2 border-white hover:bg-transparent hover:text-white transition duration-300 ease-in-out">
        {sectionData.buttonText}
      </button>
    </div>
  </section>
)

}
