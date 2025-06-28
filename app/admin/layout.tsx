"use client"

import { ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, LayoutGrid, Settings } from "lucide-react"

const navItems = [
  { href: "/admin", label: "Pārskats", icon: <Home className="w-5 h-5" /> },
  { href: "/admin/sections", label: "Sadaļas", icon: <LayoutGrid className="w-5 h-5" /> },
  { href: "/admin/iestatijumi", label: "Iestatījumi", icon: <Settings className="w-5 h-5" /> },
]

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-[#00332D] mb-8">Admin panelis</h1>
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

      {/* Main content */}
      <main className="flex-1 p-10">
        {children}
      </main>
    </div>
  )
}
