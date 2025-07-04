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

export async function getPropertiesByCategory(categorySlug: string, page = 1, limit = 12) {
  const skip = (page - 1) * limit

  const properties = await prisma.property.findMany({
    where: {
      category: { slug: categorySlug },
      isActive: true
    },
    include: {
      category: true
    },
    orderBy: { createdAt: 'desc' },
    skip,
    take: limit
  })

  const total = await prisma.property.count({
    where: {
      category: { slug: categorySlug },
      isActive: true
    }
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
