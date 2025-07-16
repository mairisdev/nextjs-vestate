export function getImageUrl(imagePath: string | null): string | null {
  if (!imagePath) return null
  
  // Ja jau ir pilns URL (Cloudinary vai cits CDN), atgriežam tā kā ir
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
 * Ģenerē attēla URL ar Cloudinary transformācijām
 */
export function getOptimizedImageUrl(imagePath: string | null, width?: number, height?: number): string | null {
  const url = getImageUrl(imagePath)
  if (!url) return null
  
  // Ja ir Cloudinary URL, varam pievienot transformācijas
  if (url.includes('cloudinary.com')) {
    const parts = url.split('/upload/')
    if (parts.length === 2) {
      let transformations = []
      if (width) transformations.push(`w_${width}`)
      if (height) transformations.push(`h_${height}`)
      transformations.push('c_fill', 'q_auto', 'f_auto')
      
      return `${parts[0]}/upload/${transformations.join(',')}/${parts[1]}`
    }
  }
  
  // Ja nav Cloudinary, atgriežam oriģinālo
  return url
}

/**
 * Pārbauda, vai attēls ir no Cloudinary
 */
export function isCloudinaryImage(imagePath: string | null): boolean {
  return imagePath ? imagePath.includes('cloudinary.com') : false
}

/**
 * Iegūst public ID no Cloudinary URL (vajadzīgs dzēšanai)
 */
export function getCloudinaryPublicId(url: string): string | null {
  try {
    if (!url.includes('cloudinary.com')) return null
    
    const parts = url.split('/')
    const versionIndex = parts.findIndex(part => part.startsWith('v'))
    
    if (versionIndex !== -1 && versionIndex < parts.length - 1) {
      const fileName = parts[versionIndex + 1]
      return `properties/${fileName.split('.')[0]}`
    }
    
    // Fallback - mēģinām iegūt no faila nosaukuma
    const fileName = parts[parts.length - 1]
    return `properties/${fileName.split('.')[0]}`
  } catch (error) {
    console.error('Error extracting public ID from URL:', error)
    return null
  }
}