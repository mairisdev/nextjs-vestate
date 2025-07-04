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
<section className="py-16 sm:py-20 px-4 sm:px-8 md:px-12 bg-[#F3F4F6]">
  <div className="max-w-7xl mx-auto text-center">
    <p className="text-sm uppercase text-[#77D4B4] font-semibold mb-2">
      {data.subtitle}
    </p>
    <h2 className="text-3xl sm:text-4xl font-bold text-[#00332D] mb-8 sm:mb-12">
      {data.title}
    </h2>

    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 sm:gap-8 items-center justify-center">
      {partners
        .sort((a, b) => a.order - b.order)
        .map((partner, i) => (
          <div
            key={i}
            className="bg-white rounded-xl shadow-lg hover:shadow-xl transition duration-300 p-6 flex items-center justify-center"
          >
            {partner.logoUrl ? (
            <Image
              src={partner.logoUrl}
              alt={partner.name}
              width={140}
              height={100}
              className="object-contain grayscale hover:grayscale-0 transition duration-300 cursor-pointer"
            />
            ) : (
              <span className="text-gray-400 text-sm">Nav logo</span>
            )}
          </div>
        ))}
    </div>
  </div>
</section>
  )
}
