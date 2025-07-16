import { getPropertiesByCategory, getPropertyCategories, getCitiesAndDistrictsForCategory, getPropertyProjectsForCategory } from "@/lib/queries/properties"
import PropertyGrid from "../../../components/PropertyGrid"
import PropertyFiltersClientWrapper from "../../../components/PropertyFiltersClientWrapper"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import Navbar from "../../../components/Navbar"

interface PageProps {
  params: { category: string } // Noņemam Promise wrapper
  searchParams: {
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
  } // Noņemam Promise wrapper
}

// Pārveidojam par sync funkciju
function CategoryPageContent({ 
  params, 
  searchParams 
}: PageProps) {
  // Noņemam await - params un searchParams nav promises Next.js 15
  const page = parseInt(searchParams.page || "1")
  const filters = {
    minPrice: searchParams.minPrice || '',
    maxPrice: searchParams.maxPrice || '',
    rooms: searchParams.rooms || '',
    minArea: searchParams.minArea || '',
    maxArea: searchParams.maxArea || '',
    city: searchParams.city || '',
    district: searchParams.district || '',
    propertyProject: searchParams.propertyProject || '',
  }
  const sort = searchParams['kartot-pec'] || ""
  
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CategoryPageContentAsync 
        category={params.category}
        page={page}
        filters={filters}
        sort={sort}
      />
    </Suspense>
  )
}

// Async operācijas pārvietojam uz atsevišķu komponentu
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
                currentCategory={category}
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
                category={category}
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

export default function CategoryPage({ params, searchParams }: PageProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <CategoryPageContent params={params} searchParams={searchParams} />
    </div>
  )
}