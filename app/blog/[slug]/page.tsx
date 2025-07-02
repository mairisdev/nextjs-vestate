import { getBlogPostBySlug, getAllBlogPosts } from "@/lib/queries/blog"
import Image from "next/image"
import { notFound } from "next/navigation"

type Props = {
  post: {
    title: string
    date: string
    excerpt: string
    imageUrl: string
  }
}

// Static Paths (for dynamic routes with slugs)
export async function getStaticPaths() {
  const posts = await getAllBlogPosts() // Fetch all posts
  const paths = posts.map((post: any) => ({
    params: { slug: post.slug },
  }))

  return { paths, fallback: "blocking" }
}

// Static Props (for each individual post)
export async function getStaticProps({ params }: { params: { slug: string } }) {
  const post = await getBlogPostBySlug(params.slug)

  if (!post) {
    return { notFound: true }
  }

  return {
    props: {
      post,
    },
  }
}

export default function BlogPostPage({ post }: Props) {
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
