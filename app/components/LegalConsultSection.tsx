import Image from "next/image"
import Link from "next/link"
import { getSixthSection } from "@/lib/queries/sixthSection"

export default async function LegalConsultSection() {
  const data = await getSixthSection()

  if (!data) return null

  return (
    <section className="relative w-full min-h-[600px] flex items-center justify-end px-6 md:px-12">
      <Image
        src={data.imageUrl || "/placeholder.jpg"}
        alt="Jurista konsultācija"
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-tr from-black/30 to-transparent z-0">
        <div className="absolute inset-0 flex items-center justify-end px-4 md:px-12">

          <div className="relative z-10 bg-white/95 backdrop-blur-md text-[#00332D] p-8 md:p-12 w-full md:w-[600px] rounded-2xl shadow-2xl border border-gray-200 flex flex-col items-center justify-center text-center">
            <h2 className="text-xl md:text-2xl font-bold mb-6 whitespace-pre-line leading-tight">
              {data.title}
            </h2>
            
            <Link
              href={data.buttonLink || "#"}
              className="inline-block bg-[#00332D] text-white font-semibold text-sm px-8 py-4 rounded-xl border-2 border-[#00332D] hover:bg-[#77dDB4] hover:border-[#77dDB4] hover:text-white transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg"
            >
              {data.buttonText}
            </Link>
          </div>

       </div>
      </div>
    </section>
  )
}
