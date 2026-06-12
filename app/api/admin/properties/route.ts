// app/api/admin/properties/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { uploadImage } from '@/lib/s3'
import { PropertyStatus, PropertyVisibility } from "@prisma/client"

// Helper funkcija slug izveidošanai
function createSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[āä]/g, 'a')
    .replace(/[ēě]/g, 'e')
    .replace(/[īì]/g, 'i')
    .replace(/[ōö]/g, 'o')
    .replace(/[ūü]/g, 'u')
    .replace(/[ļ]/g, 'l')
    .replace(/[ķ]/g, 'k')
    .replace(/[ģ]/g, 'g')
    .replace(/[č]/g, 'c')
    .replace(/[š]/g, 's')
    .replace(/[ž]/g, 'z')
    .replace(/[ņ]/g, 'n')
    .replace(/[ř]/g, 'r')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim()
}

// Kļūdu logošanas funkcija
function logError(stage: string, error: any, context?: any) {
  console.error(`❌ [${stage}] Error:`, error)
  if (context) {
    console.error(`❌ [${stage}] Context:`, context)
  }
}

// Augšupielāde uz S3 (konvertē uz webp)
async function uploadToCloudinary(file: File, publicId: string): Promise<string> {
  return uploadImage(file, 'properties', { publicId })
}

export async function GET() {
  try {
    const properties = await prisma.property.findMany({
      include: {
        category: true,
        agent: true,
        _count: {
          select: { propertyViews: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json(properties)
  } catch (error) {
    logError('GET_PROPERTIES', error)
    return NextResponse.json({ error: "Kļūda ielādējot īpašumus" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  console.log('🚀 POST /api/admin/properties - START')
  
  let formData: FormData
  let title: string, description: string, price: number, currency: string
  let address: string, city: string, district: string | null, videoUrl: string | null
  let rooms: number | null, area: number | null, floor: number | null, totalFloors: number | null
  let series: string | null, hasElevator: boolean, amenities: string[]
  let categoryId: string, status: string, isActive: boolean, isFeatured: boolean
  let visibility: string, propertyProject: string | null
  let agent: any = null

  try {
    // 1. FORM DATA PARSING
    console.log('📋 Parsing form data...')
    formData = await req.formData()
    console.log('✅ Form data parsed successfully')
  } catch (error) {
    logError('FORM_DATA_PARSING', error)
    return NextResponse.json({ error: "Kļūda apstrādājot form datus" }, { status: 400 })
  }

  try {
    // 2. CURRENT AGENT
    console.log('👤 Getting current agent...')
    const agentData = await prisma.agent.findFirst({
      orderBy: { createdAt: 'desc' }
    })
    
    if (agentData) {
      agent = agentData
      console.log('✅ Current agent found:', agent.firstName, agent.lastName)
    } else {
      console.log('⚠️ No agent found in database')
    }
  } catch (error) {
    logError('AGENT_FETCH', error)
    // Turpinām bez agenta
  }

  try {
    // 3. EXTRACT FORM VALUES
    console.log('📝 Extracting form values...')
    
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

  try {
    // 4. VALIDATION
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

  // 5. CLOUDINARY FAILU UPLOAD
  let mainImagePath: string | null = null
  const additionalImagePaths: string[] = []

  try {
    console.log('📁 Processing Cloudinary uploads...')
    
    // Izveido unikālu ID īpašumam
    const timestamp = Date.now()
    const propertyId = `${createSlug(title)}-${timestamp}`
    
    // Main image upload to Cloudinary
    const mainImageFile = formData.get("mainImage") as File | null
    if (mainImageFile && mainImageFile.size > 0) {
      console.log('🖼️ Uploading main image to Cloudinary:', {
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
        const publicId = `properties/${propertyId}-main`
        mainImagePath = await uploadToCloudinary(mainImageFile, publicId)
        console.log('✅ Main image uploaded to Cloudinary:', mainImagePath)
      } catch (uploadError) {
        console.error('❌ Failed to upload main image to Cloudinary:', uploadError)
        return NextResponse.json({ 
          error: "Neizdevās augšupielādēt galveno attēlu" 
        }, { status: 500 })
      }
    }

    // Additional images upload to Cloudinary
    let imageIndex = 0
    while (true) {
      const additionalImageFile = formData.get(`additionalImage${imageIndex}`) as File | null
      if (!additionalImageFile || additionalImageFile.size === 0) break

      console.log(`🖼️ Uploading additional image ${imageIndex + 1} to Cloudinary:`, {
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
        const publicId = `properties/${propertyId}-${imageIndex + 1}`
        const imageUrl = await uploadToCloudinary(additionalImageFile, publicId)
        additionalImagePaths.push(imageUrl)
        console.log(`✅ Additional image ${imageIndex + 1} uploaded to Cloudinary:`, imageUrl)
      } catch (uploadError) {
        console.error(`❌ Failed to upload additional image ${imageIndex + 1} to Cloudinary:`, uploadError)
        // Turpinām ar citiem attēliem
      }
      
      imageIndex++
    }

    console.log('✅ All images uploaded to Cloudinary successfully')
  } catch (error) {
    logError('CLOUDINARY_UPLOAD', error, { title })
    return NextResponse.json({ error: "Kļūda augšupielādējot attēlus" }, { status: 500 })
  }

  // 6. DATABASE SAVE
  try {
    console.log('💾 Saving to database...')
    
    const propertyData = {
      title,
      description,
      price: Math.round(price * 100), // Konvertējam uz centiem
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
    
    return NextResponse.json(property, { status: 201 })
  } catch (error) {
    logError('DATABASE_SAVE', error, { title })
    return NextResponse.json({ error: "Kļūda saglabājot īpašumu" }, { status: 500 })
  }
}