import Image from "next/image"
import { Phone } from "lucide-react"
import { getNavigationSettings } from "@/lib/queries/navigation"
import MobileMenu from "./MobileMenu"
//import DropdownMenu from "./DropdownMenu"
import Link from "next/link"

export default async function Navbar() {
  const data = await getNavigationSettings();
  if (!data) return null;

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between px-6 py-4">
      <Link href="/" className="block">
        {data.logoUrl ? (
          <img
            src={`/uploads/navigation/${data.logoUrl}`}
            alt={data.logoAlt || "Vestate logo"}
            className="w-auto h-12 md:h-20 object-contain"
          />
        ) : (
          <p className="text-gray-500 italic">Nav pievienots logo</p>
        )}
      </Link>

        {/* Desktop navigācija */}
        <nav className="hidden md:flex items-center space-x-6 text-md text-[#00332D]">
          {/* Parastie linki */}
          {Array.isArray(data.menuItems) && data.menuItems.map((item: any) => (
            item.isVisible && (
              <a 
                key={item.link} 
                href={item.link} 
                className={`hover:text-[#00332D] inline-flex items-center transition-all duration-300 ${
                  item.isHighlighted 
                    ? 'px-5 py-2.5 text-[#00332D] bg-gradient-to-r from-[#77dDB4]/20 to-[#77dDB4]/10 border-2 border-[#77dDB4] rounded-xl font-semibold shadow-lg shadow-[#77dDB4]/20 hover:shadow-xl hover:shadow-[#77dDB4]/30 hover:bg-gradient-to-r hover:from-[#77dDB4]/30 hover:to-[#77dDB4]/20 hover:border-[#00332D] hover:scale-105 transform' 
                    : ''
                }`}
              >
                {item.label}
              </a>
            )
          ))}
          
          {/*
          {Array.isArray(data.dropdownItems) && data.dropdownItems.map((item: any) => (
            item.isVisible && item.subItems && (
              <div 
                key={item.link}
                className={item.isHighlighted ? 'px-2 py-1 bg-green-50 border-2 border-green-300 rounded-lg' : ''}
              >
                <DropdownMenu 
                  label={item.label}
                  subItems={item.subItems}
                  isHighlighted={item.isHighlighted}
                />
              </div>
            )
          ))}*/}
        </nav>

        {/* Desktop drošība un telefons */}
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

        {/* Mobile menu */}
        <MobileMenu 
          phone={data.phone}
          menuItems={data.menuItems || []}
          dropdownItems={data.dropdownItems || []}
          securityText={data.securityText}
        />
      </div>
    </header>
  )
}