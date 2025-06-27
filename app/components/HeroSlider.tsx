import Image from 'next/image'
import { Check } from 'lucide-react'

const benefits = [
  'Bezmaksas konsultācijas',
  'Bezmaksas novērtēšana',
  'Pilns darījuma pavadījums',
  'Profesionāla pieeja',
  'Ātrs rezultāts',
  'Apmierināti klienti',
]

export default function HeroSlider() {
  return (
    <section className="relative w-full h-[85vh] min-h-[500px]">
      {/* Fona attēls */}
      <Image
        src="/VestateSlider.webp"
        alt="Rīgas panorāma"
        fill
        priority
        className="object-cover"
      />

      {/* Saturs kreisajā pusē */}
      <div className="absolute inset-0 flex items-center justify-start px-6 md:px-12">
        <div className="bg-[#00332D]/90 text-white p-6 md:p-10 max-w-xl w-full rounded-md">
          <p className="text-sm font-semibold uppercase mb-2">
            MŪSU PROFESIONĀLĀ KOMANDA
          </p>
          <h1 className="text-2xl md:text-3xl font-bold leading-tight mb-6">
            PALĪDZĒS DROŠI UN IZDEVĪGI <span className="underline">PĀRDOT JŪSU ĪPAŠUMU</span>
          </h1>

          <ul className="space-y-2 mb-6 text-sm md:text-base">
            {benefits.map((text, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <Check className="w-4 h-4 text-white mt-1" />
                <span>{text}</span>
              </li>
            ))}
          </ul>

          <p className="font-semibold text-white text-sm md:text-base">
            RĪGA, RĪGAS RAJONS, JŪRMALA, JELGAVA
          </p>
        </div>
      </div>
    </section>
  )
}
