"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  FolderOpen,
  Shield,
  Globe,
  Contact,
  BookOpen,
  GraduationCap,
} from "lucide-react";
import { UserButton } from '@clerk/nextjs';

const navItems = [
  { href: "/admin", label: "Pārskats", icon: <Home className="w-5 h-5" /> },
  { href: "/admin/translations", label: "Tulkojumi", icon: <Globe className="w-5 h-5" /> },
  { href: "/admin/properties", label: <span className="font-semibold">Īpašumi</span>, icon: <HousePlus className="w-5 h-5" /> },
  { href: "/admin/properties/property-categories", label: <span className="font-semibold">Īpašumu kategorijas</span>, icon: <HousePlus className="w-5 h-5" /> },
  { href: "/admin/access-requests", label: <span className="font-semibold text-red-600">Privāto sludinājumu pieprasījumi</span>, icon: <Shield className="w-5 h-5" /> },
  { href: "/admin/navigation", label: "Navigācija", icon: <LayoutGrid className="w-5 h-5" /> },
  { href: "/admin/slider", label: "Slideris", icon: <ImageIcon className="w-5 h-5" /> },
  { href: "/admin/first-section", label: "1. sadaļa", icon: <FileText className="w-5 h-5" /> },
  { href: "/admin/second-section", label: "Kāpēc izv. mākleri", icon: <FileText className="w-5 h-5" /> },
  { href: "/admin/third-section", label: "Pakalpojumi", icon: <FileText className="w-5 h-5" /> },
  { href: "/admin/seven-section", label: "Cik maksā Jūsu īpaš.", icon: <FileText className="w-5 h-5" /> },
  { href: "/admin/sixth-section", label: "Kapit. pieauguma nodoklis", icon: <FileText className="w-5 h-5" /> },
  { href: "/admin/agents", label: "Aģenti", icon: <Users className="w-5 h-5" /> },
  { href: "/admin/testimonials", label: "Atsauksmes", icon: <Star className="w-5 h-5" /> },
  { href: "/admin/sold-properties", label: "Karstākie piedāvājumi", icon: <FolderOpen className="w-5 h-5" /> },
  { href: "/admin/why-choose-us", label: "Kāpēc izvēlēties mūs", icon: <Globe className="w-5 h-5" /> },
  { href: "/admin/statistics", label: "Statistika", icon: <BarChart className="w-5 h-5" /> },
  { href: "/admin/partners", label: "Partneri", icon: <Building className="w-5 h-5" /> },
  { href: "/admin/blog", label: "Blogs", icon: <BookOpen className="w-5 h-5" /> },
  { href: "/admin/content", label: "Saturs (Izglītojošais/Ciemati)", icon: <GraduationCap className="w-5 h-5" /> },
  { href: "/admin/contacts", label: "Kontakti", icon: <Contact className="w-5 h-5" /> },
  { href: "/admin/footer", label: "Kājene", icon: <Settings className="w-5 h-5" /> },
];

export default function AdminSidebar({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-80 bg-white border-r border-gray-200 p-6 overflow-y-auto shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-[#00332D]">Vestate CMS</h1>
        </div>
        
        <nav className="space-y-1 mb-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                pathname === item.href
                  ? "bg-[#00332D] text-white shadow-md"
                  : "text-[#00332D] hover:bg-gray-100 hover:text-[#00332D]"
              }`}
            >
              {item.icon}
              <span className="truncate">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="border-t pt-6 space-y-3">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-blue-600 hover:bg-blue-50 transition-all duration-200"
          >
            <Home className="w-5 h-5" />
            <span>Atpakaļ uz mājaslapu</span>
          </Link>
          
          <div className="flex items-center gap-3 px-4 py-3 border rounded-lg bg-gray-50">
            <UserButton 
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  userButtonAvatarBox: "w-8 h-8",
                  userButtonBox: "hover:opacity-80"
                }
              }}
            />
            <span className="text-sm text-gray-600 font-medium">Admin profils</span>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}