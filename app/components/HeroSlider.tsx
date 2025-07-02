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
  <section className="relative w-full h-[60vh] sm:h-[70vh] md:h-[80vh] lg:h-[90vh]">
    <Image
      src={currentSlide.imageUrl ? currentSlide.imageUrl : "/default-image.webp"}
      alt={currentSlide.title}
      fill
      priority
      className="object-cover"
    />
     
    <div className="absolute inset-0 flex items-center justify-start px-3 sm:px-4 md:px-6 lg:px-12">
      <div className="bg-[#00332D]/90 text-white p-3 sm:p-4 md:p-6 lg:p-10 max-w-[95%] sm:max-w-lg md:max-w-xl w-full rounded-md">
        <p className="text-xs sm:text-sm font-semibold uppercase mb-1 sm:mb-2">
          {currentSlide.subtitle || "MŪSU PROFESIONĀLĀ KOMANDA"}
        </p>
        <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold leading-tight mb-3 sm:mb-4 md:mb-6">
          {currentSlide.title || "PALĪDZĒS DROŠI UN IZDEVĪGI PĀRDOT JŪSU ĪPAŠUMU"}
        </h1>
         
        <ul className="space-y-1 sm:space-y-1.5 md:space-y-2 mb-3 sm:mb-4 md:mb-6 text-xs sm:text-sm md:text-base">
          {benefits.map((text, idx) => (
            <li key={idx} className="flex items-start gap-1.5 sm:gap-2">
              <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white mt-0.5 sm:mt-1 flex-shrink-0" />
              <span className="leading-tight">{text}</span>
            </li>
          ))}
        </ul>
         
        <div className="mt-3 sm:mt-4 md:mt-6">
          <a
            href={currentSlide.buttonLink || "#"}
            className="inline-block text-white font-semibold py-2 sm:py-2.5 md:py-3 px-4 sm:px-5 md:px-6 bg-[#00332D] rounded-md hover:bg-[#005B48] transition-all text-xs sm:text-sm md:text-base"
          >
            {currentSlide.buttonText || "Uzzināt vairāk"}
          </a>
        </div>
      </div>
    </div>
     
    {/* Navigation arrows - hidden on very small screens */}
    <div className="hidden sm:block absolute top-1/2 left-2 md:left-4 transform -translate-y-1/2 text-white cursor-pointer hover:text-gray-300 transition-colors" onClick={prevSlide}>
      <span className="text-2xl md:text-3xl select-none">&lt;</span>
    </div>
    <div className="hidden sm:block absolute top-1/2 right-2 md:right-4 transform -translate-y-1/2 text-white cursor-pointer hover:text-gray-300 transition-colors" onClick={nextSlide}>
      <span className="text-2xl md:text-3xl select-none">&gt;</span>
    </div>
    
    {/* Mobile navigation dots */}
    <div className="sm:hidden absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
      {/* Add dots for mobile navigation if you have multiple slides */}
      <button 
        onClick={prevSlide}
        className="w-8 h-8 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center transition-colors"
        aria-label="Previous slide"
      >
        <span className="text-white text-sm">&lt;</span>
      </button>
      <button 
        onClick={nextSlide}
        className="w-8 h-8 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center transition-colors"
        aria-label="Next slide"
      >
        <span className="text-white text-sm">&gt;</span>
      </button>
    </div>
  </section>
)

}
