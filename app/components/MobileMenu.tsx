'use client'
import { useState } from "react"
import { Phone, Menu, X, ChevronDown, ChevronRight } from "lucide-react"
import Image from "next/image"

interface SubItem {
  link: string
  label: string
}

interface MenuItem {
  link: string
  label: string
  isVisible: boolean
  isHighlighted?: boolean
}

interface DropdownItem {
  link: string
  label: string
  isVisible: boolean
  subItems?: SubItem[]
}

interface MobileMenuProps {
  phone: string
  menuItems: MenuItem[]
  dropdownItems?: DropdownItem[]
  securityText: string
}

export default function MobileMenu({ 
  phone, 
  menuItems, 
  dropdownItems = [], 
  securityText 
}: MobileMenuProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [openDropdowns, setOpenDropdowns] = useState<string[]>([])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
    setOpenDropdowns([]) // Reset dropdowns kad aizver menu
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
    setOpenDropdowns([])
  }

  const toggleDropdown = (itemLink: string) => {
    if (openDropdowns.includes(itemLink)) {
      setOpenDropdowns(openDropdowns.filter(link => link !== itemLink))
    } else {
      setOpenDropdowns([...openDropdowns, itemLink])
    }
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
          <nav className="px-6 py-4 space-y-2">
            {/* Parastie menu linki */}
            {menuItems.map((item) => (
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

            {/* Dropdown menu linki */}
            {dropdownItems.map((item) => (
              item.isVisible && (
                <div key={item.link}>
                  {/* Dropdown galvenais links */}
                  <button
                    onClick={() => toggleDropdown(item.link)}
                    className="flex items-center justify-between w-full text-gray-700 hover:text-black text-lg py-2 border-b border-gray-100"
                  >
                    <span>{item.label}</span>
                    {openDropdowns.includes(item.link) ? 
                      <ChevronDown className="w-5 h-5 transition-transform duration-200" /> : 
                      <ChevronRight className="w-5 h-5 transition-transform duration-200" />
                    }
                  </button>
                  
                  {/* Dropdown apakšlinki */}
                  {openDropdowns.includes(item.link) && item.subItems && (
                    <div className="pl-6 space-y-1 py-2 bg-gray-50 rounded-md mt-1">
                      {item.subItems.map((subItem) => (
                        <a
                          key={subItem.link}
                          href={subItem.link}
                          onClick={closeMenu}
                          className="block text-gray-600 hover:text-black py-2 text-base transition-colors duration-150"
                        >
                          {subItem.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )
            ))}
            
            {/* Mobile drošības info */}
            <div className="pt-4 border-t border-gray-200 mt-4">
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