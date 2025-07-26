import Image from "next/image"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Navbar from "../../../../components/Navbar"
import ShareButton from "../../../../components/ShareButton"
import { Calendar, ArrowLeft, User, Clock, FileText } from "lucide-react"
import { marked } from "marked"

interface BlogContentPageProps {
  params: Promise<{ slug: string }>
}

async function getBlogContent(slug: string) {
  try {
    const content = await prisma.content.findUnique({
      where: { 
        slug,
        type: "BLOG",
        published: true
      }
    })
    return content
  } catch (error) {
    console.error("Error fetching blog content:", error)
    return null
  }
}

async function getRelatedBlogContent(currentId: string) {
  try {
    const related = await prisma.content.findMany({
      where: {
        type: "BLOG",
        published: true,
        id: { not: currentId }
      },
      orderBy: { publishedAt: "desc" },
      take: 3
    })
    return related
  } catch (error) {
    console.error("Error fetching related blog content:", error)
    return []
  }
}

const convertMarkdownToHtml = (markdown: string): string => {
  const html = marked(markdown, { 
    breaks: true,
    gfm: true
  }) as string
  
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

export default async function BlogContentPage({ params }: BlogContentPageProps) {
  const { slug } = await params
  const content = await getBlogContent(slug)
  
  if (!content) {
    notFound()
  }

  const relatedContent = await getRelatedBlogContent(content.id)
  const wordsCount = content.content.split(' ').length
  const readingTime = Math.ceil(wordsCount / 200)

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
            <span className="text-gray-900">{content.title}</span>
          </div>
        </div>
      </div>

      {/* Main Article */}
      <article className="bg-white">
        <div className="max-w-4xl mx-auto px-6 py-12">

          {/* Back Button */}
          <div className="mb-8">
            <Link 
              href="/blog/raksti" 
              className="inline-flex items-center text-[#77D4B4] hover:text-green-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Atpakaļ uz rakstiem
            </Link>
          </div>

          {/* Article Category Badge */}
          <div className="flex items-center mb-6">
            <div className="inline-flex items-center px-3 py-1 bg-[#77D4B4]/10 text-[#00332D] rounded-full text-sm font-medium">
              <FileText className="w-4 h-4 mr-2" />
              Blog ieraksts
            </div>
          </div>

          {/* Article Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-[#00332D] mb-6 leading-tight">
            {content.title}
          </h1>

          {/* Article Meta */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 mb-8">
            <div className="flex items-center">
              <User className="w-4 h-4 mr-2" />
              {content.author || "Vestate"}
            </div>
            {content.publishedAt && (
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                {new Date(content.publishedAt).toLocaleDateString('lv-LV', {
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

          {/* Featured Image */}
          {content.featuredImage && (
            <div className="relative w-full h-96 md:h-[500px] mb-8 rounded-xl overflow-hidden">
              <Image
                src={content.featuredImage}
                alt={content.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Article Excerpt (as lead paragraph) */}
          {content.excerpt && (
            <div className="text-xl text-gray-700 leading-relaxed mb-8 p-6 bg-[#77D4B4]/5 rounded-xl border-l-4 border-[#77D4B4]">
              {content.excerpt}
            </div>
          )}

          {/* Tags */}
          {content.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {content.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

        </div>
      </article>

      {/* Article Content */}
      <section className="bg-white border-t">
        <div className="max-w-4xl mx-auto px-6 py-12">
          {/* Video Section */}
          {content.videoUrl && (
            <div className="mb-12">
              <h3 className="text-xl font-semibold text-[#00332D] mb-6">Video</h3>
              <div className="relative aspect-video rounded-xl overflow-hidden">
                <video 
                  controls 
                  className="w-full h-full object-cover"
                  poster={content.featuredImage || undefined}
                >
                  <source src={content.videoUrl} type="video/mp4" />
                  Jūsu pārlūkprogramma neatbalsta video elementu.
                </video>
              </div>
            </div>
          )}

          {/* Video File */}
          {content.videoFile && (
            <div className="mb-12">
              <h3 className="text-xl font-semibold text-[#00332D] mb-6">Video</h3>
              <div className="relative aspect-video rounded-xl overflow-hidden">
                <video 
                  controls 
                  className="w-full h-full object-cover"
                  poster={content.featuredImage || undefined}
                >
                  <source src={content.videoFile} type="video/mp4" />
                  Jūsu pārlūkprogramma neatbalsta video elementu.
                </video>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div 
            className="prose prose-lg max-w-none prose-headings:text-[#00332D] prose-links:text-[#77D4B4] prose-links:no-underline hover:prose-links:underline prose-strong:text-[#00332D] prose-img:rounded-xl prose-img:shadow-lg"
            dangerouslySetInnerHTML={{ __html: convertMarkdownToHtml(content.content) }}
          />

          {/* Additional Images */}
          {content.images.length > 0 && (
            <div className="mt-12">
              <h3 className="text-xl font-semibold text-[#00332D] mb-6">Papildu attēli</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {content.images.map((image, index) => (
                  <div key={index} className="relative h-64 rounded-xl overflow-hidden">
                    <Image
                      src={image}
                      alt={`${content.title} - attēls ${index + 1}`}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Share Section */}
          <div className="mt-12 pt-8 border-t">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#00332D]">Dalīties ar citiem</h3>
              <ShareButton title={content.title} excerpt={content.excerpt} />
            </div>
          </div>
        </div>
      </section>

      {/* Related Articles */}
      {relatedContent.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-2xl font-bold text-[#00332D] mb-8">Saistītie raksti</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {relatedContent.map((article) => (
                <Link
                  key={article.id}
                  href={`/blog/content/${article.slug}`}
                  className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
                >
                  {article.featuredImage && (
                    <div className="relative h-48">
                      <Image
                        src={article.featuredImage}
                        alt={article.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  
                  <div className="p-6">
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <User className="w-4 h-4 mr-2" />
                      {article.author || "Vestate"}
                      {article.publishedAt && (
                        <>
                          <span className="mx-2">•</span>
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(article.publishedAt).toLocaleDateString('lv-LV')}
                        </>
                      )}
                    </div>
                    
                    <h3 className="text-lg font-semibold text-[#00332D] mb-3 group-hover:text-[#77D4B4] transition-colors">
                      {article.title}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {article.excerpt.length > 120 ? article.excerpt.slice(0, 120) + "..." : article.excerpt}
                    </p>

                    {article.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {article.tags.slice(0, 2).map((tag, index) => (
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
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 bg-[#77D4B4]/5">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold text-[#00332D] mb-4">
            Vajag personalizētu padomu?
          </h2>
          <p className="text-gray-600 mb-6">
            Sazinieties ar mūsu ekspertiem individuālai konsultācijai nekustamo īpašumu jomā
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

// Metadata generation
export async function generateMetadata({ params }: BlogContentPageProps) {
  const { slug } = await params
  const content = await getBlogContent(slug)

  if (!content) {
    return {
      title: "Blog ieraksts nav atrasts | Vestate",
      description: "Meklētais blog ieraksts nav atrasts."
    }
  }

  return {
    title: content.metaTitle || `${content.title} | Vestate`,
    description: content.metaDescription || content.excerpt,
    openGraph: {
      title: content.title,
      description: content.excerpt,
      images: content.featuredImage ? [content.featuredImage] : [],
    }
  }
}

// Static params generation for build optimization
export async function generateStaticParams() {
  try {
    const blogContent = await prisma.content.findMany({
      where: { 
        type: "BLOG",
        published: true 
      },
      select: { slug: true }
    })
    
    return blogContent.map((content) => ({
      slug: content.slug,
    }))
  } catch (error) {
    console.error("Error generating static params:", error)
    return []
  }
}