"use client"

import { useEffect, useState } from "react"
import * as LucideIcons from "lucide-react"

interface Stat {
  icon: string
  value: string
  description: string
}

export default function StatsSection() {
  const [stats, setStats] = useState<Stat[]>([])

  useEffect(() => {
    fetch("/api/statistics")
      .then(res => res.json())
      .then(data => setStats(data || []))
  }, [])

  return (
    <section className="py-20 bg-white px-4 md:px-12">
      <div className="max-w-5xl mx-auto text-center">
        <p className="text-md uppercase text-[#77D4B4] font-semibold tracking-wide mb-2">
          Pieredzes bagāti nekustamo īpašumu speciālisti
        </p>
        <h2 className="text-3xl md:text-4xl font-bold text-[#00332D] mb-12">
          Mūsu pārdošanas prakse
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {stats.map((item, i) => {
            const LucideIcon = (LucideIcons as any)[item.icon] || LucideIcons.HelpCircle
            return (
              <div
                key={i}
                className="flex flex-col items-center bg-[#E6F4F1] rounded-2xl p-6 shadow hover:shadow-lg transition"
              >
                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-[#00332D] mb-4">
                  <LucideIcon className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-[#00332D] mb-2">{item.value}</div>
                <p className="text-[#00332D] text-center text-sm font-medium leading-relaxed">
                  {item.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
