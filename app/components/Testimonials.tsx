import { Star } from "lucide-react"

interface Testimonial {
  name: string
  message: string
  rating: number
  language: string
}

interface TestimonialsProps {
  testimonials: Testimonial[]
  translations: {
    defaultHeading: string
    defaultSubheading: string
    [key: string]: string
  }
}

export default function TestimonialsSection({ testimonials, translations }: TestimonialsProps) {
  if (!testimonials || testimonials.length === 0) return null

  return (
    <section id="atsauksmes" className="py-20 px-4 md:px-12 bg-white">
      <div className="max-w-6xl mx-auto text-center">
        
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-[#77D4B4]/10 rounded-full px-6 py-2 mb-4">
            <div className="w-2 h-2 bg-[#77D4B4] rounded-full animate-pulse"></div>
            <p className="text-sm font-semibold uppercase text-[#77D4B4]">
              {translations.defaultSubheading}
            </p>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#00332D] mb-4">
            {translations.defaultHeading}
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-[#77D4B4] to-[#5BC9A8] mx-auto rounded-full"></div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, idx) => (
            <div
              key={idx}
              className="bg-[#F3F4F6] rounded-xl shadow-sm p-6 text-left flex flex-col justify-between h-full"
            >
              <p className="text-gray-700 italic mb-4">
                {translations[`testimonial${idx + 1}Message`] || testimonial.message}
              </p>
              <div>
                <p className="font-semibold text-[#00332D] mb-1">
                  {translations[`testimonial${idx + 1}Name`] || testimonial.name}
                </p>
                <div className="flex gap-1 text-[#77D4B4]">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      fill={i < testimonial.rating ? "#77D4B4" : "none"}
                      stroke="#77D4B4"
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
