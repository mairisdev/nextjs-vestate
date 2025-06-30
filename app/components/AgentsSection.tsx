import Image from "next/image"
import { ChevronDown } from "lucide-react"
import { getAgents } from "@/lib/queries/agents"

export default async function AgentsSection() {
  const agents = await getAgents()

  if (!agents || agents.length === 0) return null

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
            className="bg-white rounded-2xl shadow-md transition-all duration-300 ease-in-out flex flex-col"
          >
            {agent.image && (
            <Image
              src={agent.image}
              alt={agent.name}
              width={400}
              height={400}
              className="w-full h-[300px] object-cover"
            />
            )}
            <div className="p-4 text-[#00332D] flex flex-col flex-grow justify-between">
              <div>
                <h3 className="text-lg font-semibold">{agent.name}</h3>
                <p className="text-sm">{agent.title}</p>
                <p className="text-sm text-gray-500 mt-1">{agent.phone}</p>
              </div>

              {agent.reviews.length > 0 && (
                <details className="mt-4 text-sm group">
                  <summary className="cursor-pointer flex items-center gap-2 text-white bg-[#00332D] hover:bg-[#00443B] transition rounded-xl py-2 px-4">
                    Atsauksmes
                    <ChevronDown
                      size={16}
                      className="transition-transform group-open:rotate-180"
                    />
                  </summary>
                  <div className="mt-2 space-y-1 text-gray-700 bg-gray-100 p-3 rounded-md">
                    {agent.reviews.map((review: string, i: number) => (
                      <p key={i} className="text-xs">&quot;{review}&quot;</p>
                    ))}
                  </div>
                </details>
              )}
            </div>
          </div>
          ))}
        </div>
      </div>
    </section>
  )
}