import Image from "next/image"
import { Phone } from "lucide-react"
import { getNavigationSettings } from "@/lib/queries/navigation"
import MobileMenu from "./MobileMenu"

export default async function Navbar() {
  const data = await getNavigationSettings();

  if (!data) return null;

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between px-6 py-4">

        {/* Logo - samazināts mobilajiem */}
        <div className="flex items-center space-x-2">
          {data.logoUrl ? (
            <img
              src={`/uploads/navigation/${data.logoUrl}`}
              alt={data.logoAlt || "Vestate logo"}
              className="w-auto h-12 md:h-20 object-contain"
            />
          ) : (
            <p className="text-gray-500 italic">Nav pievienots logo</p>
          )}
        </div>

        {/* Desktop navigācija */}
        <nav className="hidden md:flex space-x-6 text-md text-gray-700">
          {Array.isArray(data.menuItems) && data.menuItems.map((item: any) => (
            item.isVisible && (
              <a key={item.link} href={item.link} className="hover:text-black">
                {item.label}
              </a>
            )
          ))}
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

        {/* Mobile menu komponente */}
        <MobileMenu 
          phone={data.phone}
          menuItems={data.menuItems}
          securityText={data.securityText}
        />
      </div>
    </header>
  )
}