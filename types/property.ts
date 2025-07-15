import { PropertyStatus, PropertyVisibility } from "@prisma/client"

export interface Property {
  id: string
  title: string
  description: string
  price: number
  currency: string
  address: string
  city: string
  district: string | null
  rooms: number | null
  area: number | null
  floor: number | null
  totalFloors: number | null
  categoryId: string
  status: PropertyStatus // Izmantojam Prisma enum
  visibility: PropertyVisibility // Izmantojam Prisma enum
  isActive: boolean
  isFeatured: boolean
  mainImage: string | null
  images: string[]
  propertyProject: string | null
  createdAt: Date
  updatedAt: Date
  category: {
    id: string
    name: string
    slug: string
    description: string | null
    image: string | null
    isVisible: boolean
    order: number
    createdAt: Date
    updatedAt: Date
  }
  agent?: {
    id: string
    firstName: string | null
    lastName: string | null
    email: string | null
    phone: string | null
  } | null
}

// Eksportējam Prisma enum tipus arī šeit, ja vajag
export { PropertyStatus, PropertyVisibility }

export interface AccessRequest {
  id: string
  email: string
  phone: string
  code: string
  verified: boolean
  validUntil: Date | null
  createdAt: Date
  propertyId?: string | null
  property?: {
    id: string
    title: string
  } | null
}