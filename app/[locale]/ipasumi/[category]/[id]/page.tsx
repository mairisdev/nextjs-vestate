'use client'

import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"
import PropertyImageGallery from "@/app/components/PropertyImageGallery"
import PropertyDetails from "@/app/components/PropertyDetails"
import PropertyContact from "@/app/components/PropertyContact"
import Link from "next/link"
import { ArrowLeft, MapPin, Eye } from "lucide-react"
import { TrackPropertyView } from '@/app/components/TrackPropertyView'
import Navbar from "@/app/components/Navbar"
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

  <TrackPropertyView propertyId={property.id} />

  const getStatusLabel = (status: string) => {
    const statusMap = {
      'AVAILABLE': 'Pieejams',
      'RESERVED': 'Rezervēts',
      'SOLD': 'Pārdots',
      'RENTED': 'Izīrēts',
      'UNAVAILABLE': 'Nav pieejams'
    }
    return statusMap[status as keyof typeof statusMap] || status
  }

  const getStatusColor = (status: string) => {
    const colorMap = {
      'AVAILABLE': 'bg-green-600',
      'RESERVED': 'bg-yellow-600',
      'SOLD': 'bg-red-600',
      'RENTED': 'bg-blue-600',
      'UNAVAILABLE': 'bg-gray-600'
    }
    return colorMap[status as keyof typeof colorMap] || 'bg-gray-600'
  }

  const allImages = []
  if (property.mainImage) {
    allImages.push(property.mainImage)
  }
  allImages.push(...property.images)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="bg-white border-b">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-[#00332D]">Sākums</Link>
            <span>/</span>
            <Link href={`/ipasumi/${category}`} className="hover:text-[#00332D]">
              {property.category.name}
            </Link>
            <span>/</span>
            <span className="text-gray-900">{property.title}</span>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <div className="flex items-center justify-between mb-4">
                <Link 
                  href={`/ipasumi/${category}`}
                  className="flex items-center text-[#00332D] hover:underline"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Atpakaļ uz sarakstu
                </Link>
                
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Eye className="w-4 h-4" />
                    <ViewCounter propertyId={property.id} />
                  </div>
                  <span className="font-semibold">{property.propertyProject}</span>
                </div>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {property.title}
              </h1>
              
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{property.address}, {property.city}</span>
                  {property.district && <span>, {property.district}</span>}
                </div>
                
                <div className={`px-3 py-1 rounded-full text-white text-sm font-medium ${getStatusColor(property.status)}`}>
                  {getStatusLabel(property.status)}
                </div>
              </div>
            </div>

            <PropertyImageGallery images={allImages} title={property.title} />

            <PropertyDetails property={{
              ...property,
              videoUrl: property.videoUrl ?? undefined
            }} />

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Apraksts</h2>
              <div className="prose max-w-none text-gray-700">
                {property.description.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-3">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

          </div>

          <div className="space-y-6">
            <PropertyContact property={property} />
          </div>
        </div>
      </div>
    </div>
  )
}