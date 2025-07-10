import Image from "next/image"
import { CheckCheck } from "lucide-react"
import { getWhyChooseUs } from "@/lib/queries/whyChooseUs"
import {
  ReactElement,
  JSXElementConstructor,
  ReactNode,
  ReactPortal,
  Key,
} from "react"

export default async function WhyChooseUs() {
  const data = await getWhyChooseUs()

  if (!data) return null

  return (
<section id="kapec-mes" className="relative py-16 sm:py-20 px-6 sm:px-12 bg-gradient-to-br from-white via-[#F9FAFB] to-white overflow-hidden">
  {/* Dekoratīvi background elementi */}
  <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#77dDB4]/10 to-transparent rounded-full blur-3xl translate-x-48 -translate-y-48"></div>
  <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-[#00332D]/5 to-transparent rounded-full blur-3xl -translate-x-40 translate-y-40"></div>
  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-[#77dDB4]/5 to-[#00332D]/5 rounded-full blur-3xl"></div>
  
  <div className="relative z-10 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
    {/* Saturs */}
    <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl shadow-[#77dDB4]/10 p-8 lg:p-10 lg:max-w-[550px] w-full border border-[#77dDB4]/20 group hover:shadow-3xl hover:shadow-[#77dDB4]/20 transition-all duration-500">
 
      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#00332D] mb-8 leading-tight">
        {data.title}
      </h2>
      
      <div className="space-y-6 text-[#00332D] text-lg sm:text-xl mb-10">
        {data.points.map((item, i) => (
          <div key={i} className="group/item flex items-start gap-4 p-4 rounded-xl hover:bg-[#77dDB4]/5 transition-all duration-300">
            <div className="relative flex-shrink-0 mt-1">
              <div className="w-6 h-6 bg-gradient-to-r from-[#77dDB4] to-[#00332D] rounded-full flex items-center justify-center group-hover/item:scale-110 transition-transform duration-300">
                <CheckCheck className="w-4 h-4 text-white" />
              </div>
              <div className="absolute inset-0 w-6 h-6 bg-gradient-to-r from-[#77dDB4] to-[#00332D] rounded-full blur opacity-0 group-hover/item:opacity-50 transition-opacity duration-300"></div>
            </div>
            <span className="font-medium leading-relaxed group-hover/item:text-[#00443B] transition-colors duration-300">
              {item}
            </span>
          </div>
        ))}
      </div>
      
      {data.buttonUrl && (
        <div className="relative">
          <a
            href={data.buttonUrl}
            className="group/btn relative inline-flex items-center gap-3 bg-gradient-to-r from-[#00332D] to-[#00443B] text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg shadow-[#00332D]/30 hover:shadow-xl hover:shadow-[#00332D]/40 transition-all duration-300 transform hover:scale-105 border-2 border-transparent hover:border-[#77dDB4] overflow-hidden"
          >
            <span className="relative z-10">{data.buttonText}</span>
            <svg className="relative z-10 w-5 h-5 group-hover/btn:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            <div className="absolute inset-0 bg-gradient-to-r from-[#77dDB4]/20 to-[#77dDB4]/10 transform scale-x-0 group-hover/btn:scale-x-100 transition-transform duration-300 origin-left"></div>
          </a>
        </div>
      )}
    </div>
    
    {/* Attēla sadaļa */}
    <div className="relative w-full flex-grow group/image">
      <div className="relative aspect-[3/2] sm:aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl shadow-[#77dDB4]/20 border-4 border-white group-hover/image:shadow-3xl group-hover/image:shadow-[#77dDB4]/30 transition-all duration-500">
        <Image
          src={data.imageUrl}
          alt="Kāpēc izvēlēties mūs?"
          fill
          className="object-cover transition-transform duration-700 group-hover/image:scale-110"
          priority
        />
        {/* Overlay ar gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#00332D]/20 via-transparent to-transparent opacity-0 group-hover/image:opacity-100 transition-opacity duration-500"></div>
        
      </div>

    </div>
  </div>
</section>
  )
}
