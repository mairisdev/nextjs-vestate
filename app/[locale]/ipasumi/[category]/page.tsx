import { getPropertiesByCategory, getPropertyCategories, getCitiesAndDistrictsForCategory, getPropertyProjectsForCategory } from "@/lib/queries/properties"
import PropertyGrid from "@/app/components/PropertyGrid"
import PropertyFiltersClientWrapper from "@/app/components/PropertyFiltersClientWrapper"
import Navbar from "@/app/components/Navbar"
import { notFound } from "next/navigation"

export const dynamic = 'force-dynamic'
export const revalidate = 0

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

function ErrorDisplay({ error, category }: { error: Error, category: string }) {
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

async function CategoryPageContent({ 
  params, 
  searchParams 
}: PageProps) {
  let resolvedParams: Awaited<PageProps['params']> | undefined
  let resolvedSearchParams: Awaited<PageProps['searchParams']>
  
  try {
    // Resolve params
    try {
      resolvedParams = await params
    } catch (error) {
      throw new Error(`Params resolution failed: ${error}`)
    }

    // Resolve search params
    try {
      resolvedSearchParams = await searchParams
    } catch (error) {
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

    // Get categories
    let categories: any[]
    try {
      categories = await getPropertyCategories()
    } catch (error) {
      throw new Error(`Categories loading failed: ${error}`)
    }

    const currentCategory = categories.find((cat: any) => cat.slug === category)
    if (!currentCategory) {
      notFound()
    }

    // Get properties
    let properties: any[]
    let total: number
    let pages: number
    try {
      const result: any = await getPropertiesByCategory(category, page, 12, sort, filters)
      properties = result.properties
      total = result.total
      pages = result.pages
    } catch (error) {
      throw new Error(`Properties loading failed: ${error}`)
    }

    // Get cities & districts
    let cities: string[] = []
    let districts: string[] = []
    try {
      const result: any = await getCitiesAndDistrictsForCategory(category)
      cities = (result.cities || []).filter((city: string | null): city is string => city !== null)
      districts = (result.districts || []).filter((district: string | null): district is string => district !== null)
    } catch (error) {
      // Continue without cities/districts
    }

    // Get property projects
    let propertyProjects: string[] = []
    try {
      const result: any = await getPropertyProjectsForCategory(category)
      propertyProjects = result || []
    } catch (error) {
      // Continue without property projects
    }

    // Check for empty results
    const filtersApplied = Object.values(filters).some((v: string) => v)
    if (properties.length === 0 && page === 1 && !filtersApplied) {
      notFound()
    }

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
    const errorObj = error instanceof Error ? error : new Error(String(error))
    const categoryName = resolvedParams?.category || 'unknown'
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