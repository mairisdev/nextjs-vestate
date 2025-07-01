import { prisma } from "@/lib/prisma";

export async function updateBlogPost(id: string, title: string, date: string, excerpt: string, imageUrl: string) {
  return await prisma.blogPost.update({
    where: { id },
    data: {
      title,
      date,
      excerpt,
      imageUrl
    },
  });
}
