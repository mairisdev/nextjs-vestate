'use client'

import Image from 'next/image'
import { CalendarCheck, MapPinHouse } from 'lucide-react'

const events = [
  {
    date: '09/05 – 26/05',
    subtitle: 'Ice Hockey',
    title: '2025 IIHF World Championship',
    location: 'Stockholm / Denmark',
    icon: '/ice-hockey.png',
    image: 'https://sdkthunder.com/wp-content/uploads/2025/04/Untitled.jpg',
  },
  {
    date: '27/08 – 14/09/2025',
    subtitle: 'FIBA EuroBasket 2025',
    title: '2025. gada Eiropas vīriešu basketbola čempionāts',
    location: 'Rīga, Latvija',
    icon: '/basketball.png',
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
              className="bg-white rounded-3xl shadow-xl overflow-hidden"
            >

              {/* Top info bar */}
              <div className="bg-[#BF3131] text-white flex items-center justify-between px-4 h-12 text-[13px] overflow-x-auto whitespace-nowrap gap-4">
                <div className="flex items-center">
                  <CalendarCheck className="w-4 h-4 mb-0.5 mr-1" />
                  <span>{event.date}</span>
                </div>
                <div className="flex items-center">
                  <MapPinHouse className="w-4 h-4 mr-1" />
                  <span>{event.location}</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 md:p-8 flex flex-col sm:flex-row items-center gap-6">
                {/* Sport icon */}
                <div className="w-14 h-14 flex-shrink-0">
                  <Image
                    src={event.icon}
                    alt={event.subtitle}
                    width={56}
                    height={56}
                    className="object-contain"
                  />
                </div>

                {/* Text block */}
                <div className="flex-grow text-center sm:text-left">
                  <p className="text-sm font-medium text-[#BF3131] uppercase mb-1">
                    {event.subtitle}
                  </p>
                  <h3 className="text-xl md:text-2xl font-bold text-[#223645] leading-snug">
                    {event.title}
                  </h3>
                </div>

                {/* Right logo image */}
                <div className="w-40 h-50 md:w-70 md:h-40 bg-white rounded-xl shadow flex items-center justify-center">
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
