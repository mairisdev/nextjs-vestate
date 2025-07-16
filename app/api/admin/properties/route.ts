import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { PropertyStatus, PropertyVisibility } from "@prisma/client"

// SVARĪGI: Pievieno šos exports lai izslēgtu static generation
export const dynamic = 'force-dynamic'
export const maxDuration = 30
export const revalidate = 0

// Helper funkcija slug izveidošanai
function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/ā/g, 'a').replace(/č/g, 'c').replace(/ē/g, 'e')
    .replace(/ģ/g, 'g').replace(/ī/g, 'i').replace(/ķ/g, 'k')
    .replace(/ļ/g, 'l').replace(/ņ/g, 'n').replace(/š/g, 's')
    .replace(/ū/g, 'u').replace(/ž/g, 'z')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

// ERROR LOGGING HELPER
function logError(stage: string, error: any, context?: any) {
  console.error(`❌ PROPERTIES API ERROR [${stage}]:`, error)
  if (context) {
    console.error(`📋 Context:`, context)
  }
  console.error(`📝 Error message:`, error?.message)
  console.error(`🔍 Error stack:`, error?.stack)
}

// VERCEL-COMPATIBLE FAILU UPLOAD FUNKCIJA
async function uploadToCloudinary(file: File, folder: string): Promise<string> {
  try {
    // Konvertē File uz base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    
    // Cloudinary API call (ja ir konfigurēts)
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
      const formData = new FormData()
      formData.append('file', `data:${file.type};base64,${base64}`)
      formData.append('upload_preset', 'properties') // Vai jebkāds preset
      formData.append('folder', `properties/${folder}`)
      
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      )
      
      if (response.ok) {
        const result = await response.json()
        return result.secure_url
      }
    }
    
    // Fallback: Saglabā kā base64 string datubāzē (tikai development)
    // PIEZĪME: Šis nav ieteicams production, bet darbosies
    return `data:${file.type};base64,${base64}`
    
  } catch (error) {
    console.error('Upload error:', error)
    throw new Error(`Failed to upload file: ${error}`)
  }
}

// ALTERNATĪVS RISINĀJUMS: Bez failu saglabāšanas
async function saveFileAsBase64(file: File): Promise<string> {
  try {
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    return `data:${file.type};base64,${base64}`
  } catch (error) {
    throw new Error(`Failed to process file: ${error}`)
  }
}

