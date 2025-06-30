import Image from "next/image"
import { CheckCheck } from "lucide-react"
import { getWhyChooseUs } from "@/lib/queries/whyChooseUs"
import { ReactElement, JSXElementConstructor, ReactNode, ReactPortal, Key } from "react"

export default async function WhyChooseUs() {
  const data = await getWhyChooseUs()

  if (!data) return null

  return (
    <section className="relative py-20 px-4 md:px-12 bg-white overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto grid md:grid-cols-2 gap-14 items-center">
        <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg p-8 max-w-[500px]">
          <h2 className="text-3xl md:text-4xl font-bold text-[#00332D] mb-6 leading-tight">
            {data.title}
          </h2>
          <ul className="space-y-4 text-[#00332D] text-lg">
            {data.points.map((item: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined, i: Key | null | undefined) => (
              <li key={i} className="flex items-start gap-3">
                <CheckCheck className="mt-1 w-5 h-5 text-[#00332D]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <button className="mt-8 bg-[#00332D] text-white px-6 py-3 rounded-lg hover:bg-[#00443B] transition">
            {data.buttonText}
          </button>
        </div>

        <div className="relative w-full h-[300px] md:h-[500px]">
          <Image
            src={data.imageUrl}
            alt="Kāpēc izvēlēties mūs?"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>
    </section>
  )
}
