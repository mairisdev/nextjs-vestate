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
  }
}

export enum PropertyStatus {
  AVAILABLE = "AVAILABLE",
  RESERVED = "RESERVED", 
  SOLD = "SOLD",
  RENTED = "RENTED",
  UNAVAILABLE = "UNAVAILABLE"
}
