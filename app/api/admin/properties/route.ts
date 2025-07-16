import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
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
          title, price, currency, address, city, categoryId, status, visibility
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

      // 6. VIENKĀRŠS FAILU UPLOAD
      let mainImagePath: string | null = null
      const additionalImagePaths: string[] = []

      try {
        console.log('📁 Processing simple file uploads...')
        
        // Izveido uploads/properties mapi (NE public!)
        const uploadsDir = path.join(process.cwd(), "uploads", "properties")
        console.log('📂 Upload directory:', uploadsDir)
        
        try {
          await mkdir(uploadsDir, { recursive: true })
          console.log('✅ Upload directory created/exists')
        } catch (mkdirError) {
          console.error('❌ Failed to create upload directory:', mkdirError)
          return NextResponse.json({ 
            error: "Nevar izveidot upload direktoriju" 
          }, { status: 500 })
        }

        // Izveido unikālu ID īpašumam
        const timestamp = Date.now()
        const propertyId = `${createSlug(title)}-${timestamp}`
        
        // Main image
        const mainImageFile = formData.get("mainImage") as File | null
        if (mainImageFile && mainImageFile.size > 0) {
          console.log('🖼️ Processing main image:', {
            name: mainImageFile.name,
            size: mainImageFile.size,
            type: mainImageFile.type
          })
          
          // Check file size
          if (mainImageFile.size > 10 * 1024 * 1024) {
            console.error('❌ Main image too large:', mainImageFile.size)
            return NextResponse.json({ 
              error: "Galvenais attēls pārāk liels (max 10MB)" 
            }, { status: 413 })
          }
          
          try {
            const ext = path.extname(mainImageFile.name) || ".jpg"
            const fileName = `${propertyId}-main${ext}`
            const filePath = path.join(uploadsDir, fileName)
            
            const buffer = Buffer.from(await mainImageFile.arrayBuffer())
            await writeFile(filePath, buffer)
            
            // Saglabā relatīvo ceļu datubāzē
            mainImagePath = `properties/${fileName}`
            console.log('✅ Main image saved:', mainImagePath)
            
          } catch (saveError) {
            console.error('❌ Failed to save main image:', saveError)
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
          if (additionalImageFile.size > 10 * 1024 * 1024) {
            console.error(`❌ Additional image ${imageIndex + 1} too large:`, additionalImageFile.size)
            return NextResponse.json({ 
              error: `Attēls ${imageIndex + 1} pārāk liels (max 10MB)` 
            }, { status: 413 })
          }

          try {
            const ext = path.extname(additionalImageFile.name) || ".jpg"
            const fileName = `${propertyId}-${imageIndex + 1}${ext}`
            const filePath = path.join(uploadsDir, fileName)
            
            const buffer = Buffer.from(await additionalImageFile.arrayBuffer())
            await writeFile(filePath, buffer)
            
            // Saglabā relatīvo ceļu datubāzē
            const relativePath = `properties/${fileName}`
            additionalImagePaths.push(relativePath)
            console.log(`✅ Additional image ${imageIndex + 1} saved:`, relativePath)
            
          } catch (saveError) {
            console.error(`❌ Failed to save additional image ${imageIndex + 1}:`, saveError)
            // Turpinām ar citiem attēliem
          }
          
          imageIndex++
        }

        console.log('✅ All files processed successfully')

      } catch (error) {
        logError('FILE_UPLOAD', error, { title })
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
          title,
          price: propertyData.price / 100,
          mainImage: mainImagePath,
          additionalImages: additionalImagePaths.length
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
        }
        
        return NextResponse.json({ error: "Kļūda saglabājot īpašumu datubāzē" }, { status: 500 })
      }

    } else {
      // JSON REQUEST HANDLING (bez attēliem)
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
    
    console.error('💥 PROPERTIES API CRITICAL ERROR:', error)
    return NextResponse.json({ 
      error: "Serveris kļūda izveidojot īpašumu", 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}