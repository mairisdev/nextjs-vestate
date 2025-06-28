"use client"

import Image from "next/image"

const blogPosts = [
  {
    title: "Kā sagatavot īpašumu pārdošanai?",
    excerpt: "Uzzini, kā izveidot pirmo iespaidu, kas piesaista potenciālos pircējus...",
    image: "/blog/BlogPost1.webp",
    date: "2024. gada 5. marts",
    slug: "ka-sagatavot-ipasumu",
  },
  {
    title: "Nekustamā īpašuma tirgus tendences 2025",
    excerpt: "Apskatām aktuālās izmaiņas un prognozes nākamajam gadam...",
    image: "/blog/BlogPost2.webp",
    date: "2025. gada 2. janvāris",
    slug: "tirgus-tendences-2025",
  },
  {
    title: "Biežāk pieļautās kļūdas īpašuma pārdošanā",
    excerpt: "Izvairies no kļūdām, kas var izmaksāt tev dārgi. Mūsu eksperta padomi...",
    image: "/blog/BlogPost3.webp",
    date: "2024. gada 12. oktobris",
    slug: "kludas-pardodot-ipasumu",
  },
]

export default function BlogSection() {
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
          {blogPosts.map((post, i) => (
            <div key={i} className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden flex flex-col">
              <div className="relative h-52 w-full">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6 flex flex-col flex-grow text-left">
                <p className="text-sm text-gray-500 mb-2">{post.date}</p>
                <h3 className="text-xl font-semibold text-[#00332D] mb-3">{post.title}</h3>
                <p className="text-gray-700 mb-4 flex-grow">{post.excerpt}</p>
                <a
                  href={`/blogs/${post.slug}`}
                  className="mt-auto text-[#00332D] font-semibold hover:underline"
                >
                  Lasīt vairāk →
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
