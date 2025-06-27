"use client"

import { Star } from "lucide-react"

const testimonials = [
  {
    name: "Aleksandra Pticińa",
    comment: "Мы очень рекомендуем «Vestate Latvija», отлично справились с нашей продажей! Достаточно быстро всё продали! 🤩👍",
    rating: 5,
  },
  {
    name: "Alena Kraveca",
    comment: "Ļoti viss apmierina. Palīdzēja pārdot un arī palīdzēja atrast dzīvokli pirkšanai tieši tādu kā meklējām. Par dokumentu noformēšanu nav jāsatraucas, jo viss tiek sagatavots pareizi. Vienmēr paskaidros kāpēc tā un ne savādāk. Iesaku ja vajag pārdot vai nopirkt dzīvokli.",
    rating: 5,
  },
  {
    name: "Olga Leksina",
    comment: "I was looking for a place to live in Riga and the real estate agent, Vineta help me to find a good place. She replied quite immediately to my first message and it was very convenient to talk to her (use Facebook or WhatsApp) Thanks a lot!",
    rating: 5,
  },
]

export default function TestimonialsSection() {
  return (
    <section className="py-20 px-4 md:px-12 bg-white">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-[#00332D] mb-4">
          Ko klienti saka par mums
        </h2>
        <p className="text-gray-600 mb-12">
          Mēs augstu vērtējam katra klienta viedokli — lūk, daži no tiem:
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="bg-[#F3F4F6] rounded-xl shadow-sm p-6 text-left flex flex-col justify-between h-full"
            >
              <p className="text-gray-700 italic mb-4">{t.comment}</p>
              <div>
                <p className="font-semibold text-[#00332D] mb-1">{t.name}</p>
                <div className="flex gap-1 text-[#77D4B4]">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      fill={i < t.rating ? "#77D4B4" : "none"}
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
