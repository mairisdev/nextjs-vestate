"use client"

import * as LucideIcons from "lucide-react"

interface Stat {
  id?: string
  icon: string
  value: string
  description: string
  order?: number
}

interface StatsSectionProps {
  stats: Stat[]
  translations: {
    defaultSubheading: string
    defaultHeading: string
    noStatsText: string
    [key: string]: string
  }
}

export default function StatsSection({ stats, translations }: StatsSectionProps) {
  if (!stats || stats.length === 0) {
    return (
      <section className="py-20 bg-white px-4 md:px-12">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-md uppercase text-[#77D4B4] font-semibold tracking-wide mb-2">
            {translations.defaultSubheading}
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-[#00332D] mb-12">
            {translations.defaultHeading}
          </h2>
          <p className="text-gray-600">{translations.noStatsText}</p>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 bg-white px-4 md:px-12">
      <div className="max-w-5xl mx-auto text-center">
        <p className="text-md uppercase text-[#77D4B4] font-semibold tracking-wide mb-2">
          {translations.defaultSubheading}
        </p>
        <h2 className="text-3xl md:text-4xl font-bold text-[#00332D] mb-12">
          {translations.defaultHeading}
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {stats.map((item, i) => {
            const LucideIcon = (LucideIcons as any)[item.icon] || LucideIcons.HelpCircle
            return (
              <div
                key={item.id || i}
                className="flex flex-col items-center bg-[#E6F4F1] rounded-2xl p-6 shadow hover:shadow-lg transition"
              >
                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-[#00332D] mb-4">
                  <LucideIcon className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-[#00332D] mb-2">
                  {translations[`stat${i + 1}Value`] || item.value}
                </div>
                <p className="text-[#00332D] text-center text-sm font-medium leading-relaxed">
                  {translations[`stat${i + 1}Description`] || item.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
