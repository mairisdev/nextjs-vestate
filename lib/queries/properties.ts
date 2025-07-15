import { prisma } from "@/lib/prisma"

// PropertyCategories funkcija
export async function getPropertyCategories() {
  return await prisma.propertyCategory.findMany({
    where: { isVisible: true },
    include: {
      _count: {
        select: {
          properties: {
            where: {
              isActive: true
              // Iekļaujam gan publiskos, gan privātos īpašumus
            }
          }
        }
      }
    },
    orderBy: { order: 'asc' }
  })
}

// PropertiesByCategory funkcija
export async function getPropertiesByCategory(
  categorySlug: string, 
  page = 1, 
  limit = 12, 
  sortBy?: string, 
  filters?: any
) {
  const skip = (page - 1) * limit
  
  const where: any = { 
    isActive: true,
    // Noņemam visibility filtru - rādām gan publiskos, gan privātos
  }

  // Kategorijas filtrs
  if (categorySlug && categorySlug !== 'all') {
    where.category = { slug: categorySlug }
  }

  // Pievienojam filtrus, ja tie ir
  if (filters) {
    if (filters.minPrice) {
      where.price = { ...where.price, gte: parseInt(filters.minPrice) * 100 }
    }
    if (filters.maxPrice) {
      where.price = { ...where.price, lte: parseInt(filters.maxPrice) * 100 }
    }
    if (filters.rooms) {
      const rooms = filters.rooms.split(',').filter(Boolean)
      if (rooms.length > 0) {
        const roomFilters = rooms.map((room: string) => {
          if (room === '+') {
            return { rooms: { gte: 6 } }
          }
          return { rooms: parseInt(room) }
        })
        where.OR = roomFilters
      }
    }
    if (filters.city) {
      where.city = filters.city
    }
    if (filters.district) {
      where.district = filters.district
    }
    if (filters.propertyProject) {
      where.propertyProject = filters.propertyProject
    }
    if (filters.minArea) {
      where.area = { ...where.area, gte: parseFloat(filters.minArea) }
    }
    if (filters.maxArea) {
      where.area = { ...where.area, lte: parseFloat(filters.maxArea) }
    }
  }

  // Sortēšana
  let orderBy: any = { createdAt: 'desc' }
  if (sortBy) {
    switch (sortBy) {
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
      case 'date_desc':
        orderBy = { createdAt: 'desc' }
        break
    }
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
    orderBy,
    skip,
    take: limit
  })

  const total = await prisma.property.count({ where })
  return { properties, total, pages: Math.ceil(total / limit) }
}

// Esošās funkcijas
export async function getAllProperties(page = 1, limit = 12) {
  const skip = (page - 1) * limit

  const properties = await prisma.property.findMany({
    where: { 
      isActive: true,
      visibility: 'public'
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

export async function getCitiesAndDistrictsForCategory(categorySlug: string) {
  const properties = await prisma.property.findMany({
    where: {
      category: { slug: categorySlug },
      isActive: true,
      // Iekļaujam gan publiskos, gan privātos īpašumus
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

export async function getPropertyProjectsForCategory(categorySlug: string) {
  const properties = await prisma.property.findMany({
    where: {
      category: { slug: categorySlug },
      isActive: true,
      // Iekļaujam gan publiskos, gan privātos īpašumus
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

export async function getPropertiesWithFilters(filters: any, page = 1, limit = 12) {
  const skip = (page - 1) * limit
  
  const where: any = { 
    isActive: true,
    visibility: 'public'
  }

  if (filters.categorySlug && filters.categorySlug !== 'all') {
    where.category = { slug: filters.categorySlug }
  }

  if (filters.minPrice || filters.maxPrice) {
    where.price = {}
    if (filters.minPrice) where.price.gte = parseInt(filters.minPrice) * 100
    if (filters.maxPrice) where.price.lte = parseInt(filters.maxPrice) * 100
  }

  if (filters.rooms && filters.rooms.length > 0) {
    const roomFilters = filters.rooms.map((room: string) => {
      if (room === '+') {
        return { rooms: { gte: 6 } }
      }
      return { rooms: parseInt(room) }
    })
    where.OR = roomFilters
  }

  if (filters.city) {
    where.city = filters.city
  }

  if (filters.district) {
    where.district = filters.district
  }

  if (filters.propertyProject) {
    where.propertyProject = filters.propertyProject
  }

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
      visibility: true,
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

  const total = await prisma.property.count({ where })
  return { properties, total, pages: Math.ceil(total / limit) }
}

export async function getPrivateProperties(userEmail: string, page = 1, limit = 12) {
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
    visibility: 'private' as const
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

export async function getPrivatePropertiesPreview(categorySlug?: string, page = 1, limit = 12) {
  const skip = (page - 1) * limit
  
  const where: any = { 
    isActive: true,
    visibility: 'private' as const
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

export async function getFeaturedProperties(limit = 6) {
  return await prisma.property.findMany({
    where: {
      isActive: true,
      isFeatured: true,
      visibility: 'public'
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

  if (property.visibility === 'private') {
    if (!userEmail) {
      return null
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
      return null
    }
  }

  return property
}

export async function searchProperties(query: string, page = 1, limit = 12) {
  const skip = (page - 1) * limit
  
  const where = {
    isActive: true,
    visibility: 'public' as const,
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