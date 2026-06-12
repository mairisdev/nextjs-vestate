export function getImageUrl(imagePath: string | null): string | null {
  if (!imagePath) return null

  // Ja jau ir pilns URL (S3 vai cits CDN), atgriežam tā kā ir
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }

  // Ja sākas ar /, tas ir absolūts ceļš (jau pareizs)
  if (imagePath.startsWith('/')) {
    return imagePath
  }

  // Citādi pievienojam lokālo upload prefiksu (vecajiem attēliem)
  return `/uploads/properties/${imagePath}`
}

/**
 * Atgriež attēla URL ar fallback uz noklusējuma attēlu
 */
export function getImageUrlWithFallback(imagePath: string | null, fallback: string = '/placeholder-property.jpg'): string {
  const url = getImageUrl(imagePath)
  return url || fallback
}

/**
 * Atgriež attēla URL. S3 attēli tiek optimizēti caur Next.js <Image> komponenti,
 * tāpēc šeit vienkārši atgriežam oriģinālo URL.
 */
export function getOptimizedImageUrl(imagePath: string | null): string | null {
  return getImageUrl(imagePath)
}
