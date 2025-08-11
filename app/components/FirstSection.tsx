"use client"

import Link from "next/link"

type SectionData = {
  backgroundImage: string | null
  headline: string
  buttonText: string
  buttonLink: string
} | null

type Translations = {
  defaultHeadline: string
  defaultButtonText: string
}

interface FirstSectionClientProps {
  sectionData: SectionData
  translations: Translations
}

export default function FirstSectionClient({ sectionData, translations }: FirstSectionClientProps) {
  // Ja nav datu un nav tulkojumu, nerādām sekciju
  if (!sectionData && (!translations.defaultHeadline || !translations.defaultButtonText)) {
    return null;
  }

  // Izmantojam vai nu datus no API, vai tulkojumus kā fallback
  const headline = translations.defaultHeadline || sectionData?.headline || "";
  const buttonText = translations.defaultButtonText || sectionData?.buttonText || "";  
  const buttonLink = sectionData?.buttonLink || "#";
  const backgroundImage = sectionData?.backgroundImage || "/default-image.webp";

  return (
    <section
      className="first-section relative w-full min-h-[600px] bg-fixed bg-center bg-cover bg-no-repeat flex items-center justify-end px-6 md:px-12"
      style={{ backgroundImage: `url('${backgroundImage}')` }}
    >
      {/* Tumšāks gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20 z-0" />
      
      {/* Papildu tumšs overlay tikai labajā pusē kur ir teksts */}
      <div className="absolute top-0 right-0 bottom-0 w-full md:w-2/3 bg-gradient-to-l from-black/60 via-black/20 to-transparent z-10" />
        
      <div className="relative z-10 bg-white/95 backdrop-blur-md text-[#00332D] p-8 md:p-12 w-full md:w-[600px] rounded-2xl shadow-2xl border border-gray-200 flex flex-col items-center justify-center text-center">
        <h2 className="text-xl md:text-2xl font-bold mb-6 whitespace-pre-line leading-tight">
          {headline}
        </h2>
         
        <Link
          href={buttonLink}
          className="inline-block bg-[#00332D] text-white font-semibold text-sm px-8 py-4 rounded-xl border-2 border-[#00332D] hover:bg-[#77dDB4] hover:border-[#77dDB4] hover:text-white transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg"
        >
          {buttonText}
        </Link>
      </div>
    </section>
  )
}
