import Image from "next/image"
import Link from "next/link"
import { getSevenSection } from "@/lib/queries/sevenSection"
import { getSafeTranslations } from '@/lib/safeTranslations';

export default async function LegalConsultSection2() {
  const data = await getSevenSection()
  const { safe } = await getSafeTranslations('LegalConsultSection2');
     
  // Drošie tulkojumi ar fallback vērtībām
  const translations = {
    defaultTitle: safe('defaultTitle', 'Cik maksā Jūsu īpašums?'),
    defaultButtonText: safe('defaultButtonText', 'Uzzināt vērtību'),
    imageAlt: safe('imageAlt', 'Jurista konsultācija')
  };

  if (!data) return null

return (
  <section className="relative w-full min-h-[600px] flex items-center justify-end px-6 md:px-12 overflow-hidden">
    {/* Background attēls ar vieglāku overlay */}
    <div className="absolute inset-0">
      <Image
        src={data.imageUrl || "/placeholder.jpg"}
        alt={translations.imageAlt}
        fill
        className="object-cover"
        priority
      />
      {/* Vieglāks overlay nekā pirmajā sekcijā */}
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/10 to-black/40"></div>
    </div>
      
    {/* Saturs - atpakaļ labajā pusē */}
    <div className="relative z-10 bg-white/95 backdrop-blur-md text-[#00332D] p-8 md:p-12 w-full md:w-[600px] rounded-2xl shadow-2xl border border-gray-200 flex flex-col items-center justify-center text-center">
      <h2 className="text-xl md:text-2xl font-bold mb-6 whitespace-pre-line text-[#00332D]">
        {translations.defaultTitle}
      </h2>
       
      <Link
        href={data.buttonLink || "#"}
        className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00332D] to-[#00443B] text-white font-semibold text-sm px-8 py-4 rounded-xl hover:from-[#77dDB4] hover:to-[#5BC9A8] transition-all duration-300 transform hover:scale-105 shadow-lg"
      >
        {translations.defaultButtonText}
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  </section>
)

}