"use client"

import Link from "next/link"
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
    <div className="bg-[#ffffffcc] text-[#00332D] p-6 md:p-12 w-full md:w-[600px] backdrop-blur-sm rounded-md flex flex-col items-center justify-center text-center">
      <h2 className="text-xl md:text-1xl font-semibold mb-6 whitespace-pre-line">
        {sectionData.headline}
      </h2>

      <Link
            href={sectionData.buttonLink || "#"}
            className="inline-block bg-[#00332D] text-white font-semibold text-sm px-6 py-4 rounded-md border-2 border-white hover:bg-transparent hover:text-[#00332D] hover:border-[#00332D] transition duration-300 ease-in-out"
          >
            {sectionData.buttonText}
          </Link>
    </div>
  </section>
)

}
