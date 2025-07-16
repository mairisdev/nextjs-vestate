"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "../../../../components/ui/button"
import { Input } from "../../../../components/ui/input"
import { Label } from "../../../../components/ui/label"
import { Textarea } from "../../../../components/ui/textarea"
import { ArrowLeft, Trash } from "lucide-react"
import Link from "next/link"
import AlertMessage from "../../../../components/ui/alert-message"

interface Category {
  isVisible: any
  id: string
  name: string
}

interface Property {
  hasElevator: boolean
  amenities: any
  series: string
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
  status: string
  isActive: boolean
  isFeatured: boolean
  mainImage: string | null
  images: string[]
  propertyProject?: string
  videoUrl: string
  visibility?: string
}

interface EditPropertyProps {
  params: Promise<{ id: string }>
}

export default function EditProperty({ params }: EditPropertyProps) {
  const router = useRouter()
  const [propertyId, setPropertyId] = useState<string>("")
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    currency: "EUR",
    address: "",
    city: "",
    district: "",
    videoUrl: "",
    rooms: "",
    area: "",
    floor: "",
    totalFloors: "",
    series: "", 
    hasElevator: false,
    amenities: "",
    categoryId: "",
    status: "AVAILABLE",
    isActive: true,
    isFeatured: false,
    propertyProject: "",
    visibility: "public"
  })

  const [currentMainImage, setCurrentMainImage] = useState<string | null>(null)
  const [currentAdditionalImages, setCurrentAdditionalImages] = useState<string[]>([])
  const [newMainImage, setNewMainImage] = useState<File | null>(null)
  const [newAdditionalImages, setNewAdditionalImages] = useState<File[]>([])
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null)
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState<string[]>([])
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([])

  // LABOTS useEffect - tikai viens!
  useEffect(() => {
    const loadData = async () => {
      try {
        const resolvedParams = await params
        const id = resolvedParams.id
        setPropertyId(id)
        
        console.log('Loading property with ID:', id)
        
        // Ielādējam īpašumu un kategorijas paralēli
        await Promise.all([
          loadProperty(id),
          loadCategories()
        ])
        
        setLoading(false)
      } catch (error) {
        console.error('Error loading data:', error)
        setErrorMessage("Neizdevās ielādēt datus")
        setLoading(false)
      }
    }
    
    loadData()
  }, [params])

  const loadProperty = async (id: string) => {
    try {
      console.log('Fetching property:', `/api/admin/properties/${id}`)
      const res = await fetch(`/api/admin/properties/${id}`)
      
      if (!res.ok) {
        const errorText = await res.text()
        console.error('Failed to load property:', res.status, errorText)
        setErrorMessage("Īpašums nav atrasts")
        return
      }
      
      const property: Property = await res.json()
      console.log('Property loaded:', property)
      
      setFormData({
        title: property.title,
        description: property.description,
        price: (property.price / 100).toString(),
        currency: property.currency,
        address: property.address,
        city: property.city,
        district: property.district || "",
        videoUrl: property.videoUrl || "",
        rooms: property.rooms?.toString() || "",
        area: property.area?.toString() || "",
        floor: property.floor?.toString() || "",
        totalFloors: property.totalFloors?.toString() || "",
        categoryId: property.categoryId,
        status: property.status,
        isActive: property.isActive,
        isFeatured: property.isFeatured,
        propertyProject: property.propertyProject || "",
        series: property.series || "",
        hasElevator: property.hasElevator || false,
        amenities: Array.isArray(property.amenities) ? property.amenities.join(", ") : "",
        visibility: property.visibility || "public"
      })

      setCurrentMainImage(property.mainImage)
      setCurrentAdditionalImages(property.images)
      
      console.log('Form data set:', {
        title: property.title,
        mainImage: property.mainImage,
        images: property.images
      })
    } catch (error) {
      console.error('Error loading property:', error)
      setErrorMessage("Neizdevās ielādēt īpašumu")
    }
  }

  const loadCategories = async () => {
    try {
      const res = await fetch("/api/admin/property-categories")
      
      if (!res.ok) {
        throw new Error("Failed to load categories")
      }
      
      const data = await res.json()
      console.log('Categories loaded:', data.length)
      setCategories(data)
      
    } catch (error) {
      console.error("Error loading categories:", error)
      setErrorMessage("Neizdevās ielādēt kategorijas")
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setNewMainImage(file)
      const previewUrl = URL.createObjectURL(file)
      setMainImagePreview(previewUrl)
    }
  }

  const handleAdditionalImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length + newAdditionalImages.length + currentAdditionalImages.length > 10) {
      setErrorMessage("Maksimums 10 papildu attēli")
      return
    }
    
    setNewAdditionalImages(prev => [...prev, ...files])
    
    const newPreviews = files.map(file => URL.createObjectURL(file))
    setAdditionalImagePreviews(prev => [...prev, ...newPreviews])
  }

  const removeCurrentMainImage = () => {
    if (currentMainImage) {
      setImagesToDelete(prev => [...prev, currentMainImage])
    }
    setCurrentMainImage(null)
  }

  const removeCurrentAdditionalImage = (imagePath: string) => {
    setImagesToDelete(prev => [...prev, imagePath])
    setCurrentAdditionalImages(prev => prev.filter(img => img !== imagePath))
  }

  const removeNewAdditionalImage = (index: number) => {
    setNewAdditionalImages(prev => prev.filter((_, i) => i !== index))
    setAdditionalImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setErrorMessage(null)

    if (!formData.title.trim()) {
      setErrorMessage("Nosaukums ir obligāts")
      setSaving(false)
      return
    }

    if (!formData.categoryId) {
      setErrorMessage("Kategorija ir obligāta")
      setSaving(false)
      return
    }

    try {
      const formDataToSend = new FormData()
      const amenitiesList = formData.amenities.split(",").map(a => a.trim()).filter(Boolean)
      amenitiesList.forEach(a => formDataToSend.append("amenities", a))

      formDataToSend.append("title", formData.title.trim())
      formDataToSend.append("description", formData.description.trim())
      formDataToSend.append("price", formData.price)
      formDataToSend.append("currency", formData.currency)
      formDataToSend.append("address", formData.address.trim())
      formDataToSend.append("city", formData.city.trim())
      formDataToSend.append("district", formData.district.trim())
      formDataToSend.append("rooms", formData.rooms)
      formDataToSend.append("area", formData.area)
      formDataToSend.append("floor", formData.floor)
      formDataToSend.append("totalFloors", formData.totalFloors)
      formDataToSend.append("series", formData.series)
      formDataToSend.append("hasElevator", formData.hasElevator.toString())
      formDataToSend.append("categoryId", formData.categoryId)
      formDataToSend.append("status", formData.status)
      formDataToSend.append("isActive", formData.isActive.toString())
      formDataToSend.append("isFeatured", formData.isFeatured.toString())
      formDataToSend.append("propertyProject", formData.propertyProject)
      formDataToSend.append("videoUrl", formData.videoUrl || "")
      formDataToSend.append("visibility", formData.visibility)

      if (newMainImage) {
        formDataToSend.append("mainImage", newMainImage)
      }
      
      // Pievienojam jaunos papildu attēlus
      newAdditionalImages.forEach((image, index) => {
        formDataToSend.append(`additionalImage${index}`, image)
      })

      formDataToSend.append("imagesToDelete", JSON.stringify(imagesToDelete))
      formDataToSend.append("currentMainImage", currentMainImage || "")
      formDataToSend.append("currentAdditionalImages", JSON.stringify(currentAdditionalImages))

      console.log("Sending update request for property:", propertyId)

      const res = await fetch(`/api/admin/properties/${propertyId}`, {
        method: "PUT",
        body: formDataToSend
      })

      const responseData = await res.json()

      if (res.ok) {
        setSuccessMessage("Īpašums atjaunināts veiksmīgi!")
        setTimeout(() => {
          router.push("/admin/properties")
        }, 1500)
      } else {
        console.error("Server responded with error:", responseData)
        setErrorMessage(responseData.error || "Kļūda atjauninot īpašumu")
      }
    } catch (error) {
      console.error("Submit error:", error)
      setErrorMessage("Kļūda atjauninot īpašumu")
    } finally {
      setSaving(false)
    }
  }

  // Helper funkcija attēlu URL parādīšanai
  const getImageUrl = (imagePath: string | null) => {
    if (!imagePath) return null
    
    // Ja jau ir pilns URL (Cloudinary), atgriežam tā kā ir
    if (imagePath.startsWith('http')) {
      return imagePath
    }
    
    // Ja ir relatīvs ceļš, pievienojam uploads prefix
    if (imagePath.startsWith('/uploads/')) {
      return imagePath
    }
    
    // Cits gadījums - pievienojam uploads/properties/
    return `/uploads/properties/${imagePath}`
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-10">
      <div className="flex items-center space-x-4">
        <Link href="/admin/properties">
          <Button variant="outline" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <h2 className="text-2xl font-bold">Rediģēt īpašumu</h2>
      </div>

      {successMessage && <AlertMessage type="success" message={successMessage} />}
      {errorMessage && <AlertMessage type="error" message={errorMessage} />}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Pamata informācija</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label>Nosaukums *</Label>
              <Input
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Dzīvoklis Rīgas centrā"
                required
              />
            </div>

            <div>
              <Label>Kategorija *</Label>
              {categories.length === 0 ? (
                <div className="w-full px-3 py-2 border border-red-300 rounded-md bg-red-50 text-red-700">
                  Kategorijas nav atrastas. Lūdzu, vispirms izveidojiet kategorijas.
                </div>
              ) : (
                <select
                  value={formData.categoryId}
                  onChange={(e) => handleInputChange('categoryId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Izvēlies kategoriju</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name} {!category.isVisible && " (paslēpts)"}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <Label>Status</Label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="AVAILABLE">Pieejams</option>
                <option value="RESERVED">Rezervēts</option>
                <option value="SOLD">Pārdots</option>
                <option value="RENTED">Izīrēts</option>
                <option value="UNAVAILABLE">Nav pieejams</option>
              </select>
            </div>

            <div>
              <Label>Redzamība</Label>
              <select
                value={formData.visibility}
                onChange={(e) => handleInputChange('visibility', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="public">Publisks</option>
                <option value="private">Privāts</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <Label>Apraksts</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Detalizēts īpašuma apraksts..."
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="propertyProject">Projekts</Label>
              <Input
                id="propertyProject"
                type="text"
                value={formData.propertyProject}
                onChange={e => handleInputChange("propertyProject", e.target.value)}
                placeholder="Projekta nosaukums (ja ir)"
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Cena</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Cena *</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                placeholder="25900"
                required
              />
            </div>

            <div>
              <Label>Valūta</Label>
              <select
                value={formData.currency}
                onChange={(e) => handleInputChange('currency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Atrašanās vieta</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Adrese *</Label>
              <Input
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Brīvības iela 123"
                required
              />
            </div>

            <div>
              <Label>Pilsēta *</Label>
              <Input
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                placeholder="Rīga"
                required
              />
            </div>

            <div className="md:col-span-2">
              <Label>Rajons</Label>
              <Input
                value={formData.district}
                onChange={(e) => handleInputChange('district', e.target.value)}
                placeholder="Centrs"
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Tehniskie parametri</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label>Istabu skaits</Label>
              <Input
                type="number"
                value={formData.rooms}
                onChange={(e) => handleInputChange('rooms', e.target.value)}
                placeholder="3"
              />
            </div>

            <div>
              <Label>Platība (m²)</Label>
              <Input
                type="number"
                step="0.1"
                value={formData.area}
                onChange={(e) => handleInputChange('area', e.target.value)}
                placeholder="65.5"
              />
            </div>

            <div>
              <Label>Stāvs</Label>
              <Input
                type="number"
                value={formData.floor}
                onChange={(e) => handleInputChange('floor', e.target.value)}
                placeholder="3"
              />
            </div>

            <div>
              <Label>Kopējais stāvu skaits</Label>
              <Input
                type="number"
                value={formData.totalFloors}
                onChange={(e) => handleInputChange('totalFloors', e.target.value)}
                placeholder="5"
              />
            </div>
            
            <div>
              <Label>Sērija</Label>
              <Input
                value={formData.series}
                onChange={(e) => handleInputChange("series", e.target.value)}
                placeholder="Specprojekts"
              />
            </div>

            <div className="flex items-center space-x-2 mt-2">
              <input
                type="checkbox"
                checked={formData.hasElevator}
                onChange={(e) => handleInputChange("hasElevator", e.target.checked)}
                id="hasElevator"
              />
              <Label htmlFor="hasElevator">Ir lifts</Label>
            </div>

            <div className="md:col-span-2 mt-2">
              <Label>Ērtības / ekstras (komats atdala)</Label>
              <Input
                value={formData.amenities}
                onChange={(e) => handleInputChange("amenities", e.target.value)}
                placeholder="Balkons, Autostāvvieta, Signalizācija"
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Attēli</h3>
          
          {currentMainImage && (
            <div className="mb-4">
              <Label>Pašreizējais galvenais attēls</Label>
              <div className="mt-2 flex items-center space-x-4">
                <img
                  src={getImageUrl(currentMainImage) || ''}
                  alt="Galvenais attēls"
                  className="w-32 h-32 object-cover rounded-lg border"
                />
                <button
                  type="button"
                  onClick={removeCurrentMainImage}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          <div className="mb-6">
            <Label>Mainīt galveno attēlu</Label>
            <div className="mt-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleMainImageChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {mainImagePreview && (
                <div className="mt-3">
                  <img
                    src={mainImagePreview}
                    alt="Jauns galvenais attēls"
                    className="w-32 h-32 object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setNewMainImage(null)
                      setMainImagePreview(null)
                    }}
                    className="mt-2 text-sm text-red-600 hover:text-red-800"
                  >
                    Noņemt
                  </button>
                </div>
              )}
            </div>
          </div>

          {currentAdditionalImages.length > 0 && (
            <div className="mb-4">
              <Label>Pašreizējie papildu attēli</Label>
              <div className="mt-2 grid grid-cols-3 md:grid-cols-5 gap-3">
                {currentAdditionalImages.map((imagePath, index) => (
                  <div key={index} className="relative">
                    <img
                      src={getImageUrl(imagePath) || ''}
                      alt={`Papildu attēls ${index + 1}`}
                      className="w-20 h-20 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => removeCurrentAdditionalImage(imagePath)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <Label>Pievienot papildu attēlus (max 10)</Label>
            <div className="mt-2">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleAdditionalImagesChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {additionalImagePreviews.length > 0 && (
                <div className="mt-3 grid grid-cols-3 md:grid-cols-5 gap-3">
                  {additionalImagePreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt={`Jauns papildu attēls ${index + 1}`}
                        className="w-20 h-20 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => removeNewAdditionalImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2 mt-4">
            <Label htmlFor="videoUrl">YouTube video saite</Label>
            <Input
              id="videoUrl"
              type="url"
              value={formData.videoUrl}
              onChange={(e) => handleInputChange('videoUrl', e.target.value)}
              placeholder="https://www.youtube.com/embed/..."
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Papildu opcijas</h3>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => handleInputChange('isActive', e.target.checked)}
                id="isActive"
              />
              <Label htmlFor="isActive">Aktīvs (redzams publiskajā lapā)</Label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => handleInputChange('isFeatured', e.target.checked)}
                id="isFeatured"
              />
              <Label htmlFor="isFeatured">Izcelts (parādīt izcelto īpašumu sadaļā)</Label>
            </div>
          </div>
        </div>

        <div className="flex space-x-4">
          <Button type="submit" disabled={saving}>
            {saving ? "Saglabā..." : "Atjaunināt īpašumu"}
          </Button>
          <Link href="/admin/properties">
            <Button type="button" variant="outline">
              Atcelt
            </Button>
          </Link>
        </div>
      </form>
    </div>
  )
}