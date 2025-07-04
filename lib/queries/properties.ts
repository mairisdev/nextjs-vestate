import { prisma } from "../db"

export async function getPropertyCategories() {
  return await prisma.propertyCategory.findMany({
    where: { isVisible: true },
    orderBy: { order: 'asc' },
    include: {
      _count: {
        select: { properties: { where: { isActive: true } } }
      }
    }
  })
}

export async function getPropertiesByCategory(categorySlug: string, page = 1, limit = 12, sort: string = "", filters: any = {}) {
  const skip = (page - 1) * limit

  let orderBy: any = { createdAt: 'desc' }
  switch (sort) {
    case 'date_desc':
      orderBy = { createdAt: 'desc' }
      break
    case 'price_asc':
      orderBy = { price: 'asc' }
      break
    case 'price_desc':
      orderBy = { price: 'desc' }
      break
    case 'area_desc':
      orderBy = { area: 'desc' }
      break
    default:
      orderBy = { createdAt: 'desc' }
  }

  // Build filter conditions
  const where: any = {
    category: { slug: categorySlug },
    isActive: true,
  }
  if (filters.minPrice) {
    where.price = { ...where.price, gte: Number(filters.minPrice) * 100 }
  }
  if (filters.maxPrice) {
    where.price = { ...where.price, lte: Number(filters.maxPrice) * 100 }
  }
  if (filters.rooms) {
    if (filters.rooms === '+') {
      where.rooms = { gte: 5 }
    } else {
      where.rooms = Number(filters.rooms)
    }
  }
  if (filters.minArea) {
    where.area = { ...where.area, gte: Number(filters.minArea) }
  }
  if (filters.maxArea) {
    where.area = { ...where.area, lte: Number(filters.maxArea) }
  }
  if (filters.city) {
    where.city = filters.city
  }
  if (filters.district) {
    where.district = filters.district
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

export async function getFeaturedProperties(limit = 6) {
  return await prisma.property.findMany({
    where: {
      isActive: true,
      isFeatured: true
    },
    include: {
      category: true
    },
    orderBy: { createdAt: 'desc' },
    take: limit
  })
}

export async function getAllProperties(page = 1, limit = 12) {
  const skip = (page - 1) * limit

  const properties = await prisma.property.findMany({
    where: { isActive: true },
    include: {
      category: true
    },
    orderBy: { createdAt: 'desc' },
    skip,
    take: limit
  })

  const total = await prisma.property.count({
    where: { isActive: true }
  })

  return { properties, total, pages: Math.ceil(total / limit) }
}

export async function getCitiesAndDistrictsForDzivokli() {
  const properties = await prisma.property.findMany({
    where: {
      category: { slug: 'dzivokli' },
      isActive: true,
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
