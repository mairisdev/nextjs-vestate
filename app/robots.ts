import type { MetadataRoute } from 'next'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vivaestate.lv'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Admin un autentifikācijas lapas netiek indeksētas
      disallow: ['/admin', '/sign-in', '/api/'],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
