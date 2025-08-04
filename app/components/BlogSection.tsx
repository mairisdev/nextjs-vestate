import Image from "next/image"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Calendar, User, BookOpen, GraduationCap, Home, FileText } from "lucide-react"

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
  type: 'BLOG' | 'EDUCATIONAL' | 'VILLAGES' | 'LEGACY'
  categoryLabel: string
  categoryIcon: React.ReactNode
}

// Helper function to get category info
const getCategoryInfo = (type: string) => {
  switch (type) {
    case 'BLOG':
      return {
        label: 'Bloga raksts',
        icon: <FileText className="w-4 h-4" />
      }
    case 'EDUCATIONAL':
      return {
        label: 'Izglītojošais saturs',
        icon: <GraduationCap className="w-4 h-4" />
      }
    case 'VILLAGES':
      return {
        label: 'Ciemats',
        icon: <Home className="w-4 h-4" />
      }
    case 'LEGACY':
      return {
        label: 'Bloga raksts',
        icon: <BookOpen className="w-4 h-4" />
      }
    default:
      return {
        label: 'Raksts',
        icon: <FileText className="w-4 h-4" />
      }
  }
}

async function getAllBlogContent() {
  try {
    // Iegūstam vecos blog ierakstus
    const legacyBlogPosts = await prisma.blogPost.findMany({
      orderBy: { date: "desc" },
      take: 6
    })

    // Iegūstam jaunos content ierakstus (visus tipus)
    const contentPosts = await prisma.content.findMany({
      where: {
        type: { in: ["BLOG", "EDUCATIONAL", "VILLAGES"] },
        published: true
      },
      orderBy: { publishedAt: "desc" },
      take: 6
    })

    // Kombinējam abas grupas
    const combined: CombinedBlogPost[] = [
      // Vecie blog ieraksti
      ...legacyBlogPosts.map(post => {
        const categoryInfo = getCategoryInfo('LEGACY')
        return {
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
          tags: [],
          type: 'LEGACY' as const,
          categoryLabel: categoryInfo.label,
          categoryIcon: categoryInfo.icon
        }
      }),
      // Jaunie content ieraksti
      ...contentPosts.map(content => {
        const categoryInfo = getCategoryInfo(content.type)
        return {
          id: content.id,
          title: content.title,
          slug: content.slug,
          excerpt: content.excerpt,
          source: 'content' as const,
          href: content.type === 'BLOG' 
            ? `/blog/content/${content.slug}`
            : content.type === 'EDUCATIONAL'
            ? `/blog/content/${content.slug}`
            : `/blog/content/${content.slug}`,
          publishedDate: content.publishedAt 
            ? new Date(content.publishedAt).toLocaleDateString('lv-LV') 
            : '',
          featuredImage: content.featuredImage,
          author: content.author,
          tags: content.tags || [],
          type: content.type as 'BLOG' | 'EDUCATIONAL' | 'VILLAGES',
          categoryLabel: categoryInfo.label,
          categoryIcon: categoryInfo.icon
        }
      })
    ]

    // Kārtojam pēc datuma (jaunākie pirmie) un ņemam tikai 6
    return combined
      .sort((a, b) => {
        const dateA = new Date(a.publishedDate || '1970-01-01').getTime()
        const dateB = new Date(b.publishedDate || '1970-01-01').getTime()
        return dateB - dateA
      })
      .slice(0, 6)

  } catch (error) {
    console.error("Error fetching blog content:", error)
    return []
  }
}

export default async function BlogSection() {
  const blogPosts = await getAllBlogContent()

  return (
    <section id="jaunakie-ieraksti" className="py-20 px-4 md:px-12 bg-white">
      <div className="max-w-7xl mx-auto text-center">
        <p className="text-md uppercase text-[#77D4B4] font-semibold tracking-wide mb-2">
          Jaunākie raksti
        </p>
        <Link href="/blog">
          <h2 className="text-3xl md:text-4xl font-bold text-[#00332D] mb-12 hover:text-[#77D4B4] transition-colors cursor-pointer">
            Bloga un izglītojošie raksti
          </h2>
        </Link>

        {blogPosts.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <Link
                key={post.id}
                href={post.href}
                className="group block bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100"
              >
                {/* Category Badge */}
                <div className="absolute top-4 left-4 z-10">
                  <div className="inline-flex items-center px-3 py-1 bg-white/90 backdrop-blur-sm text-[#00332D] rounded-full text-sm font-medium shadow-sm">
                    {post.categoryIcon}
                    <span className="ml-2">{post.categoryLabel}</span>
                  </div>
                </div>

                {/* Image */}
                <div className="relative w-full h-52 bg-gray-100">
                  {post.featuredImage ? (
                    <Image
                      src={post.featuredImage}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#77D4B4]/20 to-[#00332D]/20">
                      {post.categoryIcon}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6 text-left">
                  {/* Meta info */}
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    {post.author && (
                      <>
                        <User className="w-4 h-4 mr-1" />
                        <span className="mr-3">{post.author}</span>
                      </>
                    )}
                    {post.publishedDate && (
                      <>
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>{post.publishedDate}</span>
                      </>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-semibold text-[#00332D] mb-3 group-hover:text-[#77D4B4] transition-colors line-clamp-2">
                    {post.title}
                  </h3>

                  {/* Excerpt */}
                  <p className="text-sm text-gray-700 mb-4 line-clamp-3">
                    {post.excerpt.length > 150 
                      ? post.excerpt.slice(0, 150) + "..." 
                      : post.excerpt
                    }
                  </p>

                  {/* Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.slice(0, 2).map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-[#77D4B4]/10 text-[#00332D] text-xs rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Read more */}
                  <span className="text-[#77D4B4] text-sm font-medium group-hover:underline inline-flex items-center">
                    Lasīt vairāk
                    <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Vēl nav publicēts saturs</h3>
            <p className="text-gray-600">Bloga raksti un izglītojošais saturs tiks publicēts drīzumā!</p>
          </div>
        )}

        {/* View All Button */}
        {blogPosts.length > 0 && (
          <div className="mt-12">
            <Link
              href="/blog"
              className="inline-flex items-center px-6 py-3 bg-[#00332D] text-white rounded-lg hover:bg-[#004940] transition-colors font-medium"
            >
              Apskatīt visus rakstus
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}