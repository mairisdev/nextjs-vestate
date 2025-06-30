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
    <section className="bg-white py-20 px-4 md:px-12">
      <div className="max-w-6xl mx-auto">
        <p className="text-sm font-semibold uppercase text-[#77D4B4] text-center mb-2">
          {section.subheading || "Pieredzes bagāti nekustamo īpašumu speciālisti"}
        </p>
        <h2 className="text-2xl md:text-3xl font-bold text-[#00332D] text-center mb-20">
          {section.heading || "Pakalpojumi, ko sniedz mūsu komanda"}
        </h2>

        <div className="space-y-10 md:space-y-12">
          {paired.map(([left, right], i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20">
              {left && (
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 flex items-center justify-center">
                    <ChevronRight size={30} stroke="#77D4B4" strokeWidth={3} />
                  </div>
                  <p className="text-base leading-relaxed text-[#00332D]">{left}</p>
                </div>
              )}

              {right && (
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 flex items-center justify-center">
                    <ChevronRight size={30} stroke="#77D4B4" strokeWidth={3} />
                  </div>
                  <p className="text-base leading-relaxed text-[#00332D]">{right}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
