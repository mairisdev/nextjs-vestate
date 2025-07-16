import { getPropertiesByCategory, getPropertyCategories, getCitiesAndDistrictsForCategory, getPropertyProjectsForCategory } from "@/lib/queries/properties"
import PropertyGrid from "@/app/components/PropertyGrid"
import PropertyFiltersClientWrapper from "@/app/components/PropertyFiltersClientWrapper"
import Navbar from "@/app/components/Navbar"
import { notFound } from "next/navigation"

// SVARĪGI: Pievieno šos exports lai izslēgtu static generation
export const dynamic = 'force-dynamic'
export const revalidate = 0

// ✅ PAREIZI - saglabājam Promise wrappers (Next.js 15 prasība)
interface PageProps {
  params: Promise<{ locale: string; category: string }>
  searchParams: Promise<{
    page?: string
    minPrice?: string
    maxPrice?: string
    rooms?: string
    minArea?: string
    maxArea?: string
    city?: string
    district?: string
    propertyProject?: string
    status?: string
    'kartot-pec'?: string
  }>
}

// ERROR REPORTING KOMPONENTE
function ErrorDisplay({ error, category }: { error: Error, category: string }) {
  console.error('=== CATEGORY PAGE ERROR ===')
  console.error('Category:', category)
  console.error('Error:', error)
  console.error('Error message:', error?.message)
  console.error('Error stack:', error?.stack)
  console.error('==========================')

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-red-600 mb-2">500 - Server kļūda</h1>
          <p className="text-gray-600">Kategorijas lapā radusies neparedzēta kļūda</p>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-red-800 mb-2">Debug informācija:</h3>
          <div className="text-sm text-red-700 space-y-1">
            <p><strong>Kategorija:</strong> {category}</p>
            <p><strong>Kļūda:</strong> {error?.message || 'Nezināma kļūda'}</p>
            <p><strong>Tips:</strong> {error?.constructor?.name || 'Unknown'}</p>
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-800 mb-2">Iespējamie cēloņi:</h3>
          <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
            <li>Datubāzes savienojuma problēma</li>
            <li>Kategorija neeksistē datubāzē</li>
            <li>Prisma kļūda getPropertiesByCategory funkcijā</li>
            <li>getPropertyCategories funkcijas problēma</li>
            <li>getCitiesAndDistrictsForCategory kļūda</li>
            <li>getPropertyProjectsForCategory kļūda</li>
          </ul>
        </div>

        <div className="flex justify-center space-x-4">
          <a 
            href="/ipasumi" 
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Atgriezties uz īpašumiem
          </a>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Mēģināt vēlreiz
          </button>
        </div>
      </div>
    </div>
  )
}

