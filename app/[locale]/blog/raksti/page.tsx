import Image from "next/image"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import Navbar from "../../../components/Navbar"
import { Calendar, ArrowLeft, BookOpen, FileText, User } from "lucide-react"

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

async function getAllBlogPosts() {
  try {
    const posts = await prisma.blogPost.findMany({
      orderBy: { date: "desc" }
    })
    return posts
  } catch (error) {
    console.error("Error fetching blog posts:", error)
    return []
  }
}

async function getAllBlogContent() {
  try {
    const content = await prisma.content.findMany({
      where: {
        type: "BLOG",
        published: true
      },
      orderBy: { publishedAt: "desc" }
    })
    return content
  } catch (error) {
    console.error("Error fetching blog content:", error)
    return []
  }
}

export default async function BlogPostsPage() {
  const [blogPosts, blogContent] = await Promise.all([
    getAllBlogPosts(),
    getAllBlogContent()
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
      
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-[#00332D]">Sākums</Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-[#00332D]">Blog</Link>
            <span>/</span>
            <span className="text-gray-900">Raksti</span>
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
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-[#00332D]">Bloga raksti</h1>
                <p className="text-gray-600 mt-2">Jaunākās ziņas un aktualitātes nekustamo īpašumu pasaulē</p>
              </div>
            </div>
          </div>
          
          <div className="text-sm text-gray-500">
            Atrasti {allBlogPosts.length} raksti
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          {allBlogPosts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {allBlogPosts.map((post) => (
                <article
                  key={`${post.source}-${post.id}`}
                  className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
                >
                  <Link href={post.href}>
                    {post.featuredImage && (
                      <div className="relative h-56">
                        <Image
                          src={post.featuredImage}
                          alt={post.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        
                        {/* Badge lai parādītu avotu un tipu */}
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
                      {/* Meta informācija */}
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
                      
                      {/* Virsraksts */}
                      <h2 className="text-xl font-semibold text-[#00332D] mb-3 group-hover:text-[#77D4B4] transition-colors line-clamp-2">
                        {post.title}
                      </h2>
                      
                      {/* Apraksts */}
                      <p className="text-gray-600 leading-relaxed line-clamp-3 mb-4">
                        {post.shortDescription || post.excerpt}
                      </p>

                      {/* Tagi - tikai Content ierakstiem */}
                      {post.source === 'content' && post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {post.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-[#77D4B4]/10 text-[#00332D] text-xs rounded-full"
                            >
                              #{tag}
                            </span>
                          ))}
                          {post.tags.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                              +{post.tags.length - 3} vairāk
                            </span>
                          )}
                        </div>
                      )}
                      
                      {/* Read more link */}
                      <div className="mt-4 flex items-center text-[#00332D] group-hover:text-[#77D4B4] transition-colors">
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
            /* Empty State */
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Vēl nav rakstu</h3>
              <p className="text-gray-600 mb-6">Bloga raksti tiks publicēti drīzumā!</p>
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

      {/* CTA Section - ja ir kāds saturs */}
      {allBlogPosts.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-[#00332D] mb-4">
                Vai jums ir jautājumi par nekustamo īpašumu tirgu?
              </h2>
              <p className="text-gray-600 mb-6">
                Sazinieties ar mūsu ekspertiem personalizētai konsultācijai
              </p>
              <Link
                href="/#kontakti"
                className="inline-flex items-center px-6 py-3 bg-[#77D4B4] text-white rounded-lg hover:bg-[#66C5A8] transition-colors"
              >
                Sazināties ar mums
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Statistics/Info section - ja ir daudz rakstu */}
      {allBlogPosts.length > 6 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-2xl font-bold text-[#00332D] mb-2">
                  {allBlogPosts.length}
                </div>
                <div className="text-gray-600">Raksti kopā</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-[#00332D] mb-2">
                  {blogContent.length}
                </div>
                <div className="text-gray-600">Jauni raksti</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-[#00332D] mb-2">
                  {blogPosts.length}
                </div>
                <div className="text-gray-600">Klasiskie raksti</div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

export const metadata = {
  title: "Bloga raksti | Vestate",
  description: "Jaunākās ziņas un aktualitātes nekustamo īpašumu pasaulē. Ekspertu padomi un tirgus analīze.",
}