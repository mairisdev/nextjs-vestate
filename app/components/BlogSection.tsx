import Image from "next/image"
import Link from "next/link"

export default async function BlogSection() {
  let blogPosts = []

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/blog`, {
      cache: "no-store",
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (res.ok) {
      blogPosts = await res.json()
    }
  } catch (error) {
    console.warn("Blog posts will be loaded on the client side")
  }

  return (
    <section id="jaunakie-ieraksti" className="py-20 px-4 md:px-12 bg-white">
      <div className="max-w-7xl mx-auto text-center">
        <p className="text-md uppercase text-[#77D4B4] font-semibold tracking-wide mb-2">
          Jaunākie raksti
        </p>
        <h2 className="text-3xl md:text-4xl font-bold text-[#00332D] mb-12">
          Mūsu bloga ieraksti un padomi
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {blogPosts.map((post: any) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="block bg-white rounded-xl shadow hover:shadow-md transition overflow-hidden"
            >
              <div className="relative w-full h-52">
                <Image
                  src={post.imageUrl}
                  alt={post.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-5 text-left">
                <p className="text-sm text-gray-500 mb-2">{post.date}</p>
                <h3 className="text-lg font-semibold text-[#00332D] mb-2">
                  {post.title}
                </h3>
                <p className="text-sm text-gray-700 mb-4">
                  {post.excerpt.length > 200 ? post.excerpt.slice(0, 200) + "..." : post.excerpt}
                </p>
                <span className="text-[#007B6E] text-sm font-medium hover:underline">
                  Lasīt vairāk →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
