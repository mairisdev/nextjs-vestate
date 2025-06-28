"use client"

import { Clock, BadgeCheck, TrendingUp } from "lucide-react"

const stats = [
  {
    icon: <Clock className="w-6 h-6 text-white" />,
    value: "84%",
    description: "īpašumu pārdodam 28 dienu laikā",
  },
  {
    icon: <BadgeCheck className="w-6 h-6 text-white" />,
    value: "88%",
    description: "noturam īpašuma nolīgto cenu",
  },
  {
    icon: <TrendingUp className="w-6 h-6 text-white" />,
    value: "12%",
    description: "gadījumu pārdodam īpašumu par augstāku cenu",
  },
]

export default function StatsSection() {
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
          {stats.map((item, i) => (
            <div
              key={i}
              className="flex flex-col items-center bg-[#E6F4F1] rounded-2xl p-6 shadow hover:shadow-lg transition"
            >
              <div className="w-16 h-16 flex items-center justify-center rounded-full bg-[#00332D] mb-4">
                {item.icon}
              </div>
              <div className="text-3xl font-bold text-[#00332D] mb-2">{item.value}</div>
              <p className="text-[#00332D] text-center text-sm font-medium leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
