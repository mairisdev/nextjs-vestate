import { getPropertiesByCategory, getPropertyCategories, getCitiesAndDistrictsForCategory, getPropertyProjectsForCategory } from "@/lib/queries/properties"
import PropertyGrid from "../../../components/PropertyGrid"
import PropertyFiltersClientWrapper from "../../../components/PropertyFiltersClientWrapper"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import Navbar from "../../../components/Navbar"

// ✅ PAREIZI - saglabājam Promise wrappers (Next.js 15 prasība)
interface PageProps {
  params: Promise<{ category: string }>
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

// ✅ PAREIZI - izmantojam async funkciju ar await
async function CategoryPageContent({ 
  params, 
  searchParams 
}: PageProps) {
  // ✅ PAREIZI - await ir nepieciešams Next.js 15 server komponentēs
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  
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
  
  const { properties, total, pages } = await getPropertiesByCategory(
    resolvedParams.category, 
    page, 
    12, 
    sort, 
    filters
  )
  
  // Only call notFound if no properties and no filters are applied
  const filtersApplied = Object.values(filters).some(v => v)
  if (properties.length === 0 && page === 1 && !filtersApplied) {
    notFound()
  }

  const categories = await getPropertyCategories()
  const currentCategory = categories.find(cat => cat.slug === resolvedParams.category)

  if (!currentCategory) {
    notFound()
  }

  const { cities, districts } = await getCitiesAndDistrictsForCategory(resolvedParams.category)
  const propertyProjects = await getPropertyProjectsForCategory(resolvedParams.category) || []

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
              currentCategory={resolvedParams.category}
              cities={cities.filter((city: string | null): city is string => city !== null)}
              districts={districts.filter((district: string | null): district is string => district !== null)}
              propertyProjects={propertyProjects}
            />
          </div>

          <div className="flex-1">
            <PropertyGrid 
              properties={properties}
              currentPage={page}
              totalPages={pages}
              category={resolvedParams.category}
              total={total}
            />
          </div>
        </div>
      </div>
    </>
  )
}

// ✅ JAUNS - async operācijas pārvietotas uz atsevišķu komponentu
async function CategoryPageContentAsync({ 
  category, 
  page, 
  filters, 
  sort 
}: {
  category: string
  page: number
  filters: any
  sort: string
}) {
  try {
    const { properties, total, pages } = await getPropertiesByCategory(
      category, 
      page, 
      12, 
      sort, 
      filters
    )
    
    // Only call notFound if no properties and no filters are applied
    const filtersApplied = Object.values(filters).some(v => v)
    if (properties.length === 0 && page === 1 && !filtersApplied) {
      notFound()
    }

    const categories = await getPropertyCategories()
    const currentCategory = categories.find(cat => cat.slug === category)

    if (!currentCategory) {
      notFound()
    }

    const { cities, districts } = await getCitiesAndDistrictsForCategory(category)
    const propertyProjects = await getPropertyProjectsForCategory(category) || []

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
                currentCategory={category} // ✅ IZLABOTS - tieši category
                cities={cities.filter((city: string | null): city is string => city !== null)}
                districts={districts.filter((district: string | null): district is string => district !== null)}
                propertyProjects={propertyProjects}
              />
            </div>

            <div className="flex-1">
              <PropertyGrid 
                properties={properties}
                currentPage={page}
                totalPages={pages}
                category={category} // ✅ IZLABOTS - tieši category
                total={total}
              />
            </div>
          </div>
        </div>
      </>
    )
  } catch (error) {
    console.error('CategoryPageContentAsync error:', error)
    throw error
  }
}

export async function generateStaticParams() {
  const categories = await getPropertyCategories()
  return categories.map((category) => ({
    category: category.slug,
  }))
}

// ✅ IZLABOTS - noņemti Promise wrappers no params un searchParams
export default function CategoryPage({ params, searchParams }: PageProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <CategoryPageContent params={params} searchParams={searchParams} />
    </div>
  )
}