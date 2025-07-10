// app/components/ServicesSection.tsx
import { getThirdSection } from "@/lib/queries/thirdSection"
import { ChevronRight } from "lucide-react"

export default async function ServicesZigZag() {
  const section = await getThirdSection()

  // Ja dati nav pieejami — nerenderējam komponenti
  if (!section || !section.services || section.services.length === 0) {
    return null
  }

  const paired: string[][] = []
  for (let i = 0; i < section.services.length; i += 2) {
    paired.push([section.services[i], section.services[i + 1]])
  }

  return (
<section id="pakalpojumi" className="bg-white py-8 sm:py-16 px-4 sm:px-12">
  <div className="max-w-6xl mx-auto">
    <p className="text-sm font-semibold uppercase text-[#77D4B4] text-center mb-2">
      {section.subheading || "Pieredzes bagāti nekustamo īpašumu speciālisti"}
    </p>
    <h2 className="text-2xl sm:text-3xl font-bold text-[#00332D] text-center mb-16 sm:mb-20">
      {section.heading || "Pakalpojumi, ko sniedz mūsu komanda"}
    </h2>

    <div className="space-y-8 sm:space-y-10">
      {paired.map(([left, right], i) => (
        <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-20 items-center">
          {/* Kreisā puse */}
          <div className="flex items-center gap-4 self-start">
            <div className="w-9 h-9 flex items-center justify-center">
              <ChevronRight size={30} stroke="#77D4B4" strokeWidth={3} />
            </div>
            <p className="text-base leading-relaxed text-[#00332D]">{left}</p>
          </div>

          {/* Labā puse tikai, ja ir */}
          {right ? (
            <div className="flex items-center gap-4 self-start">
              <div className="w-9 h-9 flex items-center justify-center">
                <ChevronRight size={30} stroke="#77D4B4" strokeWidth={3} />
              </div>
              <p className="text-base leading-relaxed text-[#00332D]">{right}</p>
            </div>
          ) : (
            // Ja nav `right`, aizpilda tukšu vietu, lai saglabā struktūru
            <div className="hidden md:block" />
          )}
        </div>
      ))}
    </div>
  </div>
</section>

  )
}
