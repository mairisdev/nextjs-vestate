import Image from "next/image"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import Navbar from "../components/Navbar"
import { GraduationCap, Home, BookOpen, Calendar, User, ArrowRight } from "lucide-react"

async function getBlogPosts() {
  try {
    const posts = await prisma.blogPost.findMany({
      orderBy: { date: "desc" },
      take: 6 // Parādi tikai 6 jaunākos
    })
    return posts
  } catch (error) {
    console.error("Error fetching blog posts:", error)
    return []
  }
}

async function getEducationalContent() {
  try {
    const content = await prisma.content.findMany({
      where: {
        type: "EDUCATIONAL",
        published: true
      },
      orderBy: { publishedAt: "desc" },
      take: 6
    })
    return content
  } catch (error) {
    console.error("Error fetching educational content:", error)
    return []
  }
}

async function getVillagesContent() {
  try {
    const content = await prisma.content.findMany({
      where: {
        type: "VILLAGES", 
        published: true
      },
      orderBy: { publishedAt: "desc" },
      take: 6
    })
    return content
  } catch (error) {
    console.error("Error fetching villages content:", error)
    return []
  }
}

export default async function BlogMainPage() {
  const [blogPosts, educationalContent, villagesContent] = await Promise.all([
    getBlogPosts(),
    getEducationalContent(), 
    getVillagesContent()
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#00332D] to-[#004940] text-white py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Zināšanas un iedvesma nekustamo īpašumu pasaulē
          </h1>
          <p className="text-xl text-gray-200 max-w-3xl mx-auto">
            Atklājiet noderīgus padomus, izglītojošu saturu un uzziniet vairāk par Latvijas skaistākajiem ciematiem
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-16">
        
        {/* Blog Posts Section */}
        <section className="mb-20">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-[#77D4B4] rounded-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-[#00332D]">Bloga raksti</h2>
                <p className="text-gray-600">Jaunākās ziņas un aktualitātes</p>
              </div>
            </div>
            <Link 
              href="/blog/raksti" 
              className="flex items-center text-[#00332D] hover:text-[#77D4B4] transition-colors"
            >
              Skatīt visus <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
              >
                <div className="relative h-48">
                  <Image
                    src={post.imageUrl}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <Calendar className="w-4 h-4 mr-2" />
                    {post.date}
                  </div>
                  <h3 className="text-lg font-semibold text-[#00332D] mb-3 group-hover:text-[#77D4B4] transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {post.excerpt.length > 120 ? post.excerpt.slice(0, 120) + "..." : post.excerpt}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Educational Content Section */}
        <section className="mb-20">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-[#77D4B4] rounded-lg">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-[#00332D]">Izglītojošais saturs</h2>
                <p className="text-gray-600">Padomi un zināšanas īpašumu jomā</p>
              </div>
            </div>
            <Link 
              href="/blog/izglitojosais" 
              className="flex items-center text-[#00332D] hover:text-[#77D4B4] transition-colors"
            >
              Skatīt visus <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {educationalContent.map((content) => (
              <Link
                key={content.id}
                href={`/blog/izglitojosais/${content.slug}`}
                className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
              >
                {content.featuredImage && (
                  <div className="relative h-48">
                    <Image
                      src={content.featuredImage}
                      alt={content.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
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
                  <h3 className="text-lg font-semibold text-[#00332D] mb-3 group-hover:text-[#77D4B4] transition-colors">
                    {content.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {content.excerpt.length > 120 ? content.excerpt.slice(0, 120) + "..." : content.excerpt}
                  </p>
                  {content.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {content.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Villages Section */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-[#77D4B4] rounded-lg">
                <Home className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-[#00332D]">Ciemati</h2>
                <p className="text-gray-600">Iepazīstiet Latvijas skaistākās vietas</p>
              </div>
            </div>
            <Link 
              href="/blog/ciemati" 
              className="flex items-center text-[#00332D] hover:text-[#77D4B4] transition-colors"
            >
              Skatīt visus <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {villagesContent.map((content) => (
              <Link
                key={content.id}
                href={`/blog/ciemati/${content.slug}`}
                className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
              >
                {content.featuredImage && (
                  <div className="relative h-48">
                    <Image
                      src={content.featuredImage}
                      alt={content.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
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
                  <h3 className="text-lg font-semibold text-[#00332D] mb-3 group-hover:text-[#77D4B4] transition-colors">
                    {content.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {content.excerpt.length > 120 ? content.excerpt.slice(0, 120) + "..." : content.excerpt}
                  </p>
                  {content.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {content.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Empty state messages */}
        {blogPosts.length === 0 && educationalContent.length === 0 && villagesContent.length === 0 && (
          <div className="text-center py-20">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Saturs tiek gatavots</h3>
            <p className="text-gray-600">Drīzumā šeit būs pieejami interesanti raksti un pamācības!</p>
          </div>
        )}

      </div>
    </div>
  )
}