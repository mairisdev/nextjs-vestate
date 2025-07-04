import { getPropertiesByCategory, getPropertyCategories } from "@/lib/queries/properties"
import PropertyGrid from "../../components/PropertyGrid"
import PropertyFilters from "../../components/PropertyFilters"
import { notFound } from "next/navigation"

interface PageProps {
  params: Promise<{ category: string }>
  searchParams: Promise<{ 
    page?: string
    minPrice?: string
    maxPrice?: string
    rooms?: string
    minArea?: string
    maxArea?: string
  }>
}

export async function generateStaticParams() {
  const categories = await getPropertyCategories()
  return categories.map((category) => ({
    category: category.slug,
  }))
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  // Await params un searchParams
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  
  const page = parseInt(resolvedSearchParams.page || "1")
  const { properties, total, pages } = await getPropertiesByCategory(resolvedParams.category, page, 12)
  
  if (properties.length === 0 && page === 1) {
    notFound()
  }

  const categories = await getPropertyCategories()
  const currentCategory = categories.find(cat => cat.slug === resolvedParams.category)

  if (!currentCategory) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
          {/* Filters Sidebar */}
          <div className="lg:w-80 flex-shrink-0">
            <PropertyFilters 
              categories={categories}
              currentCategory={resolvedParams.category}
            />
          </div>

          {/* Properties Grid */}
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
