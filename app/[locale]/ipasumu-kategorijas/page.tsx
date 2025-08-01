// app/[locale]/ipasumu-kategorijas/page.tsx - AIZVIETO PILNĪBĀ
import Link from "next/link"
import Image from "next/image"
import { prisma } from "@/lib/prisma"
import Navbar from "../../components/Navbar"
import { getTranslations } from "next-intl/server"
import { 
  Home, 
  Building, 
  Building2, 
  EarthLock, 
  Store, 
  LandPlot
} from "lucide-react"

export default async function PropertyCategoriesPage() {
  const categories = await prisma.propertyCategory.findMany({
    where: { isVisible: true },
    orderBy: { order: "asc" },
    include: {
      _count: {
        select: { properties: true }
      }
    }
  })

  // Ielādējam tulkojumus
  const t = await getTranslations("PropertyCategories")

  // Drošā tulkojumu funkcija
  const safeTranslation = (key: string, fallback: string): string => {
    try {
      return t(key)
    } catch {
      return fallback
    }
  }

  const getCategoryIcon = (categoryName: string) => {
    const name = categoryName.toLowerCase()
    
    if (name.includes('zeme') || name.includes('mežs') || name.includes('land') || name.includes('forest')) {
      return <LandPlot className="w-8 h-8 text-white" />
    }
    
    if (name.includes('mājas') || name.includes('māja') || name.includes('vasarnīc') || name.includes('house') || name.includes('cottage')) {
      return <Home className="w-8 h-8 text-white" />
    }
    
    // Dzīvokļi
    if (name.includes('dzīvokļ') || name.includes('apartment')) {
      return <Building className="w-8 h-8 text-white" />
    }
   
    // Nepubliskie
    if (name.includes('nepubliskie') || name.includes('private') || name.includes('slēgt')) {
      return <EarthLock className="w-8 h-8 text-white" />
    }
    
    // Investīciju vai Komerciālie
    if (name.includes('investīc') || name.includes('komercijāl') || name.includes('investment') || name.includes('commercial')) {
      return <Store className="w-8 h-8 text-white" />
    }

    return <Building2 className="w-8 h-8 text-white" />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Navbar />
      
      <section className="relative px-6 py-20 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 bg-[#77D4B4]/10 rounded-full mb-6">
            <span className="text-[#00332D] font-medium text-sm">
              {safeTranslation('pageDescription', 'VESTATE ĪPAŠUMU KATEGORIJAS')}
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-[#00332D] mb-6">
            {safeTranslation('pageTitle', 'Īpašumu Kategorijas')}
          </h1>
          
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            {safeTranslation('pageSubtitle', 'Atrodiet savu ideālo īpašumu pie mums!')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((cat, index) => {
            // Iegūstam tulkoto nosaukumu un aprakstu
            const translatedName = safeTranslation(`category${index + 1}Name`, cat.name)
            const translatedDescription = safeTranslation(`category${index + 1}Description`, cat.description ?? "")
            
            return (
              <Link key={cat.id} href={`ipasumi/${cat.slug}`} className="group block">
                <div className="relative overflow-hidden rounded-2xl bg-white shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">

                  <div className="relative h-56 overflow-hidden">
                    {cat.image ? (
                      <Image
                        src={cat.image}
                        alt={translatedName}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#00332D] to-[#77D4B4] flex items-center justify-center">
                        {getCategoryIcon(cat.name)}
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xl font-semibold text-[#00332D] group-hover:text-[#77D4B4] transition-colors">
                        {translatedName}
                      </h3>
                      <div className="bg-[#77D4B4] text-[#00332D] px-2 py-1 rounded-full text-xs font-medium">
                        {cat._count.properties} {safeTranslation('propertiesCountText', 'īpašumi')}
                      </div>
                    </div>
                    
                    {translatedDescription && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {translatedDescription}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <span className="text-[#77D4B4] font-medium text-sm group-hover:underline">
                        {safeTranslation('viewCategoryButton', 'Skatīt kategoriju')}
                      </span>
                      <div className="w-6 h-6 rounded-full bg-[#77D4B4] flex items-center justify-center group-hover:bg-[#00332D] transition-colors">
                        <svg className="w-3 h-3 text-white transform group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {categories.length === 0 && (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <Building2 className="w-16 h-16 mx-auto" />
            </div>
            <p className="text-gray-600 text-lg">
              {safeTranslation('noPropertiesText', 'Nav īpašumu')}
            </p>
          </div>
        )}

        <div className="text-center mt-16">
          <Link 
            href="/"
            className="inline-flex items-center px-6 py-3 bg-[#00332D] text-white rounded-lg hover:bg-[#77D4B4] hover:text-[#00332D] transition-colors font-medium"
          >
            {safeTranslation('backToHomeButton', 'Atpakaļ uz sākumu')}
          </Link>
        </div>
      </section>
    </div>
  )
}
