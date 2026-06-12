import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import sharp from 'sharp'

const region = process.env.S3_REGION
const bucket = process.env.S3_BUCKET_NAME

export const s3 = new S3Client({
  region,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || '',
    secretAccessKey: process.env.S3_SECRET_KEY || '',
  },
})

// Publiskā bāzes adrese (var pārrakstīt ar CDN/CloudFront adresi)
const publicBase =
  process.env.S3_PUBLIC_URL?.replace(/\/$/, '') ||
  `https://${bucket}.s3.${region}.amazonaws.com`

// Faili, kurus nekonvertējam uz webp (paliek oriģinālajā formātā)
function shouldKeepOriginal(type: string): boolean {
  return type === 'image/svg+xml' || type === 'image/gif' || !type.startsWith('image/')
}

function extFor(type: string, fallback: string): string {
  if (type === 'image/svg+xml') return 'svg'
  if (type === 'image/gif') return 'gif'
  if (type.startsWith('video/')) return type.split('/')[1] || fallback
  return fallback
}

/**
 * Augšupielādē failu uz S3 un atgriež publisko URL.
 * Rastra attēlus konvertē uz webp; SVG/GIF/video saglabā oriģinālā.
 *
 * @param file   - augšupielādējamais fails
 * @param folder - S3 atslēgas prefikss (piem. "agents", "website/first-section")
 * @param opts   - publicId (bez paplašinājuma); ja nav, ģenerējam no faila nosaukuma
 */
export async function uploadImage(
  file: File,
  folder = 'properties',
  opts: { publicId?: string } = {}
): Promise<string> {
  const inputBuffer = Buffer.from(await file.arrayBuffer())

  let body: Buffer = inputBuffer
  let contentType = file.type || 'application/octet-stream'
  let ext = extFor(contentType, file.name.split('.').pop() || 'bin')

  if (!shouldKeepOriginal(contentType)) {
    // Konvertējam uz webp (bez papildu optimizācijas/izmēra maiņas)
    body = await sharp(inputBuffer).webp().toBuffer()
    contentType = 'image/webp'
    ext = 'webp'
  }

  const safeName = (opts.publicId || file.name.replace(/\.[^.]+$/, ''))
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9-_]/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase()

  const key = `${folder.replace(/\/$/, '')}/${safeName}.${ext}`

  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  )

  return `${publicBase}/${key}`
}

/** Iegūst S3 atslēgu no publiskā URL (vajadzīgs dzēšanai). */
export function getKeyFromUrl(url: string): string | null {
  if (!url) return null
  try {
    if (url.startsWith(publicBase)) {
      return url.slice(publicBase.length + 1)
    }
    // Fallback: parsējam ceļu no pilna URL
    const u = new URL(url)
    return u.pathname.replace(/^\//, '')
  } catch {
    return null
  }
}

/** Dzēš failu no S3 pēc tā publiskā URL. */
export async function deleteImage(url: string): Promise<void> {
  const key = getKeyFromUrl(url)
  if (!key) return
  await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }))
}
