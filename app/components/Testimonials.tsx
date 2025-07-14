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
        <h2 className="text-3xl font-bold text-[#00332D] mb-4">
          {translations.defaultHeading}
        </h2>
        <p className="text-gray-600 mb-12">
          {translations.defaultSubheading}
        </p>

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
