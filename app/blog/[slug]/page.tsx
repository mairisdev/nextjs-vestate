import { getBlogPostBySlug, getAllBlogPosts } from "@/lib/queries/blog"
import Image from "next/image"
import { notFound } from "next/navigation"
import Navbar from '../../components/Navbar'
import ShareButton from "../../components/ShareButton"
import Link from "next/link"
import { ArrowLeft, Calendar, Clock, MapPin, User } from "lucide-react"
import { marked } from 'marked'

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  // Await the params since they're now async in Next.js 15
  const { slug } = await params
  
  // Fetch the blog post by slug
  const post = await getBlogPostBySlug(slug)

  if (!post) return notFound()

  const wordsCount = post.excerpt.split(' ').length
  const readingTime = Math.ceil(wordsCount / 200)

  // Markdown to HTML conversion function with custom styling
  const convertMarkdownToHtml = (markdown: string): string => {
    // Simple marked conversion without custom renderer
    const html = marked(markdown, { 
      breaks: true,
      gfm: true
    }) as string
    
    // Replace elements with inline styles using regex
    return html
      .replace(/<h1>/g, '<h1 style="font-size: 2.5rem; font-weight: 700; margin-bottom: 1.5rem; margin-top: 2rem; color: #00332D; line-height: 1.2;">')
      .replace(/<h2>/g, '<h2 style="font-size: 2rem; font-weight: 700; margin-bottom: 1rem; margin-top: 1.5rem; color: #00332D; line-height: 1.3;">')
      .replace(/<h3>/g, '<h3 style="font-size: 1.5rem; font-weight: 600; margin-bottom: 0.75rem; margin-top: 1.25rem; color: #00332D; line-height: 1.4;">')
      .replace(/<h4>/g, '<h4 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 0.5rem; margin-top: 1rem; color: #00332D;">')
      .replace(/<h5>/g, '<h5 style="font-size: 1.125rem; font-weight: 600; margin-bottom: 0.5rem; margin-top: 1rem; color: #00332D;">')
      .replace(/<h6>/g, '<h6 style="font-size: 1rem; font-weight: 600; margin-bottom: 0.5rem; margin-top: 1rem; color: #00332D;">')
      .replace(/<strong>/g, '<strong style="font-weight: 700; color: #00332D;">')
      .replace(/<p>/g, '<p style="margin-bottom: 1rem; line-height: 1.75; color: #374151;">')
      .replace(/<a /g, '<a style="color: #77D4B4; text-decoration: underline; font-weight: 500;" ')
  }

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
            <Link href="/blog/raksti" className="hover:text-[#00332D]">Raksti</Link>
            <span>/</span>
            <span className="text-gray-900">{post.title}</span>
          </div>
        </div>
      </div>

      <article className="bg-white">
        <div className="max-w-4xl mx-auto px-6 py-12">
          {/* Back button */}
          <div className="mb-8">
            <Link 
              href="/blog/raksti" 
              className="inline-flex items-center text-[#77D4B4] hover:text-green-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Atpakaļ uz bloga rakstiem
            </Link>
          </div>

          <div className="flex items-center mb-6">
            <div className="inline-flex items-center px-3 py-1 bg-[#77D4B4]/10 text-[#00332D] rounded-full text-sm font-medium">
              <MapPin className="w-4 h-4 mr-2" />
              Jaunākie raksti
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-[#00332D] mb-6 leading-tight">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 mb-8">
            <div className="flex items-center">
              <User className="w-4 h-4 mr-2" />
              {"Vestate"}
            </div>
            {post.date && (
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                {new Date(post.date).toLocaleDateString('lv-LV', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            )}
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              {readingTime} min lasīšana
            </div>
          </div>

          {post.imageUrl && (
            <div className="relative w-full h-96 md:h-[500px] mb-8 rounded-xl overflow-hidden">
              <Image
                src={post.imageUrl}
                alt={post.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {post.shortDescription && (
            <div className="text-xl text-gray-700 leading-relaxed mb-8 p-6 bg-[#77D4B4]/5 rounded-xl border-l-4 border-[#77D4B4]">
              {post.shortDescription}
            </div>
          )}

        </div>
      </article>

      <section className="bg-white border-t">
        <div className="max-w-4xl mx-auto px-6 py-12">  
          <div 
            className="max-w-none"
            dangerouslySetInnerHTML={{ 
              __html: convertMarkdownToHtml(post.excerpt) 
            }}
          />
        </div>
      </section>

      <section className="bg-white border-t">
        <div className="max-w-4xl mx-auto px-6 py-12">
            <div className="mt-12 pt-8 border-t">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[#00332D]">Dalīties ar citiem</h3>
                <ShareButton title={post.title} excerpt={post.excerpt} />
              </div>
            </div>
        </div>
      </section>
      
        <section className="py-16 bg-[#77D4B4]/5">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-2xl font-bold text-[#00332D] mb-4">
              Vajag personalizētu padomu?
            </h2>
            <p className="text-gray-600 mb-6">
              Sazinieties ar mūsu ekspertiem individuālai konsultācijai
            </p>
            <Link
              href="#kontakti"
              className="inline-flex items-center px-6 py-3 bg-[#77D4B4] text-white rounded-lg hover:bg-[#66C5A8] transition-colors"
            >
              Saņemt konsultāciju
            </Link>
          </div>
        </section>
          
  </div>
  )
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getBlogPostBySlug(slug)

  if (!post) return {}

  return {
    title: post.title,
    description: post.shortDescription || post.excerpt,
  }
}

export async function generateStaticParams() {
  const posts = await getAllBlogPosts()
  return posts.map((post) => ({
    slug: post.slug,
  }))
}