import Image from "next/image"
import { CheckCheck } from "lucide-react"
import { getWhyChooseUs } from "@/lib/queries/whyChooseUs"
import {
  ReactElement,
  JSXElementConstructor,
  ReactNode,
  ReactPortal,
  Key,
} from "react"

export default async function WhyChooseUs() {
  const data = await getWhyChooseUs()

  if (!data) return null

  return (
<section id="kapec-mes" className="relative py-16 sm:py-20 px-6 sm:px-12 bg-white overflow-hidden">
  <div className="relative z-10 max-w-7xl mx-auto flex flex-col sm:flex-row items-center gap-12 sm:gap-20">
    {/* Teksta bloks */}
    <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg p-8 sm:max-w-[500px] w-full">
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#00332D] mb-6 leading-tight">
            {data.title}
          </h2>
          <ul className="space-y-4 text-[#00332D] text-lg sm:text-xl">
            {data.points.map(
              (
                item:
                  | string
                  | number
                  | bigint
                  | boolean
                  | ReactElement<
                      unknown,
                      string | JSXElementConstructor<any>
                    >
                  | Iterable<ReactNode>
                  | ReactPortal
                  | Promise<
                      | string
                      | number
                      | bigint
                      | boolean
                      | ReactPortal
                      | ReactElement<
                          unknown,
                          string | JSXElementConstructor<any>
                        >
                      | Iterable<ReactNode>
                      | null
                      | undefined
                    >
                  | null
                  | undefined,
                i: Key | null | undefined
              ) => (
            <li key={i} className="flex items-start gap-4 sm:gap-3">
              <CheckCheck className="mt-1 w-5 h-5 text-[#00332D]" />
              <span>{item}</span>
            </li>
              )
            )}
          </ul>
          <button className="mt-8 bg-[#00332D] text-white px-6 py-3 rounded-lg hover:bg-[#00443B] transition transform hover:scale-105">
            {data.buttonText}
          </button>
        </div>

        {/* Bildes bloks */}
        <div className="relative w-full flex-grow aspect-[3/2] sm:aspect-[4/3] rounded-xl overflow-hidden">
          <Image
            src={data.imageUrl}
            alt="Kāpēc izvēlēties mūs?"
            fill
            className="object-cover rounded-xl"
            priority
          />
        </div>
      </div>
    </section>
  )
}
