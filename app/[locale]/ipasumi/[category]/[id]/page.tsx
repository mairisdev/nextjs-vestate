import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"
import PropertyImageGallery from "@/app/components/PropertyImageGallery"
import PropertyDetails from "@/app/components/PropertyDetails"
import PropertyContact from "@/app/components/PropertyContact"
import Link from "next/link"
import { ArrowLeft, MapPin, Eye } from "lucide-react"
import { TrackPropertyView } from '@/app/components/TrackPropertyView'
import Navbar from "@/app/components/server/NavbarServer"
import { ViewCounter } from "@/app/components/ViewCounter"

interface PropertyPageProps {
  params: Promise<{ category: string; id: string }>
}

async function getProperty(id: string) {
  try {
    const property = await prisma.property.findUnique({
      where: { 
        id,
        isActive: true 
      },
      include: {
        category: true,
        agent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        }
      }
    })

    return property
  } catch (error) {
    console.error("Error fetching property:", error)
    return null
  }
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  const { category, id } = await params
  
  const property = await getProperty(id)
  
  if (!property) {
    notFound()
  }

  const getStatusLabel = (status: string) => {
    const statusMap = {
      'AVAILABLE': 'Pieejams',
      'RESERVED': 'Rezervēts',
      'SOLD': 'Pārdots',
      'RENTED': 'Iznomāts'
    }
    return statusMap[status as keyof typeof statusMap] || status
  }

  const breadcrumbs = [
    { label: "Sākums", href: "/" },
    { label: "Īpašumi", href: "/ipasumi" },
    { label: property.category.name, href: `/ipasumi/${category}` },
    { label: property.title, href: "" }
  ]

  return (
    <>
      <Navbar />
      <TrackPropertyView propertyId={property.id} />
      
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumbs */}
          <nav className="flex mb-8" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
              {breadcrumbs.map((crumb, index) => (
                <li key={index} className="flex items-center">
                  {index > 0 && <span className="mx-2 text-gray-400">/</span>}
                  {crumb.href ? (
                    <Link 
                      href={crumb.href}
                      className="text-gray-600 hover:text-[#00332D] transition-colors"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-gray-900 font-medium">{crumb.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>

          {/* Back button */}
          <Link
            href={`/ipasumi/${category}`}
            className="inline-flex items-center text-[#00332D] hover:text-[#77dDB4] transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Atpakaļ uz sarakstu
          </Link>

          {/* Property header */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-[#00332D] mb-2">
                  {property.title}
                </h1>
                <div className="flex items-center text-gray-600 mb-4">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>{property.address}, {property.city}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    property.status === 'AVAILABLE' 
                      ? 'bg-green-100 text-green-800'
                      : property.status === 'RESERVED'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {getStatusLabel(property.status)}
                  </span>
                  <div className="flex items-center text-gray-500">
                    <ViewCounter propertyId={property.id} />
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-3xl font-bold text-[#00332D]">
                  €{(property.price / 100).toLocaleString('lv-LV')}
                </div>
                {property.area && (
                  <div className="text-gray-600">
                    €{Math.round(property.price / 100 / property.area)}/m²
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Property content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-8">
              <PropertyImageGallery
                images={property.images || []}
                title={property.title}
                videoUrl={property.videoUrl || undefined}
                mainImage={property.mainImage}
              />
              
              <PropertyDetails property={property} />
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <PropertyContact
                agent={property.agent}
                propertyId={property.id}
                propertyTitle={property.title}
                propertyPrice={property.price}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}