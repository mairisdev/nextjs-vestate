"use client"

import Image from "next/image"
import Link from "next/link"

export default function LegalConsultSection() {
  return (
    <section className="relative w-full min-h-[600px] bg-fixed bg-center bg-cover bg-no-repeat flex items-center justify-end px-6 md:px-12">

      <Image
        src="/Section6.webp"
        alt="Jurista konsultācija"
        fill
        className="object-contain"
        priority
      />

      <div className="absolute inset-0 flex items-center justify-end px-4 md:px-12">
        <div className="bg-[#ffffffcc] text-[#00332D] p-6 md:p-12 w-full md:w-[600px] backdrop-blur-sm rounded-md flex flex-col items-center justify-center text-center">
        <h2 className="text-xl md:text-1xl font-semibold mb-6">
            UZZINIET, VAI PĀRDODOT NEKUSTAMO ĪPAŠUMU
            NEBŪS JĀMAKSĀ KAPITĀLA <br />
            PIEAUGUMA NODOKLIS
        </h2>

        <Link
        href="#"
        className="inline-block cursor-default bg-[#00332D] text-white font-semibold text-sm px-6 py-4 rounded-md border-2 border-white hover:bg-transparent hover:text-[#00332D] hover:border-[#00332D] transition duration-300 ease-in-out"
        >
        SAŅEMT MŪSU JURISTA BEZMAKSAS KONSULTĀCIJU
        </Link>
        </div>
      </div>
    </section>
  )
}
