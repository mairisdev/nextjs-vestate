import { getPropertiesByCategory, getPropertyCategories, getCitiesAndDistrictsForDzivokli, getProjectsForCategory } from "@/lib/queries/properties"
import PropertyGrid from "../../components/PropertyGrid"
import PropertyFiltersClientWrapper from "../../components/PropertyFiltersClientWrapper"
import { notFound } from "next/navigation"
import Navbar from "../../components/Navbar"

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
    'kartot-pec'?: string
  }>
}

export async function generateStaticParams() {
  const categories = await getPropertyCategories()
  return categories.map((category) => ({
    category: category.slug,
  }))
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
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
  }
  const sort = resolvedSearchParams['kartot-pec'] || ""
  const { properties, total, pages } = await getPropertiesByCategory(resolvedParams.category, page, 12, sort, filters)
  
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

  let cities: string[] = []
  let districts: string[] = []
  if (resolvedParams.category === 'dzivokli') {
    const result = await getCitiesAndDistrictsForDzivokli()
    cities = result.cities.filter((c): c is string => Boolean(c))
    districts = result.districts.filter((d): d is string => Boolean(d))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
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
              cities={cities}
              districts={districts}
            />
          </div>

          <div className="flex-1">
            <PropertyGrid 
              properties={properties}
              currentPage={page}
              totalPages={pages}
              category={resolvedParams.category}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
