import { prisma } from "@/lib/prisma"
import { PropertyStatus, PropertyVisibility } from "@prisma/client"

// Esošā funkcija - atjaunināta ar visibility filtru
export async function getAllProperties(page = 1, limit = 12) {
  const skip = (page - 1) * limit

  const properties = await prisma.property.findMany({
    where: { 
      isActive: true,
      visibility: 'public' // Tikai publiskie īpašumi
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
    },
    orderBy: { createdAt: 'desc' },
    skip,
    take: limit
  })

  const total = await prisma.property.count({
    where: { 
      isActive: true,
      visibility: 'public'
    }
  })

  return { properties, total, pages: Math.ceil(total / limit) }
}

// Esošā funkcija - atjaunināta ar visibility filtru
export async function getCitiesAndDistrictsForCategory(categorySlug: string) {
  const properties = await prisma.property.findMany({
    where: {
      category: { slug: categorySlug },
      isActive: true,
      visibility: 'public' // Tikai publiskie
    },
    select: {
      city: true,
      district: true,
    },
  })
  const cities = Array.from(new Set(properties.map(p => p.city).filter(Boolean)))
  const districts = Array.from(new Set(properties.map(p => p.district).filter(Boolean)))
  return { cities, districts }
}

// Esošā funkcija - atjaunināta ar visibility filtru
export async function getPropertyProjectsForCategory(categorySlug: string) {
  const properties = await prisma.property.findMany({
    where: {
      category: { slug: categorySlug },
      isActive: true,
      visibility: 'public', // Tikai publiskie
      propertyProject: {
        not: null
      }
    },
    select: {
      propertyProject: true,
    },
    distinct: ['propertyProject']
  })
  
  return properties
    .map(p => p.propertyProject)
    .filter((project): project is string => project !== null)
    .sort()
}

// Atjaunināta funkcija ar visibility atbalstu
export async function getPropertiesWithFilters(filters: any, page = 1, limit = 12) {
  const skip = (page - 1) * limit
  
  const where: any = { 
    isActive: true,
    visibility: 'public' // Tikai publiskie īpašumi pēc noklusējuma
  }

  // Kategorijas filtrs
  if (filters.categorySlug && filters.categorySlug !== 'all') {
    where.category = { slug: filters.categorySlug }
  }

  // Cenas filtrs
  if (filters.minPrice || filters.maxPrice) {
    where.price = {}
    if (filters.minPrice) where.price.gte = parseInt(filters.minPrice) * 100
    if (filters.maxPrice) where.price.lte = parseInt(filters.maxPrice) * 100
  }

  // Istabu filtrs
  if (filters.rooms && filters.rooms.length > 0) {
    const roomFilters = filters.rooms.map((room: string) => {
      if (room === '+') {
        return { rooms: { gte: 6 } }
      }
      return { rooms: parseInt(room) }
    })
    where.OR = roomFilters
  }

  // Pilsētas filtrs
  if (filters.city) {
    where.city = filters.city
  }

  // Rajona filtrs
  if (filters.district) {
    where.district = filters.district
  }

  // Projekta filtrs
  if (filters.propertyProject) {
    where.propertyProject = filters.propertyProject
  }

  // Sakārtošana
  let orderBy: any = { createdAt: 'desc' }
  if (filters.sortBy) {
    switch (filters.sortBy) {
      case 'price_asc':
        orderBy = { price: 'asc' }
        break
      case 'price_desc':
        orderBy = { price: 'desc' }
        break
      case 'area_asc':
        orderBy = { area: 'asc' }
        break
      case 'area_desc':
        orderBy = { area: 'desc' }
        break
      case 'newest':
        orderBy = { createdAt: 'desc' }
        break
      case 'oldest':
        orderBy = { createdAt: 'asc' }
        break
    }
  }

  const properties = await prisma.property.findMany({
    where,
    select: {
      id: true,
      propertyProject: true,
      title: true,
      price: true,
      currency: true,
      address: true,
      city: true,
      district: true,
      rooms: true,
      area: true,
      floor: true,
      totalFloors: true,
      status: true,
      visibility: true, // Pievienojam visibility
      mainImage: true,
      images: true,
      isActive: true,
      isFeatured: true,
      createdAt: true,
      category: {
        select: {
          name: true,
          slug: true,
        }
      },
      agent: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true
        }
      }
    },
    orderBy,
    skip,
    take: limit
  })

  const total = await prisma.property.count({
    where
  })

  return { properties, total, pages: Math.ceil(total / limit) }
}

