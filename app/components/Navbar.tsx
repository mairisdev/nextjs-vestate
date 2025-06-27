'use client'

import Image from 'next/image'
import { Phone } from 'lucide-react'

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between px-6 py-4">
        {/* Kreisā daļa: Logo */}
        <div className="flex items-center space-x-2">
          <Image src="/logo.svg" alt="Vestate logo" width={200} height={50} />
        </div>

        {/* Navigācija */}
        <nav className="hidden md:flex space-x-6 text-md text-gray-700">
          <a href="#kapeec" className="hover:text-black">Kāpēc mēs?</a>
          <a href="#komanda" className="hover:text-black">Mūsu komanda</a>
          <a href="#darbi" className="hover:text-black">Mūsu darbi</a>
          <a href="#atsauksmes" className="hover:text-black">Atsauksmes</a>
          <a href="#kontakti" className="hover:text-black">Kontakti</a>
          <a href="#blogs" className="hover:text-black">Blogs</a>
        </nav>

        {/* Labā daļa */}
        <div className="flex items-center space-x-6">
          {/* Garantija */}
            <div className="hidden md:flex items-center">
            <Image
                src="/drosiba.webp"
                alt="Darījuma drošības garantija"
                width={200}
                height={50}
                className="object-contain"
            />
            </div>

          {/* Telefons */}
          <div className="flex items-center text-[#00332D] font-semibold text-md space-x-2">
            <a
            href="tel:28446677"
            className="flex items-center text-[#00332D] font-semibold text-md space-x-2 hover:underline"
            >
            <Phone className="w-5 h-5" />
            <span>+371 28446677</span>
            </a>
          </div>
        </div>
      </div>
    </header>
  )
}
