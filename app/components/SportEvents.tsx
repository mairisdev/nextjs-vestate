'use client'

import Image from 'next/image'
import { CalendarDays, MapPin } from 'lucide-react'

const events = [
  {
    date: '9/05 – 26/05/2025',
    subtitle: 'Ice Hockey',
    title: '2025 IIHF World Championship',
    location: 'Stockholm/Sweden – Herning/Denmark',
    logo: '/ice-hockey.png',
    image: 'https://sdkthunder.com/wp-content/uploads/2025/04/Untitled.jpg',
  },
  {
    date: '27/08 – 14/09/2025',
    subtitle: 'FIBA EuroBasket 2025',
    title: '2025. gada Eiropas vīriešu basketbola čempionāts',
    location: 'Rīga, Latvija',
    logo: '/basketball.png',
    image: 'https://sdkthunder.com/wp-content/uploads/2025/04/Untitled.png',
  },
]

export default function SportEvents() {
  return (
    <section className="bg-[#f8f8f8] py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-extrabold text-center mb-16 text-[#223645]">
          Tuvākie sporta <span className="text-[#BF3131]">notikumi</span>
        </h2>

        <div className="grid lg:grid-cols-2 gap-10">
          {events.map((event, idx) => (
            <div
              key={idx}
              className="relative bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all overflow-hidden"
            >
              {/* Red top stripe */}
              <div className="bg-[#BF3131] text-white flex justify-between items-center px-4 h-[40px] text-[15px] font-medium">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4" />
                  <span>{event.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{event.location}</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 md:p-8 flex items-center gap-6">
                {/* Sport icon */}
                <div className="w-14 h-14 flex-shrink-0">
                  <Image
                    src={event.logo}
                    alt={event.subtitle}
                    width={56}
                    height={56}
                    className="object-contain"
                  />
                </div>

                {/* Text block */}
                <div className="flex-grow text-left">
                  <p className="text-sm font-medium text-[#BF3131] uppercase mb-1">
                    {event.subtitle}
                  </p>
                  <h3 className="text-xl md:text-2xl font-bold text-[#223645] leading-snug">
                    {event.title}
                  </h3>
                </div>

                {/* Right side image */}
                <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-xl p-2 shadow">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
