import Image from "next/image"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import Navbar from "../../../components/Navbar"
import { Calendar, ArrowLeft, Home, User, Tag, MapPin } from "lucide-react"

async function getVillagesContent() {
  try {
    const content = await prisma.content.findMany({
      where: {
        type: "VILLAGES",
        published: true
      },
      orderBy: { publishedAt: "desc" }
    })
    return content
  } catch (error) {
    console.error("Error fetching villages content:", error)
    return []
  }
}

export default async function VillagesContentPage() {
  const villagesContent = await getVillagesContent()

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-[#00332D]">Sākums</Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-[#00332D]">Visi ieraksti</Link>
            <span>/</span>
            <span className="text-gray-900">Ciemati</span>
          </div>
        </div>
      </div>

      {/* Header */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center space-x-4 mb-4">
            <Link href="/blog" className="text-[#00332D] hover:text-[#77D4B4] transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-[#77D4B4] rounded-lg">
                <Home className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-[#00332D]">Ciemati</h1>
                <p className="text-gray-600 mt-2">Iepazīstiet Latvijas skaistākās vietas un to nekustamo īpašumu iespējas</p>
              </div>
            </div>
          </div>
          
          <div className="text-sm text-gray-500">
            Atrasti {villagesContent.length} raksti
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          {villagesContent.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {villagesContent.map((content) => (
                <article
                  key={content.id}
                  className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
                >
                  <Link href={`/blog/ciemati/${content.slug}`}>
                    {content.featuredImage && (
                      <div className="relative h-56">
                        <Image
                          src={content.featuredImage}
                          alt={content.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        
                        {/* Location badge */}
                        <div className="absolute top-3 left-3">
                          <div className="flex items-center px-2 py-1 bg-green-600/90 text-white rounded-full text-xs font-medium">
                            <MapPin className="w-3 h-3 mr-1" />
                            Ciemats
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="p-6">
                      <div className="flex items-center text-sm text-gray-500 mb-3">
                          <User className="w-4 h-4 mr-2" />
                          {content.author || "Vestate"}
                          {content.publishedAt && (
                            <>
                              <span className="mx-2">•</span>
                              <Calendar className="w-4 h-4 mr-1" />
                              {new Date(content.publishedAt).toLocaleDateString('lv-LV')}
                            </>
                          )}
                        </div>
                      
                      <h2 className="text-xl font-semibold text-[#00332D] mb-3 group-hover:text-[#77D4B4] transition-colors line-clamp-2">
                        {content.title}
                      </h2>
                      
                      <p className="text-gray-600 leading-relaxed line-clamp-3 mb-4">
                        {content.excerpt}
                      </p>

                      {/* Tags */}
                      {content.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {content.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                            >
                              <Tag className="w-3 h-3 mr-1" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex items-center text-[#00332D] group-hover:text-[#77D4B4] transition-colors">
                        <span className="text-sm font-medium">Lasīt vairāk</span>
                        <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-[#77D4B4]/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Home className="w-8 h-8 text-[#77D4B4]" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Vēl nav ciematu aprakstu</h3>
            <p className="text-gray-600 mb-6">Drīzumā šeit būs pieejami interesanti stāsti par Latvijas ciematiem!</p>
            <Link 
              href="/blog"
              className="inline-flex items-center px-4 py-2 bg-[#00332D] text-white rounded-lg hover:bg-[#004940] transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Atpakaļ uz blogu
            </Link>
          </div>
          )}
        </div>
      </section>

      {/* Featured section */}
      {villagesContent.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-[#00332D] mb-4">
                Meklējat īpašumu kādā no šiem ciematiem?
              </h2>
              <p className="text-gray-600 mb-6">
                Mūsu eksperti pārzina lokālo tirgu un palīdzēs atrast ideālo īpašumu jūsu izvēlētajā vietā
              </p>
              <Link
                href="#kontakti"
                className="inline-flex items-center px-6 py-3 bg-[#77D4B4] text-white rounded-lg hover:bg-[#66C5A8] transition-colors"
              >
                Saņemt konsultāciju
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

export const metadata = {
  title: "Ciemati | Vestate",
  description: "Iepazīstiet Latvijas skaistākās vietas un to nekustamo īpašumu iespējas. Atklājiet ciematus, kuros vēlaties dzīvot.",
}