"use client"

import Image from "next/image"

const partners = [
  { name: "Luminor", logo: "/partners/Luminor.svg" },
  { name: "SEB", logo: "/partners/SEB.svg" },
  { name: "Citadele", logo: "/partners/Citadele.svg" },
  { name: "Swedbank", logo: "/partners/Swedbank.svg" },
  { name: "Grand Credit", logo: "/partners/Grandcredit.svg" },
  { name: "West Kredit", logo: "/partners/Westkredit.svg" },
]

export default function PartnersSection() {
  return (
    <section className="py-20 px-4 md:px-12 bg-[#F3F4F6]">
      <div className="max-w-7xl mx-auto text-center">
        <p className="text-md uppercase text-[#77D4B4] font-semibold tracking-wide mb-2">
          Sadarbojamies ar vadošajām Latvijas bankām
        </p>
        <h2 className="text-3xl md:text-4xl font-bold text-[#00332D] mb-12">
          Mūsu galvenie sadarbības partneri
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-8 items-center justify-center">
          {partners.map((partner, i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow hover:shadow-md transition p-6 flex items-center justify-center"
            >
              <Image
                src={partner.logo}
                alt={partner.name}
                width={140}
                height={100}
                className="rounded-lg object-contain grayscale hover:grayscale-0 transition duration-300"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
