"use client"

import Image from "next/image"
import { Check } from "lucide-react"
import { useEffect, useState } from "react"

type Slide = {
  title: string
  subtitle: string
  description: string
  buttonText: string
  buttonLink: string
  imageUrl: string
}

export default function HeroSlider() {
  const [slides, setSlides] = useState<Slide[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)

  // Fetch slides from API
  useEffect(() => {
    const fetchSlides = async () => {
      const response = await fetch("/api/slides")
      const data = await response.json()
      setSlides(data)
    }

    fetchSlides()
  }, [])

  // Handle next slide
  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length)
  }

  // Handle previous slide
  const prevSlide = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + slides.length) % slides.length
    )
  }

  // Wait for slides data to load
  if (slides.length === 0) return null

  const currentSlide = slides[currentIndex]
  const benefits = currentSlide.description.split("\n")

  return (
    <section className="relative w-full h-[90vh]">
      <Image
        src={currentSlide.imageUrl ? currentSlide.imageUrl : "/default-image.webp"}
        alt={currentSlide.title}
        fill
        priority
        className="object-cover"
      />

      <div className="absolute inset-0 flex items-center justify-start px-6 md:px-12">
        <div className="bg-[#00332D]/90 text-white p-6 md:p-10 max-w-xl w-full rounded-md">
          <p className="text-sm font-semibold uppercase mb-2">
            {currentSlide.subtitle || "MŪSU PROFESIONĀLĀ KOMANDA"}
          </p>
          <h1 className="text-2xl md:text-3xl font-bold leading-tight mb-6">
            {currentSlide.title || "PALĪDZĒS DROŠI UN IZDEVĪGI PĀRDOT JŪSU ĪPAŠUMU"}
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
              href={currentSlide.buttonLink || "#"}
              className="text-white font-semibold py-2 px-6 bg-[#00332D] rounded-md hover:bg-[#005B48] transition-all"
            >
              {currentSlide.buttonText || "Uzzināt vairāk"}
            </a>
          </div>
        </div>
      </div>

      {/* Slīdošo slaidu bultiņas */}
      <div className="absolute top-1/2 left-4 transform -translate-y-1/2 text-white cursor-pointer" onClick={prevSlide}>
        <span className="text-3xl">&lt;</span>
      </div>
      <div className="absolute top-1/2 right-4 transform -translate-y-1/2 text-white cursor-pointer" onClick={nextSlide}>
        <span className="text-3xl">&gt;</span>
      </div>
    </section>
  )
}