export async function GET() {
  try {
    console.log('🔍 GET /api/admin/properties - Starting...')
    
    const properties = await prisma.property.findMany({
      include: {
        category: true,
        agent: true
      },
      orderBy: { createdAt: 'desc' }
    })
    
    console.log('✅ GET Properties loaded successfully:', properties.length)
    return NextResponse.json(properties)
  } catch (error) {
    logError('GET', error)
    return NextResponse.json({ error: "Kļūda ielādējot īpašumus" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  console.log('🚀 POST /api/admin/properties - Starting...')
  console.log('🌍 Environment:', process.env.NODE_ENV)
  console.log('📂 Working directory:', process.cwd())
  
  try {
    // 1. AUTHENTICATION CHECK
    let session, userId, agent
    try {
      console.log('🔐 Checking authentication...')
      session = await auth()
      userId = session?.userId
      
      if (!userId) {
        console.error('❌ No user ID found in session')
        return NextResponse.json({ error: "Nav autentifikācijas" }, { status: 401 })
      }
      
      console.log('✅ User authenticated:', userId)
      
      agent = await prisma.agent.findUnique({
        where: { clerkId: userId }
      })
      
      console.log('👤 Agent found:', agent ? `${agent.firstName} ${agent.lastName}` : 'None')
      
    } catch (error) {
      logError('AUTHENTICATION', error)
      return NextResponse.json({ error: "Autentifikācijas kļūda" }, { status: 401 })
    }

    // 2. CONTENT TYPE CHECK
    const contentType = req.headers.get("content-type")
    console.log('📋 Content type:', contentType)

    if (contentType?.includes("multipart/form-data")) {
      console.log('📁 Processing multipart form data...')
      
      // 3. FORM DATA PARSING
      let formData
      try {
        console.log('📊 Parsing form data...')
        formData = await req.formData()
        console.log('✅ Form data parsed successfully')
        
        // Log all form fields (bez file content)
        const formFields: Record<string, any> = {}
        for (const [key, value] of formData.entries()) {
          if (value instanceof File) {
            formFields[key] = `FILE: ${value.name} (${value.size} bytes)`
          } else {
            formFields[key] = value
          }
        }
        console.log('📝 Form fields:', formFields)
        
      } catch (error) {
        logError('FORM_DATA_PARSING', error)
        return NextResponse.json({ error: "Nevar nolasīt form datus" }, { status: 400 })
      }

      // 4. EXTRACT FORM VALUES
      let title, description, price, currency, address, city, district, videoUrl, rooms, area, floor, totalFloors, series, hasElevator, amenities, categoryId, status, isActive, isFeatured, visibility, propertyProject

      try {
        console.log('🔍 Extracting form values...')
        
        title = formData.get("title")?.toString() || ""
        description = formData.get("description")?.toString() || ""
        price = parseFloat(formData.get("price")?.toString() || "0")
        currency = formData.get("currency")?.toString() || "EUR"
        address = formData.get("address")?.toString() || ""
        city = formData.get("city")?.toString() || ""
        district = formData.get("district")?.toString() || null
        videoUrl = formData.get("videoUrl")?.toString() || null
        rooms = formData.get("rooms") ? parseInt(formData.get("rooms")?.toString() || "0") : null
        area = formData.get("area") ? parseFloat(formData.get("area")?.toString() || "0") : null
        floor = formData.get("floor") ? parseInt(formData.get("floor")?.toString() || "0") : null
        totalFloors = formData.get("totalFloors") ? parseInt(formData.get("totalFloors")?.toString() || "0") : null
        series = formData.get("series")?.toString() || null
        hasElevator = formData.get("hasElevator") === "true"
        amenities = formData.getAll("amenities").map(a => a.toString()).filter(Boolean)
        categoryId = formData.get("categoryId")?.toString() || ""
        status = formData.get("status")?.toString() || "AVAILABLE"
        isActive = formData.get("isActive") === "true"
        isFeatured = formData.get("isFeatured") === "true"
        visibility = formData.get("visibility") as string || "public"
        propertyProject = formData.get("propertyProject")?.toString() || null

        console.log('✅ Form values extracted:', {
          title, price, currency, address, city, categoryId, status, visibility,
          hasImages: formData.get("mainImage") ? 'Yes' : 'No'
        })

      } catch (error) {
        logError('FORM_VALUES_EXTRACTION', error)
        return NextResponse.json({ error: "Kļūda apstrādājot form datus" }, { status: 400 })
      }

      // 5. VALIDATION
      try {
        console.log('✅ Validating required fields...')
        
        if (!title || !categoryId || !address || !city) {
          const missing = []
          if (!title) missing.push('nosaukums')
          if (!categoryId) missing.push('kategorija')
          if (!address) missing.push('adrese')
          if (!city) missing.push('pilsēta')
          
          console.error('❌ Missing required fields:', missing)
          return NextResponse.json({ 
            error: `Nepieciešami lauki: ${missing.join(', ')}` 
          }, { status: 400 })
        }

        // Validate category exists
        const categoryExists = await prisma.propertyCategory.findUnique({
          where: { id: categoryId }
        })
        
        if (!categoryExists) {
          console.error('❌ Category not found:', categoryId)
          return NextResponse.json({ error: "Kategorija neeksistē" }, { status: 400 })
        }
        
        console.log('✅ Category validation passed:', categoryExists.name)

      } catch (error) {
        logError('VALIDATION', error, { title, categoryId, address, city })
        return NextResponse.json({ error: "Validācijas kļūda" }, { status: 400 })
      }

      // 6. FILE UPLOAD PROCESSING - VERCEL COMPATIBLE
      let mainImagePath: string | null = null
      const additionalImagePaths: string[] = []

      try {
        console.log('📁 Processing file uploads (Vercel compatible)...')
        
        const folderName = createSlug(title)
        console.log('📂 Folder name:', folderName)

        // Main image
        const mainImageFile = formData.get("mainImage") as File | null
        if (mainImageFile && mainImageFile.size > 0) {
          console.log('🖼️ Processing main image:', {
            name: mainImageFile.name,
            size: mainImageFile.size,
            type: mainImageFile.type
          })
          
          // Check file size (5MB limit for base64 storage)
          if (mainImageFile.size > 5 * 1024 * 1024) {
            console.error('❌ Main image too large:', mainImageFile.size)
            return NextResponse.json({ 
              error: "Galvenais attēls pārāk liels (max 5MB)" 
            }, { status: 413 })
          }
          
          // Saglabā kā base64 (Vercel compatible)
          try {
            mainImagePath = await saveFileAsBase64(mainImageFile)
            console.log('✅ Main image saved as base64')
          } catch (uploadError) {
            console.error('❌ Failed to save main image:', uploadError)
            return NextResponse.json({ 
              error: "Neizdevās saglabāt galveno attēlu" 
            }, { status: 500 })
          }
        }

        // Additional images
        let imageIndex = 0
        while (true) {
          const additionalImageFile = formData.get(`additionalImage${imageIndex}`) as File | null
          if (!additionalImageFile || additionalImageFile.size === 0) break

          console.log(`🖼️ Processing additional image ${imageIndex + 1}:`, {
            name: additionalImageFile.name,
            size: additionalImageFile.size
          })
          
          // Check file size
          if (additionalImageFile.size > 5 * 1024 * 1024) {
            console.error(`❌ Additional image ${imageIndex + 1} too large:`, additionalImageFile.size)
            return NextResponse.json({ 
              error: `Attēls ${imageIndex + 1} pārāk liels (max 5MB)` 
            }, { status: 413 })
          }

          try {
            const imagePath = await saveFileAsBase64(additionalImageFile)
            additionalImagePaths.push(imagePath)
            console.log(`✅ Additional image ${imageIndex + 1} saved as base64`)
          } catch (uploadError) {
            console.error(`❌ Failed to save additional image ${imageIndex + 1}:`, uploadError)
            // Turpinām ar citiem attēliem
          }
          
          imageIndex++
        }

        console.log('✅ All files processed successfully')

      } catch (error) {
        logError('FILE_UPLOAD', error, { title, folderName: createSlug(title) })
        return NextResponse.json({ error: "Kļūda augšupielādējot failus" }, { status: 500 })
      }

      // 7. DATABASE SAVE
      try {
        console.log('💾 Saving to database...')
        
        const propertyData = {
          title,
          description,
          price: Math.round(price * 100),
          currency,
          address,
          city,
          district,
          rooms,
          area,
          floor,
          totalFloors,
          series,
          hasElevator,
          amenities,
          categoryId,
          status: status as PropertyStatus,
          visibility: visibility as PropertyVisibility,
          isActive,
          isFeatured,
          mainImage: mainImagePath,
          images: additionalImagePaths,
          propertyProject,
          videoUrl,
          agentId: agent?.id || null
        }
        
        console.log('📝 Property data to save:', {
          ...propertyData,
          price: propertyData.price / 100, // Show in EUR for readability
          amenities: propertyData.amenities.length,
          images: propertyData.images.length,
          mainImageSize: mainImagePath ? `${mainImagePath.length} chars` : 'None'
        })

        const property = await prisma.property.create({
          data: propertyData,
          include: {
            category: true,
            agent: true
          }
        })

        console.log('✅ Property saved successfully with ID:', property.id)
        console.log('🎉 POST /api/admin/properties - SUCCESS!')

        return NextResponse.json(property)

      } catch (error) {
        logError('DATABASE_SAVE', error, { title, categoryId })
        
        // Specific Prisma errors
        if (error instanceof Error) {
          if (error.message.includes('Foreign key constraint')) {
            return NextResponse.json({ error: "Kategorija neeksistē" }, { status: 400 })
          }
          if (error.message.includes('Unique constraint')) {
            return NextResponse.json({ error: "Īpašums ar šādu nosaukumu jau eksistē" }, { status: 400 })
          }
          if (error.message.includes('String too long')) {
            return NextResponse.json({ error: "Attēli pārāk lieli datubāzei" }, { status: 413 })
          }
        }
        
        return NextResponse.json({ error: "Kļūda saglabājot īpašumu datubāzē" }, { status: 500 })
      }

    } else {
      // JSON REQUEST HANDLING
      console.log('📋 Processing JSON request...')
      
      try {
        const data = await req.json()
        console.log('📝 JSON data received:', data)

        const property = await prisma.property.create({
          data: {
            title: data.title,
            description: data.description,
            price: Math.round((data.price || 0) * 100),
            currency: data.currency || "EUR",
            address: data.address,
            city: data.city,
            district: data.district || null,
            rooms: data.rooms || null,
            area: data.area || null,
            floor: data.floor || null,
            totalFloors: data.totalFloors || null,
            categoryId: data.categoryId,
            status: (data.status as PropertyStatus) || PropertyStatus.AVAILABLE,
            isActive: data.isActive !== undefined ? data.isActive : true,
            isFeatured: data.isFeatured !== undefined ? data.isFeatured : false,
            mainImage: null,
            images: [],
            propertyProject: data.propertyProject || null,
            agentId: agent?.id || null
          },
          include: {
            category: true,
            agent: true
          }
        })

        console.log('✅ JSON property saved:', property.id)
        return NextResponse.json(property)

      } catch (error) {
        logError('JSON_PROCESSING', error)
        return NextResponse.json({ error: "Kļūda apstrādājot JSON datus" }, { status: 500 })
      }
    }
  } catch (error) {
    logError('GENERAL', error)
    
    // Check for specific error types
    if (error instanceof Error) {
      if (error.message.includes('PayloadTooLargeError') || error.message.includes('413')) {
        return NextResponse.json({ 
          error: "Augšupielādētie faili pārāk lieli (max 50MB)" 
        }, { status: 413 })
      }
      
      if (error.message.includes('timeout')) {
        return NextResponse.json({ 
          error: "Pieprasījums beidzies ar timeout" 
        }, { status: 408 })
      }

      if (error.message.includes('ENOENT') || error.message.includes('mkdir')) {
        return NextResponse.json({ 
          error: "Serverless environment - izmanto alternatīvu failu glabāšanu" 
        }, { status: 500 })
      }
    }
    
    console.error('💥 PROPERTIES API CRITICAL ERROR:', error)
    return NextResponse.json({ 
      error: "Serveris kļūda izveidojot īpašumu", 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}