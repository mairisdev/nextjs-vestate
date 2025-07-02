'use client'

import { useState } from 'react'
import Image from "next/image"
import { Phone, Menu, X } from "lucide-react"

type NavigationData = {
  logoUrl: string | null;
  logoAlt: string | undefined;
  phone: string;
  securityText: string;
  menuItems?: Array<{
    label: string;
    link: string;
    isVisible: boolean;
  }>
}

interface NavbarProps {
  data: NavigationData | null
}

export default function Navbar({ data }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  if (!data) return null

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between px-4 md:px-6 py-3 md:py-4">
        
        {/* Logo */}
        <div className="flex items-center space-x-2">
          {data.logoUrl ? (
            <img
              src={`/uploads/navigation/${data.logoUrl}`}
              alt={data.logoAlt || "Vestate logo"}
              className="h-12 md:h-20 w-auto object-contain"
            />
          ) : (
            <p className="text-gray-500 italic text-sm md:text-base">Nav pievienots logo</p>
          )}
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-6 text-md text-gray-700">
          {Array.isArray(data.menuItems) && data.menuItems.map((item: any) => (
            item.isVisible && (
              <a key={item.link} href={item.link} className="hover:text-black transition-colors">
                {item.label}
              </a>
            )
          ))}
        </nav>

        {/* Desktop Right Side */}
        <div className="hidden md:flex items-center space-x-6">
          <div className="flex items-center">
            <Image
              src="/drosiba.webp"
              alt={data.securityText || "Drošības attēls"}
              width={200}
              height={50}
              className="object-contain"
            />
          </div>

          <div className="flex items-center text-[#00332D] font-semibold text-md space-x-2">
            <a
              href={`tel:${data.phone}`}
              className="flex items-center hover:underline"
            >
              <Phone className="w-4.5 h-4.5 mr-1.5" />
              <span>{data.phone}</span>
            </a>
          </div>
        </div>

        {/* Mobile Right Side */}
        <div className="flex md:hidden items-center space-x-3">
          {/* Mobile Phone */}
          <a
            href={`tel:${data.phone}`}
            className="flex items-center text-[#00332D] font-semibold text-sm"
          >
            <Phone className="w-4 h-4 mr-1" />
            <span className="xs:inline">{data.phone}</span>
          </a>

          {/* Hamburger Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="p-2 text-gray-700 hover:text-black transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
          <nav className="px-4 py-3 space-y-3">
            {Array.isArray(data.menuItems) && data.menuItems.map((item: any) => (
              item.isVisible && (
                <a
                  key={item.link}
                  href={item.link}
                  className="block py-2 text-gray-700 hover:text-black transition-colors border-b border-gray-100 last:border-b-0"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </a>
              )
            ))}
          </nav>
          
          {/* Mobile Security Image */}
          <div className="px-4 pb-4 pt-2 border-t border-gray-100">
            <Image
              src="/drosiba.webp"
              alt={data.securityText || "Drošības attēls"}
              width={150}
              height={38}
              className="object-contain"
            />
          </div>
        </div>
      )}
    </header>
  )
}