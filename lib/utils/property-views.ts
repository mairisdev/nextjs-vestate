import { prisma } from "../db"
import { headers } from "next/headers"

export async function incrementUniqueView(propertyId: string) {
  try {
    const headersList = await headers()
    const forwardedFor = headersList.get('x-forwarded-for')
    const realIp = headersList.get('x-real-ip')
    const ipAddress = forwardedFor?.split(',')[0] || realIp || 'unknown'
    const userAgent = headersList.get('user-agent') || null

    // Pārbaudi vai šis IP jau ir skatījies šo īpašumu
    const existingView = await prisma.propertyView.findUnique({
      where: {
        unique_property_view: {
          propertyId,
          ipAddress
        }
      }
    })

    // Ja nav skatījies, pievienojam jaunu skatījumu
    if (!existingView) {
      await prisma.propertyView.create({
        data: {
          propertyId,
          ipAddress,
          userAgent
        }
      })
    }

    // Atgriežam kopējo skatījumu skaitu šim īpašumam
    return await prisma.propertyView.count({
      where: { propertyId }
    })
  } catch (error) {
    console.error("Error tracking property view:", error)
    return 0
  }
}

export async function getUniqueViewsCount(propertyId: string): Promise<number> {
  try {
    return await prisma.propertyView.count({
      where: { propertyId }
    })
  } catch (error) {
    console.error("Error getting views count:", error)
    return 0
  }
}

// Papildu funkcijas
export async function getUniqueViewersCount(propertyId: string): Promise<number> {
  try {
    const uniqueViews = await prisma.propertyView.groupBy({
      by: ['ipAddress'],
      where: { propertyId },
      _count: {
        ipAddress: true
      }
    })
    return uniqueViews.length
  } catch (error) {
    console.error("Error getting unique viewers count:", error)
    return 0
  }
}

export async function getPropertyViews(propertyId: string) {
  try {
    return await prisma.propertyView.findMany({
      where: { propertyId },
      select: {
        id: true,
        ipAddress: true,
        userAgent: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
  } catch (error) {
    console.error("Error getting property views:", error)
    return []
  }
}
