import { prisma } from "@/lib/prisma"

export async function getAllBlogPosts() {
  return await prisma.blogPost.findMany({
    orderBy: { date: "desc" },
  })
}

export async function getBlogPostById(id: string) {
  return await prisma.blogPost.findUnique({
    where: { id },
  })
}

export async function createBlogPost(
  title: string,
  date: string,
  excerpt: string,
  slug: string,
  imageUrl: string
) {
  return await prisma.blogPost.create({
    data: {
      title,
      date,
      excerpt,
      slug,
      imageUrl,
    },
  })
}

export async function updateBlogPost(
  id: string,
  title: string,
  date: string,
  excerpt: string,
  imageUrl: string
) {
  return await prisma.blogPost.update({
    where: { id },
    data: {
      title,
      date,
      excerpt,
      imageUrl,
    },
  })
}

// ✅ Jaunā funkcija vienam blogam pēc slug
export async function getBlogPostBySlug(slug: string) {
  return await prisma.blogPost.findUnique({
    where: { slug },
  })
}
