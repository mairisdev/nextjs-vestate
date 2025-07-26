import Image from "next/image"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import Navbar from "../../components/Navbar"
import { GraduationCap, Home, BookOpen, Calendar, User, ArrowRight, FileText } from "lucide-react"

// Definē vienotu tipu kombinētajiem blog ierakstiem
interface CombinedBlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  source: 'legacy' | 'content'
  href: string
  publishedDate: string
  featuredImage: string | null
  author?: string | null
  tags?: string[]
  shortDescription?: string | null
}

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

async function getBlogContent() {
  try {
    const content = await prisma.content.findMany({
      where: {
        type: "BLOG",
        published: true
      },
      orderBy: { publishedAt: "desc" },
      take: 6
    })
    return content
  } catch (error) {
    console.error("Error fetching blog content:", error)
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
  const [blogPosts, educationalContent, villagesContent, blogContent] = await Promise.all([
    getBlogPosts(),
    getEducationalContent(), 
    getVillagesContent(),
    getBlogContent()
  ])

  // Kombinē gan vecos blog ierakstus, gan jaunos Content BLOG ierakstus ar precīziem tipiem
  const allBlogPosts: CombinedBlogPost[] = [
    // Vecie BlogPost ieraksti
    ...blogPosts.map(post => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      source: 'legacy' as const,
      href: `/blog/${post.slug}`,
      publishedDate: post.date,
      featuredImage: post.imageUrl,
      shortDescription: post.shortDescription || null,
      author: null,
      tags: []
    })),
    // Jaunie Content BLOG ieraksti
    ...blogContent.map(content => ({
      id: content.id,
      title: content.title,
      slug: content.slug,
      excerpt: content.excerpt,
      source: 'content' as const,
      href: `/blog/content/${content.slug}`,
      publishedDate: content.publishedAt ? new Date(content.publishedAt).toLocaleDateString('lv-LV') : '',
      featuredImage: content.featuredImage,
      author: content.author,
      tags: content.tags,
      shortDescription: content.excerpt
    }))
  ].sort((a, b) => {
    const dateA = new Date(a.publishedDate).getTime()
    const dateB = new Date(b.publishedDate).getTime()
    return dateB - dateA
  })

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
        
        {/* Blog Posts Section - Kombinēti visi blog ieraksti */}
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

          {allBlogPosts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {allBlogPosts.slice(0, 6).map((post) => (
                <Link
                  key={`${post.source}-${post.id}`}
                  href={post.href}
                  className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
                >
                  {post.featuredImage && (
                    <div className="relative h-48">
                      <Image
                        src={post.featuredImage}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {/* Badge lai parādītu avotu */}
                      <div className="absolute top-3 left-3">
                        <div className="flex items-center px-2 py-1 bg-[#77D4B4]/90 text-white rounded-full text-xs font-medium">
                          {post.source === 'content' ? (
                            <>
                              <FileText className="w-3 h-3 mr-1" />
                              Jauns
                            </>
                          ) : (
                            <>
                              <BookOpen className="w-3 h-3 mr-1" />
                              Klasiskais
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      {post.source === 'content' && post.author && (
                        <>
                          <User className="w-4 h-4 mr-2" />
                          {post.author}
                          <span className="mx-2">•</span>
                        </>
                      )}
                      <Calendar className="w-4 h-4 mr-2" />
                      {post.publishedDate}
                    </div>
                    <h3 className="text-lg font-semibold text-[#00332D] mb-3 group-hover:text-[#77D4B4] transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {post.excerpt.length > 120 ? post.excerpt.slice(0, 120) + "..." : post.excerpt}
                    </p>
                    {/* Parādi tagus tikai Content ierakstiem */}
                    {post.source === 'content' && post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {post.tags.slice(0, 3).map((tag: string, index: number) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-[#77D4B4]/10 text-[#00332D] text-xs rounded-full"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl">
              <div className="w-16 h-16 bg-[#77D4B4]/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-[#77D4B4]" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Vēl nav bloga rakstu</h3>
              <p className="text-gray-600 mb-6">Bloga raksti tiks publicēti drīzumā!</p>
            </div>
          )}
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

          {educationalContent.length > 0 ? (
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
                        {content.tags.slice(0, 3).map((tag: string, index: number) => (
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
          ) : (
            <div className="text-center py-12 bg-white rounded-xl">
              <div className="w-16 h-16 bg-[#77D4B4]/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="w-8 h-8 text-[#77D4B4]" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Vēl nav izglītojošā satura</h3>
              <p className="text-gray-600">Drīzumā šeit būs pieejami padomi un zināšanas!</p>
            </div>
          )}
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

          {villagesContent.length > 0 ? (
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
                        {content.tags.slice(0, 3).map((tag: string, index: number) => (
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
          ) : (
            <div className="text-center py-12 bg-white rounded-xl">
              <div className="w-16 h-16 bg-[#77D4B4]/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Home className="w-8 h-8 text-[#77D4B4]" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Vēl nav ciematu aprakstu</h3>
              <p className="text-gray-600">Drīzumā šeit būs pieejami stāsti par Latvijas ciematiem!</p>
            </div>
          )}
        </section>

        {/* Global empty state - kad nav nekāda satura */}
        {allBlogPosts.length === 0 && educationalContent.length === 0 && villagesContent.length === 0 && (
          <div className="text-center py-20">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Saturs tiek gatavots</h3>
            <p className="text-gray-600">Drīzumā šeit būs pieejami interesanti raksti un pamācības!</p>
          </div>
        )}

      </div>
    </div>
  )
}