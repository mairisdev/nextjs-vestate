import { v2 as cloudinary } from 'cloudinary'

// Debug: Pārbaudam vai mainīgie eksistē
console.log('🔧 Cloudinary config check:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? '✅ SET' : '❌ MISSING',
  api_key: process.env.CLOUDINARY_API_KEY ? '✅ SET' : '❌ MISSING',
  api_secret: process.env.CLOUDINARY_API_SECRET ? '✅ SET' : '❌ MISSING',
  cloudinary_url: process.env.CLOUDINARY_URL ? '✅ SET' : '❌ MISSING'
})

// Konfigurējam Cloudinary ar fallback uz CLOUDINARY_URL
if (process.env.CLOUDINARY_URL) {
  // Ja ir pieejams CLOUDINARY_URL, izmantojam to
  console.log('📡 Using CLOUDINARY_URL configuration')
  cloudinary.config(process.env.CLOUDINARY_URL)
} else {
  // Citādi izmantojam atsevišķos mainīgos
  console.log('📡 Using individual environment variables')
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  })
}

// Pārbaudām, vai konfigurācija ir pareiza
const config = cloudinary.config()
console.log('🔑 Cloudinary final config:', {
  cloud_name: config.cloud_name ? '✅ SET' : '❌ MISSING',
  api_key: config.api_key ? '✅ SET' : '❌ MISSING',
  api_secret: config.api_secret ? '✅ SET' : '❌ MISSING'
})

// Eksportējam noklusējuma exportu
export default cloudinary

// Eksportējam arī helper funkcijas
export const uploadImage = async (file: File, folder: string = 'properties'): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    try {
      const buffer = Buffer.from(await file.arrayBuffer())
      
      cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'auto',
          transformation: [
            { width: 1200, height: 800, crop: 'fill', quality: 'auto' }
          ]
        },
        (error, result) => {
          if (error) {
            console.error('❌ Cloudinary upload error:', error)
            reject(error)
          } else {
            console.log('✅ Cloudinary upload success:', result?.secure_url)
            resolve(result!.secure_url)
          }
        }
      ).end(buffer)
    } catch (error) {
      console.error('❌ Buffer processing error:', error)
      reject(error)
    }
  })
}

export const deleteImage = async (publicId: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) {
        console.error('❌ Cloudinary delete error:', error)
        reject(error)
      } else {
        console.log('✅ Cloudinary delete success:', result)
        resolve()
      }
    })
  })
}