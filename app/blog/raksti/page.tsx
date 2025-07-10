import Image from "next/image"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import Navbar from "../../components/Navbar"
import { Calendar, ArrowLeft, BookOpen } from "lucide-react"

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

export default async function BlogPostsPage() {
  const blogPosts = await getAllBlogPosts()

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
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
            Atrasti {blogPosts.length} raksti
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          {blogPosts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.map((post) => (
                <article
                  key={post.id}
                  className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
                >
                  <Link href={`/blog/${post.slug}`}>
                    <div className="relative h-56">
                      <Image
                        src={post.imageUrl}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    
                    <div className="p-6">
                      <div className="flex items-center text-sm text-gray-500 mb-3">
                        <Calendar className="w-4 h-4 mr-2" />
                        {post.date}
                      </div>
                      
                      <h2 className="text-xl font-semibold text-[#00332D] mb-3 group-hover:text-[#77D4B4] transition-colors line-clamp-2">
                        {post.title}
                      </h2>
                      
                      <p className="text-gray-600 leading-relaxed line-clamp-3">
                        {post.excerpt}
                      </p>
                      
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

      {blogPosts.length > 0 && (
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
                href="../../#kontakti"
                className="inline-flex items-center px-6 py-3 bg-[#77D4B4] text-white rounded-lg hover:bg-[#66C5A8] transition-colors"
              >
                Sazināties ar mums
              </Link>
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