// ✅ PAREIZI - izmantojam async funkciju ar await
async function CategoryPageContent({ 
  params, 
  searchParams 
}: PageProps) {
  // Inicializējam ar undefined, lai TypeScript nezina
  let resolvedParams: Awaited<PageProps['params']> | undefined
  let resolvedSearchParams: Awaited<PageProps['searchParams']>
  
  try {
    console.log('=== CATEGORY PAGE START ===')
    
    // 1. PĀRBAUDA PARAMS
    try {
      resolvedParams = await params
      console.log('✅ Resolved params:', resolvedParams)
    } catch (error) {
      console.error('❌ Error resolving params:', error)
      throw new Error(`Params resolution failed: ${error}`)
    }

    // 2. PĀRBAUDA SEARCH PARAMS
    try {
      resolvedSearchParams = await searchParams
      console.log('✅ Resolved searchParams:', resolvedSearchParams)
    } catch (error) {
      console.error('❌ Error resolving searchParams:', error)
      // Ja searchParams neizdevās, izmantojam default vērtības
      console.warn('⚠️ Using default searchParams due to error')
      resolvedSearchParams = {
        page: '1',
        minPrice: '',
        maxPrice: '',
        rooms: '',
        minArea: '',
        maxArea: '',
        city: '',
        district: '',
        propertyProject: '',
        status: '',
        'kartot-pec': ''
      }
    }

    const category = resolvedParams.category
    console.log('📂 Processing category:', category)
    
    const page = parseInt(resolvedSearchParams.page || "1")
    const filters = {
      minPrice: resolvedSearchParams.minPrice || '',
      maxPrice: resolvedSearchParams.maxPrice || '',
      rooms: resolvedSearchParams.rooms || '',
      minArea: resolvedSearchParams.minArea || '',
      maxArea: resolvedSearchParams.maxArea || '',
      city: resolvedSearchParams.city || '',
      district: resolvedSearchParams.district || '',
      propertyProject: resolvedSearchParams.propertyProject || '',
    }
    const sort = resolvedSearchParams['kartot-pec'] || ""
    
    console.log('📊 Query params:', { page, filters, sort })

    // 3. PĀRBAUDA KATEGORIJAS - Izmantojam any, lai izvairītos no type checking
    let categories: any[]
    try {
      console.log('🔍 Getting all categories...')
      categories = await getPropertyCategories()
      console.log('✅ Categories loaded:', categories?.length || 0)
      console.log('📋 Available category slugs:', categories?.map((c: any) => c.slug) || [])
    } catch (error) {
      console.error('❌ getPropertyCategories failed:', error)
      throw new Error(`Categories loading failed: ${error}`)
    }

    const currentCategory = categories.find((cat: any) => cat.slug === category)
    console.log('🎯 Current category found:', currentCategory ? '✅' : '❌')
    
    if (!currentCategory) {
      console.error('❌ Category not found:', category)
      console.error('Available categories:', categories.map((c: any) => ({ id: c.id, slug: c.slug, name: c.name })))
      notFound()
    }

    // 4. PĀRBAUDA PROPERTIES - Izmantojam any
    let properties: any[]
    let total: number
    let pages: number
    try {
      console.log('🏠 Getting properties for category:', category)
      const result: any = await getPropertiesByCategory(category, page, 12, sort, filters)
      properties = result.properties
      total = result.total
      pages = result.pages
      console.log('✅ Properties loaded:', { count: properties?.length || 0, total, pages })
    } catch (error) {
      console.error('❌ getPropertiesByCategory failed:', error)
      console.error('Failed with params:', { category, page, sort, filters })
      throw new Error(`Properties loading failed: ${error}`)
    }

    // 5. PĀRBAUDA CITIES & DISTRICTS
    let cities: string[] = []
    let districts: string[] = []
    try {
      console.log('🏙️ Getting cities and districts...')
      const result: any = await getCitiesAndDistrictsForCategory(category)
      cities = (result.cities || []).filter((city: string | null): city is string => city !== null)
      districts = (result.districts || []).filter((district: string | null): district is string => district !== null)
      console.log('✅ Cities/Districts loaded:', { cities: cities.length, districts: districts.length })
    } catch (error) {
      console.error('❌ getCitiesAndDistrictsForCategory failed:', error)
      console.warn('⚠️ Continuing without cities/districts')
      // Ne-bloķē, turpinām bez cities/districts
    }

    // 6. PĀRBAUDA PROPERTY PROJECTS
    let propertyProjects: string[] = []
    try {
      console.log('🏗️ Getting property projects...')
      const result: any = await getPropertyProjectsForCategory(category)
      propertyProjects = result || []
      console.log('✅ Property projects loaded:', propertyProjects.length)
    } catch (error) {
      console.error('❌ getPropertyProjectsForCategory failed:', error)
      console.warn('⚠️ Continuing without property projects')
      // Ne-bloķē, turpinām bez projects
    }

    // 7. PĀRBAUDA EMPTY RESULTS
    const filtersApplied = Object.values(filters).some((v: string) => v)
    if (properties.length === 0 && page === 1 && !filtersApplied) {
      console.log('📭 No properties found for category, calling notFound()')
      notFound()
    }

    console.log('✅ All data loaded successfully!')
    console.log('=== CATEGORY PAGE SUCCESS ===')

    return (
      <>
        <div className="bg-white border-b">
          <div className="max-w-[1600px] mx-auto px-6 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {currentCategory.name}
            </h1>
            {currentCategory.description && (
              <p className="text-gray-600">{currentCategory.description}</p>
            )}
            <p className="text-sm text-gray-500 mt-2">
              Atrasti {total} īpašumi
            </p>
          </div>
        </div>

        <div className="max-w-[1600px] mx-auto px-6 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-80 flex-shrink-0">
              <PropertyFiltersClientWrapper 
                categories={categories}
                currentCategory={category}
                cities={cities}
                districts={districts}
                propertyProjects={propertyProjects}
              />
            </div>

            <div className="flex-1">
              <PropertyGrid 
                properties={properties}
                currentPage={page}
                totalPages={pages}
                category={category}
                total={total}
              />
            </div>
          </div>
        </div>
      </>
    )

  } catch (error) {
    console.error('💥 CATEGORY PAGE CRITICAL ERROR:', error)
    
    // Type assertion lai TypeScript zina, ka error ir Error tips
    const errorObj = error instanceof Error ? error : new Error(String(error))
    
    // Pārbaudām vai resolvedParams ir definēts
    const categoryName = resolvedParams?.category || 'unknown'
    
    // Atgriežam error komponentu ar detalizētu informāciju
    return <ErrorDisplay error={errorObj} category={categoryName} />
  }
}

export default function CategoryPage({ params, searchParams }: PageProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <CategoryPageContent params={params} searchParams={searchParams} />
    </div>
  )
}