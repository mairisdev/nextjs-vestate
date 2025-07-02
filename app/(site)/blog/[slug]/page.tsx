import { notFound } from "next/navigation"
import Image from "next/image"
import { getBlogPostBySlug } from "@/lib/queries/blog"

interface BlogPostPageProps {
  params: {
    slug: string
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  // Await the params slug as per Next.js requirements
  const { slug } = await params
  const post = await getBlogPostBySlug(slug)

  if (!post) {
    notFound()
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
      <p className="text-sm text-gray-500 mb-6">{post.date}</p>

      <div className="relative w-full h-64 mb-6 rounded-md overflow-hidden">
        <Image
          src={post.imageUrl}
          alt={post.title}
          fill
          className="object-cover"
        />
      </div>

      <div className="prose prose-lg">
        <p>{post.excerpt}</p>
      </div>
    </main>
  )
}
