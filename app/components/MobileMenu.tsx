'use client'
import { useState } from "react"
import { Phone, Menu, X } from "lucide-react"
import Image from "next/image"

interface MobileMenuProps {
  phone: string
  menuItems: any[]
  securityText: string
}

export default function MobileMenu({ phone, menuItems, securityText }: MobileMenuProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  return (
    <>
      {/* Mobile telefons un hamburger */}
      <div className="flex md:hidden items-center space-x-12">
        <a
          href={`tel:${phone}`}
          className="flex items-center text-[#00332D] font-semibold"
        >
          <Phone className="w-4 h-4 mr-1.5" />
          <span className="text-sm">{phone}</span>
        </a>
        
        <button
          onClick={toggleMenu}
          className="text-gray-700 hover:text-black"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 right-0 md:hidden bg-white border-t border-gray-200 shadow-lg">
          <nav className="px-6 py-4 space-y-4">
            {Array.isArray(menuItems) && menuItems.map((item: any) => (
              item.isVisible && (
                <a
                  key={item.link}
                  href={item.link}
                  onClick={closeMenu}
                  className="block text-gray-700 hover:text-black text-lg py-2 border-b border-gray-100"
                >
                  {item.label}
                </a>
              )
            ))}
            
            {/* Mobile drošības info */}
            <div className="pt-4 border-t border-gray-200">
              <Image
                src="/drosiba.webp"
                alt={securityText || "Drošības attēls"}
                width={150}
                height={40}
                className="object-contain"
              />
            </div>
          </nav>
        </div>
      )}
    </>
  )
}