import Image from "next/image"

export default async function BlogSection() {
  let blogPosts = [];
  
  try {
    // During build, this might not work, so we'll handle it gracefully
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/blog`, {
      cache: "no-store",
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (res.ok) {
      blogPosts = await res.json();
    }
  } catch (error) {
    // During build time, this fetch might fail - that's okay
    console.warn('Blog posts will be loaded on the client side');
  }

  return (
    <section className="py-20 px-4 md:px-12 bg-white">
      <div className="max-w-7xl mx-auto text-center">
        <p className="text-md uppercase text-[#77D4B4] font-semibold tracking-wide mb-2">
          Jaunākie raksti
        </p>
        <h2 className="text-3xl md:text-4xl font-bold text-[#00332D] mb-12">
          Mūsu bloga ieraksti un padomi
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {blogPosts && blogPosts.length > 0 ? (
            blogPosts.map((post: any) => (
              <div key={post.id} className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden flex flex-col">
                <div className="relative h-52 w-full">
                  <Image
                    src={post.imageUrl}
                    alt={post.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6 flex flex-col flex-grow text-left">
                  <p className="text-sm text-gray-500 mb-2">{post.date}</p>
                  <h3 className="text-xl font-semibold text-[#00332D] mb-3">{post.title}</h3>
                  <a
                    href={`/blogs/${post.slug}`}
                    className="mt-auto text-[#00332D] font-semibold hover:underline"
                  >
                    Lasīt vairāk →
                  </a>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center text-gray-500">
              <p>Nav pieejami bloga ieraksti</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
