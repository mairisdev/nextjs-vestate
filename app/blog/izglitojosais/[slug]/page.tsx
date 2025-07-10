import Image from "next/image"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Navbar from "../../../components/Navbar"
import ShareButton from "../../../components/ShareButton"
import { Calendar, ArrowLeft, GraduationCap, User, Tag, Clock } from "lucide-react"

interface EducationalPageProps {
  params: Promise<{ slug: string }>
}

async function getEducationalContent(slug: string) {
  try {
    const content = await prisma.content.findUnique({
      where: { 
        slug,
        type: "EDUCATIONAL",
        published: true
      }
    })
    return content
  } catch (error) {
    console.error("Error fetching educational content:", error)
    return null
  }
}

async function getRelatedContent(currentId: string) {
  try {
    const related = await prisma.content.findMany({
      where: {
        type: "EDUCATIONAL",
        published: true,
        id: { not: currentId }
      },
      orderBy: { publishedAt: "desc" },
      take: 3
    })
    return related
  } catch (error) {
    console.error("Error fetching related content:", error)
    return []
  }
}

export default async function EducationalContentPage({ params }: EducationalPageProps) {
  const { slug } = await params
  const content = await getEducationalContent(slug)
  
  if (!content) {
    notFound()
  }

  const relatedContent = await getRelatedContent(content.id)

  // Parse content for reading time estimation
  const wordsCount = content.content.split(' ').length
  const readingTime = Math.ceil(wordsCount / 200) // ~200 words per minute

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
            <Link href="/blog/izglitojosais" className="hover:text-[#00332D]">Izglītojošais saturs</Link>
            <span>/</span>
            <span className="text-gray-900">{content.title}</span>
          </div>
        </div>
      </div>

      {/* Article Header */}
      <article className="bg-white">
        <div className="max-w-4xl mx-auto px-6 py-12">
          {/* Back button */}
          <div className="mb-8">
            <Link 
              href="/blog/izglitojosais" 
              className="inline-flex items-center text-[#77D4B4] hover:text-[#66C5A8] transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Atpakaļ uz izglītojošo saturu
            </Link>
          </div>

          {/* Category badge */}
          <div className="flex items-center mb-6">
            <div className="inline-flex items-center px-3 py-1 bg-[#77D4B4]/10 text-[#00332D] rounded-full text-sm font-medium">
              <GraduationCap className="w-4 h-4 mr-2" />
              Izglītojošais saturs
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-[#00332D] mb-6 leading-tight">
            {content.title}
          </h1>

          {/* Meta information */}
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

          {/* Excerpt */}
          <div className="text-xl text-gray-700 leading-relaxed mb-8 p-6 bg-[#77D4B4]/5 rounded-xl border-l-4 border-[#77D4B4]">
            {content.excerpt}
          </div>

          {/* Tags */}
          {content.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {content.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 bg-[#77D4B4]/10 text-[#00332D] text-sm rounded-full"
                >
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </article>

      {/* Main Content */}
      <section className="bg-white border-t">
        <div className="max-w-4xl mx-auto px-6 py-12">
          {/* Video if available */}
          {content.videoUrl && (
            <div className="mb-8">
              <div className="aspect-video w-full rounded-xl overflow-hidden">
                <iframe
                  src={content.videoUrl}
                  title={content.title}
                  className="w-full h-full"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          )}

          {/* Video file if available */}
          {content.videoFile && (
            <div className="mb-8">
              <video 
                controls 
                className="w-full rounded-xl"
                poster={content.featuredImage || undefined}
              >
                <source src={content.videoFile} type="video/mp4" />
                Jūsu pārlūks neatbalsta video atskaņošanu.
              </video>
            </div>
          )}

          {/* Content */}
          <div 
            className="prose prose-lg max-w-none prose-headings:text-[#00332D] prose-links:text-[#77D4B4] prose-links:no-underline hover:prose-links:underline prose-strong:text-[#00332D] prose-img:rounded-xl prose-img:shadow-lg"
            dangerouslySetInnerHTML={{ __html: content.content }}
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

          {/* Share section - Updated to use Client Component */}
          <div className="mt-12 pt-8 border-t">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#00332D]">Dalīties ar citiem</h3>
              <ShareButton title={content.title} excerpt={content.excerpt} />
            </div>
          </div>
        </div>
      </section>

      {/* Related Content */}
      {relatedContent.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-2xl font-bold text-[#00332D] mb-8">Saistītais saturs</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {relatedContent.map((item) => (
                <Link
                  key={item.id}
                  href={`/blog/izglitojosais/${item.slug}`}
                  className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
                >
                  {item.featuredImage && (
                    <div className="relative h-48">
                      <Image
                        src={item.featuredImage}
                        alt={item.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-[#00332D] mb-2 group-hover:text-[#77D4B4] transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {item.excerpt}
                    </p>
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

export async function generateMetadata({ params }: EducationalPageProps) {
  const { slug } = await params
  const content = await getEducationalContent(slug)

  if (!content) {
    return {
      title: "Raksts nav atrasts | Vestate",
      description: "Meklētais izglītojošais saturs nav atrasts."
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