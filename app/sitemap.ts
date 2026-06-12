import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vivaestate.lv'
const locales = ['lv', 'en', 'ru'] as const

// Izveido hreflang alternates vienam relatīvam ceļam (piem. "" vai "/blog")
function withAlternates(path: string) {
  const languages: Record<string, string> = {}
  for (const l of locales) languages[l] = `${siteUrl}/${l}${path}`
  return { languages }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Statiskās lapas — katrai valodai
  const staticPaths = ['', '/blog', '/ipasumu-kategorijas']
  const staticEntries: MetadataRoute.Sitemap = locales.flatMap((locale) =>
    staticPaths.map((path) => ({
      url: `${siteUrl}/${locale}${path}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: path === '' ? 1 : 0.7,
      alternates: withAlternates(path),
    }))
  )

  // Dinamiskās lapas no DB (ja DB nav pieejama, atgriežam tikai statiskās)
  let dynamicEntries: MetadataRoute.Sitemap = []
  try {
    const [posts, content] = await Promise.all([
      prisma.blogPost.findMany({ select: { slug: true, updatedAt: true } }),
      prisma.content.findMany({
        where: { published: true },
        select: { slug: true, updatedAt: true },
      }),
    ])

    const buildFor = (basePath: string, slug: string, lastModified: Date) =>
      locales.map((locale) => ({
        url: `${siteUrl}/${locale}${basePath}/${slug}`,
        lastModified,
        changeFrequency: 'monthly' as const,
        priority: 0.6,
        alternates: withAlternates(`${basePath}/${slug}`),
      }))

    dynamicEntries = [
      ...posts.flatMap((p) => buildFor('/blog', p.slug, p.updatedAt)),
      ...content.flatMap((c) => buildFor('/blog/content', c.slug, c.updatedAt)),
    ]
  } catch (e) {
    console.error('sitemap: failed to load dynamic routes', e)
  }

  return [...staticEntries, ...dynamicEntries]
}
