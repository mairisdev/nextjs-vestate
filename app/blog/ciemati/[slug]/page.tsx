import Image from "next/image"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Navbar from "../../../components/Navbar"
import ShareButton from "../../../components/ShareButton"
import { Calendar, ArrowLeft, User, Tag, Clock, MapPin} from "lucide-react"
import { marked } from "marked"

interface VillagePageProps {
  params: Promise<{ slug: string }>
}

async function getVillageContent(slug: string) {
  try {
    const content = await prisma.content.findUnique({
      where: { 
        slug,
        type: "VILLAGES",
        published: true
      }
    })
    return content
  } catch (error) {
    console.error("Error fetching village content:", error)
    return null
  }
}

async function getRelatedVillages(currentId: string) {
  try {
    const related = await prisma.content.findMany({
      where: {
        type: "VILLAGES",
        published: true,
        id: { not: currentId }
      },
      orderBy: { publishedAt: "desc" },
      take: 3
    })
    return related
  } catch (error) {
    console.error("Error fetching related villages:", error)
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

export default async function VillageContentPage({ params }: VillagePageProps) {
  const { slug } = await params
  const content = await getVillageContent(slug)
  
  if (!content) {
    notFound()
  }

  const wordsCount = content.content.split(' ').length
  const readingTime = Math.ceil(wordsCount / 200)

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
            <Link href="/blog/izglitojosais" className="hover:text-[#00332D]">Ciemati</Link>
            <span>/</span>
            <span className="text-gray-900">{content.title}</span>
          </div>
        </div>
      </div>

      <article className="bg-white">
        <div className="max-w-4xl mx-auto px-6 py-12">

          <div className="mb-8">
            <Link 
              href="/blog/ciemati" 
              className="inline-flex items-center text-[#77D4B4] hover:text-green-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Atpakaļ uz ciematiem
            </Link>
          </div>

          <div className="flex items-center mb-6">
            <div className="inline-flex items-center px-3 py-1 bg-[#77D4B4]/10 text-[#00332D] rounded-full text-sm font-medium">
              <MapPin className="w-4 h-4 mr-2" />
              Ciemati
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-[#00332D] mb-6 leading-tight">
            {content.title}
          </h1>

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

          <section className="bg-white border-t">
            <div className="max-w-4xl mx-auto px-6 py-12">  
              <div 
                className="max-w-none"
                dangerouslySetInnerHTML={{ 
                  __html: convertMarkdownToHtml(content.excerpt) 
                }}
              />
            </div>
          </section>

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

      <section className="bg-white border-t">
        <div className="max-w-4xl mx-auto px-6 py-12">

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

          <div 
            className="prose prose-lg max-w-none prose-headings:text-[#00332D] prose-links:text-[#77D4B4] prose-links:no-underline hover:prose-links:underline prose-strong:text-[#00332D] prose-img:rounded-xl prose-img:shadow-lg"
            dangerouslySetInnerHTML={{ __html: content.content }}
          />

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

          <div className="mt-12 pt-8 border-t">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#00332D]">Dalīties ar citiem</h3>
              <ShareButton title={content.title} excerpt={content.excerpt} />
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

export async function generateMetadata({ params }: VillagePageProps) {
  const { slug } = await params
  const content = await getVillageContent(slug)

  if (!content) {
    return {
      title: "Ciemats nav atrasts | Vestate",
      description: "Meklētais ciemats nav atrasts."
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