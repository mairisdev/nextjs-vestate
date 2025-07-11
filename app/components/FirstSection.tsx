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
  const headline = translations.defaultHeadline;
  const buttonText = translations.defaultButtonText;
  const buttonLink = sectionData?.buttonLink || "#";
  const backgroundImage = sectionData?.backgroundImage || "/default-image.webp";

  return (
    <section
      className="first-section relative w-full min-h-[600px] bg-fixed bg-center bg-cover bg-no-repeat flex items-center justify-end px-6 md:px-12"
      style={{ backgroundImage: `url('${backgroundImage}')` }}
    >
      <div className="bg-[#ffffffcc] text-[#00332D] p-6 md:p-12 w-full md:w-[600px] backdrop-blur-sm rounded-md flex flex-col items-center justify-center text-center">
        <h2 className="text-xl md:text-1xl font-semibold mb-6 whitespace-pre-line">
          {headline}
        </h2>

        <Link
          href={buttonLink}
          className="inline-block bg-[#00332D] text-white font-semibold text-sm px-6 py-4 rounded-md border-2 border-white hover:bg-transparent hover:text-[#00332D] hover:border-[#00332D] transition duration-300 ease-in-out"
        >
          {buttonText}
        </Link>
      </div>
    </section>
  )
}
