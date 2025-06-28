"use client"

import { CheckCheck } from "lucide-react"

const features = [
  "Komanda ar daudzu gadu pieredzi",
  "Sadarbība ar citām aģentūrām",
  "Personīga un profesionāla pieeja",
  "Godīga attieksme",
  "Ātrs rezultāts",
  "Nenormēts darba laiks 24/7",
  "Bezmaksas juridiskās konsultācijas",
]

export default function WhyChooseUs() {
  return (
    <section className="relative py-20 px-4 md:px-12 bg-white overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto grid md:grid-cols-2 gap-14 items-center">
        <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg p-8 max-w-[500px]">
          <h2 className="text-3xl md:text-4xl font-bold text-[#00332D] mb-6 leading-tight">
            Kāpēc izvēlēties mūs?
          </h2>
          <ul className="space-y-4 text-[#00332D] text-lg">
            {features.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <CheckCheck className="mt-1 w-5 h-5 text-[#00332D]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <button className="mt-8 bg-[#00332D] text-white px-6 py-3 rounded-lg hover:bg-[#00443B] transition">
            Saņemt piedāvājumu
          </button>
        </div>
      </div>

      <div className="absolute inset-0 z-0 bg-[url('/Section7.webp')] bg-no-repeat bg-right bg-contain" />
    </section>
  )
}
