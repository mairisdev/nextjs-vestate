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
  status: PropertyStatus
  visibility: PropertyVisibility // Pievienojam
  isActive: boolean
  isFeatured: boolean
  mainImage: string | null
  images: string[]
  views: number
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

export enum PropertyStatus {
  AVAILABLE = "AVAILABLE",
  RESERVED = "RESERVED", 
  SOLD = "SOLD",
  RENTED = "RENTED",
  UNAVAILABLE = "UNAVAILABLE"
}

export enum PropertyVisibility {
  PUBLIC = "public",
  PRIVATE = "private"
}

// Jauns tips AccessRequest
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
