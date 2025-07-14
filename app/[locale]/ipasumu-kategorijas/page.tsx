import Link from "next/link"
import Image from "next/image"
import { prisma } from "@/lib/prisma"
import Navbar from "../../components/Navbar"
import { 
  Home, 
  Building, 
  Building2, 
  EarthLock, 
  Store, 
  LandPlot
} from "lucide-react"

export default async function PropertyLandingPage() {
  const categories = await prisma.propertyCategory.findMany({
    where: { isVisible: true },
    orderBy: { order: "asc" },
  })

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
            <span className="text-[#00332D] font-medium text-sm">VESTATE ĪPAŠUMU KATEGORIJAS</span>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Atrodiet savu ideālo īpašumu pie mums!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((cat, index) => (
            <Link key={cat.id} href={`ipasumi/${cat.slug}`} className="group block">
              <div className="relative overflow-hidden rounded-2xl bg-white shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">

                <div className="relative h-56 overflow-hidden">
                  {cat.image ? (
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      width={600}
                      height={400}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    // Placeholder ar kategorijas nosaukumu
                    <div className="w-full h-full bg-gradient-to-br from-[#77D4B4]/20 via-[#77D4B4]/10 to-[#00332D]/10 flex items-center justify-center relative overflow-hidden">
                      {/* Dekoratīvi elementi */}
                      <div className="absolute top-0 left-0 w-20 h-20 bg-[#77D4B4]/20 rounded-full -translate-x-10 -translate-y-10 group-hover:scale-150 transition-transform duration-700"></div>
                      <div className="absolute bottom-0 right-0 w-16 h-16 bg-[#00332D]/20 rounded-full translate-x-8 translate-y-8 group-hover:scale-150 transition-transform duration-700"></div>
                      <div className="absolute top-1/2 left-1/4 w-3 h-3 bg-[#77D4B4]/30 rounded-full group-hover:scale-300 transition-transform duration-500"></div>
                      <div className="absolute top-1/4 right-1/3 w-2 h-2 bg-[#00332D]/30 rounded-full group-hover:scale-200 transition-transform duration-700"></div>
                      
                      {/* Centrālais saturs */}
                      <div className="text-center z-10 relative">
                        <div className="w-16 h-16 bg-gradient-to-br from-[#77D4B4] to-[#00332D] rounded-2xl flex items-center justify-center mb-3 mx-auto group-hover:rotate-12 transition-transform duration-300">
                          {getCategoryIcon(cat.name)}
                        </div>
                        <h3 className="text-lg font-bold text-[#00332D] leading-tight px-4">
                          {cat.name}
                        </h3>
                      </div>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-[#00332D]/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="absolute top-4 left-4">
                    <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                      <span className="text-[#00332D] font-medium text-sm">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center mb-3">
                    <div className="w-1 h-6 bg-[#77D4B4] rounded-full mr-3"></div>
                    <h2 className="text-xl font-bold text-[#00332D] group-hover:text-[#77D4B4] transition-colors">
                      {cat.name}
                    </h2>
                  </div>
                  
                  {cat.description && (
                    <p className="text-gray-600 text-sm leading-relaxed mb-4">
                      {cat.description}
                    </p>
                  )}
                  
                  <div className="flex items-center text-[#00332D] group-hover:text-[#77D4B4] transition-colors">
                    <span className="font-medium text-sm mr-2">Skatīt vairāk</span>
                    <svg 
                      className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-[#77D4B4] to-[#00332D] group-hover:w-full transition-all duration-500"></div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="px-6 py-16 max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-[#00332D] to-[#00332D]/90 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">

          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 left-0 w-32 h-32 bg-[#77D4B4] rounded-full -translate-x-16 -translate-y-16"></div>
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-[#77D4B4] rounded-full translate-x-24 translate-y-24"></div>
          </div>
          
          <div className="relative z-10">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Neatradāt to, ko meklējat?
            </h2>
            <p className="text-white/80 mb-6 max-w-2xl mx-auto">
              Sazinieties ar mūsu ekspertiem, un mēs palīdzēsim jums atrast ideālo īpašumu
            </p>
            <button className="bg-[#77D4B4] text-[#00332D] px-8 py-3 rounded-full font-semibold hover:bg-white transition-colors">
              Sazināties ar mums
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
