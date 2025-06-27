"use client"
import { useState } from 'react'
import Image from 'next/image'
import { ChevronDown } from 'lucide-react'

const agents = [
  {
    name: 'Vineta Villere',
    title: 'Nekustamo īpašumu speciālists',
    phone: '+371 28 446 677',
    image: '/agents/VinetaVillere.webp',
    reviews: []
  },
  {
    name: 'Natalja Viļuma',
    title: 'Nekustamo īpašumu speciālists',
    phone: '+371 29 820 890',
    image: '/agents/NatalijaViluma.webp',
    reviews: []
  },
  {
    name: 'Svetlana Akmane',
    title: 'Nekustamo īpašumu speciālists',
    phone: '+371 26 408 884',
    image: '/agents/SvetlanaAkmane.webp',
    reviews: []
  },
  {
    name: 'Svetlana Dzalbe',
    title: 'Nekustamo īpašumu speciālists',
    phone: '+371 26 767 254',
    image: '/agents/SvetlanaDzalbe.webp',
    reviews: []
  }
]

export default function AgentCards() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx)
  }

  return (
    <section className="py-20 px-4 md:px-12 bg-[#F3F4F6]">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-[#00332D] mb-12">
          Mūsu aģenti
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {agents.map((agent, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl shadow-md overflow-hidden transition-all duration-300 ease-in-out"
              style={{
                height: openIndex === idx ? 'auto' : '460px'
              }}
            >
              <Image
                src={agent.image}
                alt={agent.name}
                width={400}
                height={400}
                className="w-full h-[300px] object-cover"
              />
              <div className="p-4 text-[#00332D] flex flex-col justify-between h-[160px]">
                <div>
                  <h3 className="text-lg font-semibold">{agent.name}</h3>
                  <p className="text-sm">{agent.title}</p>
                  <p className="text-sm text-gray-500 mt-1">{agent.phone}</p>
                </div>
                
                <button
                  onClick={() => toggle(idx)}
                  className="mt-4 w-full flex items-center justify-center gap-2 text-white bg-[#00332D] hover:bg-[#00443B] transition rounded-xl py-2 text-sm"
                >
                  Atsauksmes <ChevronDown className={`transition-transform ${openIndex === idx ? 'rotate-180' : ''}`} size={16} />
                </button>
              </div>
              
              {/* Reviews section with smooth animation */}
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                openIndex === idx ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}>
                <div className="px-4 pb-4 border-t pt-3 space-y-2 text-sm text-gray-700">
                  {agent.reviews.length > 0 ? (
                    agent.reviews.map((r, i) => <p key={i}>"{r}"</p>)
                  ) : (
                    <p>Nav pievienotu atsauksmju.</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}