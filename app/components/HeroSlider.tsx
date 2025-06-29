import Image from "next/image"
import { Check } from "lucide-react"
import { getSlides } from "@/lib/queries/slider"

export default async function HeroSlider() {
  const slides = await getSlides()

  if (!slides || slides.length === 0) return null

  const benefits = slides[0].description.split("\n")

  return (
    <section className="relative w-full h-[90vh]">
<Image
  src={slides[0].imageUrl ? slides[0].imageUrl : "/default-image.webp"} // Atcerieties, ka imageUrl sākas ar "/slider/"
  alt="Rīgas panorāma"
  fill
  priority
  className="object-cover"
/>

      <div className="absolute inset-0 flex items-center justify-start px-6 md:px-12">
        <div className="bg-[#00332D]/90 text-white p-6 md:p-10 max-w-xl w-full rounded-md">
          <p className="text-sm font-semibold uppercase mb-2">
            {slides[0].subtitle || 'MŪSU PROFESIONĀLĀ KOMANDA'}
          </p>
          <h1 className="text-2xl md:text-3xl font-bold leading-tight mb-6">
            {slides[0].title || 'PALĪDZĒS DROŠI UN IZDEVĪGI PĀRDOT JŪSU ĪPAŠUMU'}
          </h1>

          <ul className="space-y-2 mb-6 text-sm md:text-base">
            {benefits.map((text, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <Check className="w-4 h-4 text-white mt-1" />
                <span>{text}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6">
            <a
              href={slides[0].buttonLink || '#'}
              className="text-white font-semibold py-2 px-6 bg-[#00332D] rounded-md hover:bg-[#005B48] transition-all"
            >
              {slides[0].buttonText || "Uzzināt vairāk"}
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
