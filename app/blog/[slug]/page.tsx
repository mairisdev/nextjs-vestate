import { getBlogPostBySlug, getAllBlogPosts } from "@/lib/queries/blog"
import Image from "next/image"
import { notFound } from "next/navigation"

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  // Await the params since they're now async in Next.js 15
  const { slug } = await params
  
  // Fetch the blog post by slug
  const post = await getBlogPostBySlug(slug)

  if (!post) return notFound()

  return (
    <div className="max-w-4xl mx-auto py-20 px-4">
      <h1 className="text-3xl md:text-4xl font-bold text-[#00332D] mb-6">
        {post.title}
      </h1>
      <p className="text-gray-500 mb-6">{post.date}</p>
      <div className="w-full h-80 relative mb-10 rounded-lg overflow-hidden shadow">
        <Image
          src={post.imageUrl}
          alt={post.title}
          fill
          className="object-cover"
        />
      </div>
      <div className="text-gray-700 leading-relaxed whitespace-pre-line">
        {post.excerpt}
      </div>
    </div>
  )
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getBlogPostBySlug(slug)

  if (!post) return {}

  return {
    title: post.title,
    description: post.excerpt,
  }
}

export async function generateStaticParams() {
  const posts = await getAllBlogPosts()
  return posts.map((post) => ({
    slug: post.slug,
  }))
}
