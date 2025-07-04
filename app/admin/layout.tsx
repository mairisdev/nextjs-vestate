"use client"

import { ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  HousePlus,
  FileText,
  LayoutGrid,
  Settings,
  Building,
  Users,
  BarChart,
  Star,
  ImageIcon,
  MessageSquare,
  FolderOpen,
  Shield,
  Globe,
  Contact,
  BookOpen,
} from "lucide-react"
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/nextjs';

const navItems = [
  { href: "/admin", label: "Pārskats", icon: <Home className="w-5 h-5" /> },
  { href: "/admin/properties", label: <span className="font-semibold">Īpašumi</span>, icon: <HousePlus className="w-5 h-5" /> },
  { href: "/admin/navigation", label: "Navigācija", icon: <LayoutGrid className="w-5 h-5" /> },
  { href: "/admin/slider", label: "Slideris", icon: <ImageIcon className="w-5 h-5" /> },
  { href: "/admin/first-section", label: "1. sadaļa", icon: <FileText className="w-5 h-5" /> },
  { href: "/admin/second-section", label: "2. sadaļa", icon: <FileText className="w-5 h-5" /> },
  { href: "/admin/third-section", label: "3. sadaļa", icon: <FileText className="w-5 h-5" /> },
  { href: "/admin/sixth-section", label: "4. sadaļa", icon: <FileText className="w-5 h-5" /> },
  { href: "/admin/agents", label: "Aģenti", icon: <Users className="w-5 h-5" /> },
  { href: "/admin/testimonials", label: "Atsauksmes", icon: <Star className="w-5 h-5" /> },
  { href: "/admin/sold-properties", label: "Pārdotie īpašumi", icon: <FolderOpen className="w-5 h-5" /> },
  { href: "/admin/private-listings", label: "Privātie sludinājumi", icon: <Shield className="w-5 h-5" /> },
  { href: "/admin/why-choose-us", label: "Kāpēc izvēlēties mūs", icon: <Globe className="w-5 h-5" /> },
  { href: "/admin/statistics", label: "Statistika", icon: <BarChart className="w-5 h-5" /> },
  { href: "/admin/partners", label: "Partneri", icon: <Building className="w-5 h-5" /> },
  { href: "/admin/blog", label: "Blogs", icon: <BookOpen className="w-5 h-5" /> },
  { href: "/admin/contacts", label: "Kontakti", icon: <Contact className="w-5 h-5" /> },
  { href: "/admin/footer", label: "Kājene", icon: <Settings className="w-5 h-5" /> },
]

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <>
      <SignedIn>
        <div className="flex min-h-screen bg-gray-100">
          <aside className="w-64 bg-white border-r border-gray-200 p-6">
            <h1 className="text-2xl font-bold text-[#00332D] mb-8">Vestate CMS</h1>
            <nav className="space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition ${
                    pathname === item.href
                      ? "bg-[#00332D] text-white"
                      : "text-[#00332D] hover:bg-gray-100"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>

          <main className="flex-1 p-10">
            {children}
          </main>
        </div>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  )
}