// Jauna funkcija privātajiem īpašumiem
export async function getPrivateProperties(userEmail: string, page = 1, limit = 12) {
  // Pārbaudam vai lietotājam ir derīga piekļuve
  const access = await prisma.accessRequest.findFirst({
    where: {
      email: userEmail,
      verified: true,
      validUntil: {
        gt: new Date(),
      },
    },
  })

  if (!access) {
    return { properties: [], total: 0, pages: 0 }
  }

  const skip = (page - 1) * limit
  
  const where = { 
    isActive: true,
    visibility: 'private' as PropertyVisibility
  }

  const properties = await prisma.property.findMany({
    where,
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
    },
    orderBy: { createdAt: 'desc' },
    skip,
    take: limit
  })

  const total = await prisma.property.count({ where })
  return { properties, total, pages: Math.ceil(total / limit) }
}

// Jauna funkcija privāto īpašumu priekšskatījumam (bez piekļuves)
export async function getPrivatePropertiesPreview(categorySlug?: string, page = 1, limit = 12) {
  const skip = (page - 1) * limit
  
  const where: any = { 
    isActive: true,
    visibility: 'private' as PropertyVisibility
  }

  if (categorySlug && categorySlug !== 'all') {
    where.category = { slug: categorySlug }
  }

  const properties = await prisma.property.findMany({
    where,
    select: {
      id: true,
      title: true,
      price: true,
      currency: true,
      address: true,
      city: true,
      rooms: true,
      area: true,
      mainImage: true,
      visibility: true,
      category: {
        select: {
          name: true,
          slug: true
        }
      },
      agent: {
        select: {
          firstName: true,
          lastName: true
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    skip,
    take: limit
  })

  const total = await prisma.property.count({ where })
  return { properties, total, pages: Math.ceil(total / limit) }
}

// Esošā funkcija
export async function getFeaturedProperties(limit = 6) {
  return await prisma.property.findMany({
    where: {
      isActive: true,
      isFeatured: true,
      visibility: 'public' // Tikai publiskie featured
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
    },
    orderBy: { createdAt: 'desc' },
    take: limit
  })
}

// Admin funkcija - rāda visus īpašumus (gan publiskos, gan privātos)
export async function getAllPropertiesForAdmin(page = 1, limit = 12) {
  const skip = (page - 1) * limit

  const properties = await prisma.property.findMany({
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
    },
    orderBy: { createdAt: 'desc' },
    skip,
    take: limit
  })

  const total = await prisma.property.count()
  return { properties, total, pages: Math.ceil(total / limit) }
}

// Funkcija iegūt īpašumu pēc ID (ar visibility pārbaudi)
export async function getPropertyById(id: string, userEmail?: string) {
  const property = await prisma.property.findUnique({
    where: { id },
    include: {
      category: true,
      agent: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          title: true,
          image: true
        }
      }
    }
  })

  if (!property) {
    return null
  }

  // Ja īpašums ir privāts, pārbaudam piekļuvi
  if (property.visibility === 'private') {
    if (!userEmail) {
      return null // Nav piekļuves
    }

    const access = await prisma.accessRequest.findFirst({
      where: {
        email: userEmail,
        verified: true,
        validUntil: {
          gt: new Date(),
        },
      },
    })

    if (!access) {
      return null // Nav derīgas piekļuves
    }
  }

  return property
}

// Funkcija īpašumu meklēšanai
export async function searchProperties(query: string, page = 1, limit = 12) {
  const skip = (page - 1) * limit
  
  const where = {
    isActive: true,
    visibility: 'public' as PropertyVisibility,
    OR: [
      { title: { contains: query, mode: 'insensitive' as const } },
      { description: { contains: query, mode: 'insensitive' as const } },
      { address: { contains: query, mode: 'insensitive' as const } },
      { city: { contains: query, mode: 'insensitive' as const } },
      { district: { contains: query, mode: 'insensitive' as const } },
    ]
  }

  const properties = await prisma.property.findMany({
    where,
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
    },
    orderBy: { createdAt: 'desc' },
    skip,
    take: limit
  })

  const total = await prisma.property.count({ where })
  return { properties, total, pages: Math.ceil(total / limit) }
}

// Funkcija līdzīgu īpašumu iegūšanai
export async function getSimilarProperties(propertyId: string, categoryId: string, limit = 4) {
  return await prisma.property.findMany({
    where: {
      isActive: true,
      visibility: 'public',
      categoryId,
      id: { not: propertyId }
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
    },
    orderBy: { createdAt: 'desc' },
    take: limit
  })
}