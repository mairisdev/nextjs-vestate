import Image from "next/image"
import { getPartnersSection } from "@/lib/queries/partners"

export default async function PartnersSection() {
  const data = await getPartnersSection()

  if (!data) return null

  // Drošs parse
  let partners: { name: string; logoUrl: string; order: number }[] = []

  try {
    partners = Array.isArray(data.partners) ? data.partners : JSON.parse(data.partners as string)
  } catch (err) {
    console.error("Kļūda parsējot partnerus:", err)
  }

  if (!partners || partners.length === 0) return null

  return (
<section className="py-16 sm:py-20 px-4 sm:px-8 md:px-12 bg-gradient-to-br from-[#F3F4F6] via-white to-[#F3F4F6] relative overflow-hidden">
  {/* Dekoratīvi background elementi */}
  <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-[#77dDB4]/10 to-transparent rounded-full blur-3xl -translate-x-32 -translate-y-32"></div>
  <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-tl from-[#00332D]/5 to-transparent rounded-full blur-3xl translate-x-40 translate-y-40"></div>
  
  <div className="max-w-7xl mx-auto text-center relative z-10">
    {/* Header sadaļa */}
    <div className="mb-16">
      <div className="inline-flex items-center gap-2 bg-[#77dDB4]/10 px-4 py-2 rounded-full mb-6">
        <div className="w-2 h-2 bg-[#77dDB4] rounded-full animate-pulse"></div>
        <p className="text-sm uppercase text-[#77dDB4] font-bold tracking-wider">
          {data.subtitle}
        </p>
      </div>
      
      <h2 className="text-4xl sm:text-5xl font-bold text-[#00332D] mb-4 leading-tight">
        {data.title}
      </h2>
      
      <div className="w-24 h-1 bg-gradient-to-r from-[#77dDB4] to-[#00332D] mx-auto rounded-full"></div>
    </div>

    {/* Partneru grid */}
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 sm:gap-8 items-center justify-center">
      {partners
        .sort((a, b) => a.order - b.order)
        .map((partner, i) => (
          <div
            key={i}
            className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-[#77dDB4]/20 transition-all duration-500 p-6 flex items-center justify-center border border-gray-100 hover:border-[#77dDB4]/50 transform hover:-translate-y-2"
          >
            {/* Hover glow efekts */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#77dDB4]/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            {partner.logoUrl ? (
              <div className="relative overflow-hidden rounded-lg">
                <Image
                  src={partner.logoUrl}
                  alt={partner.name}
                  width={140}
                  height={100}
                  className="object-contain transition-all duration-500 cursor-pointer group-hover:scale-110 group-hover:brightness-100"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center text-gray-400">
                <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mb-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-xs font-medium">Nav logo</span>
              </div>
            )}
          </div>
        ))}
    </div>

  </div>
</section>
  )
}
