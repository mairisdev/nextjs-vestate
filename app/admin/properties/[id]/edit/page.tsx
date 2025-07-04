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
  id: string
  name: string
}

interface Property {
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
    rooms: "",
    area: "",
    floor: "",
    totalFloors: "",
    categoryId: "",
    status: "AVAILABLE",
    isActive: true,
    isFeatured: false
  })

  // Attēlu stāvokļi
  const [currentMainImage, setCurrentMainImage] = useState<string | null>(null)
  const [currentAdditionalImages, setCurrentAdditionalImages] = useState<string[]>([])
  const [newMainImage, setNewMainImage] = useState<File | null>(null)
  const [newAdditionalImages, setNewAdditionalImages] = useState<File[]>([])
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null)
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState<string[]>([])
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([])

  useEffect(() => {
    const loadData = async () => {
      const resolvedParams = await params
      setPropertyId(resolvedParams.id)
      
      await Promise.all([
        loadProperty(resolvedParams.id),
        loadCategories()
      ])
      
      setLoading(false)
    }
    
    loadData()
  }, [params])

  const loadProperty = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/properties/${id}`)
      if (!res.ok) {
        setErrorMessage("Īpašums nav atrasts")
        return
      }
      
      const property: Property = await res.json()
      
      setFormData({
        title: property.title,
        description: property.description,
        price: (property.price / 100).toString(),
        currency: property.currency,
        address: property.address,
        city: property.city,
        district: property.district || "",
        rooms: property.rooms?.toString() || "",
        area: property.area?.toString() || "",
        floor: property.floor?.toString() || "",
        totalFloors: property.totalFloors?.toString() || "",
        categoryId: property.categoryId,
        status: property.status,
        isActive: property.isActive,
        isFeatured: property.isFeatured
      })

      setCurrentMainImage(property.mainImage)
      setCurrentAdditionalImages(property.images)
    } catch (error) {
      setErrorMessage("Neizdevās ielādēt īpašumu")
    }
  }

  const loadCategories = async () => {
    try {
      const res = await fetch("/api/admin/property-categories")
      const data = await res.json()
      setCategories(data.filter((cat: any) => cat.isVisible))
    } catch (error) {
      setErrorMessage("Neizdevās ielādēt kategorijas")
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Attēlu apstrādes funkcijas
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
    if (files.length + newAdditionalImages.length + currentAdditionalImages.length > 5) {
      setErrorMessage("Maksimums 5 papildu attēli")
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

    // Validācija
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
      
      // Pievienojam visus teksta laukus
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
      formDataToSend.append("categoryId", formData.categoryId)
      formDataToSend.append("status", formData.status)
      formDataToSend.append("isActive", formData.isActive.toString())
      formDataToSend.append("isFeatured", formData.isFeatured.toString())

      // Pievienojam jauno galveno attēlu
      if (newMainImage) {
        formDataToSend.append("mainImage", newMainImage)
      }
      
      // Pievienojam jaunos papildu attēlus
      newAdditionalImages.forEach((image, index) => {
        formDataToSend.append(`additionalImage${index}`, image)
      })

      // Pievienojam dzēšamos attēlus
      formDataToSend.append("imagesToDelete", JSON.stringify(imagesToDelete))
      
      // Pievienojam esošos attēlus, kas paliks
      formDataToSend.append("currentMainImage", currentMainImage || "")
      formDataToSend.append("currentAdditionalImages", JSON.stringify(currentAdditionalImages))

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
        setErrorMessage(responseData.error || "Kļūda atjauninot īpašumu")
      }
    } catch (error) {
      console.error("Submit error:", error)
      setErrorMessage("Kļūda atjauninot īpašumu")
    } finally {
      setSaving(false)
    }
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
        {/* Pamata informācija - tāds pats kā create */}
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
              <select
                value={formData.categoryId}
                onChange={(e) => handleInputChange('categoryId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Izvēlies kategoriju</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
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

            <div className="md:col-span-2">
              <Label>Apraksts</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Detalizēts īpašuma apraksts..."
                rows={4}
              />
            </div>
          </div>
        </div>

        {/* Cena */}
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

        {/* Atrašanās vieta */}
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

        {/* Tehniskie parametri */}
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
          </div>
        </div>

        {/* Attēli */}
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Attēli</h3>
          
          {/* Esošais galvenais attēls */}
          {currentMainImage && (
            <div className="mb-4">
              <Label>Pašreizējais galvenais attēls</Label>
              <div className="mt-2 flex items-center space-x-4">
                <img
                  src={`/uploads/properties/${currentMainImage}`}
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

          {/* Jauns galvenais attēls */}
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

          {/* Esošie papildu attēli */}
          {currentAdditionalImages.length > 0 && (
            <div className="mb-4">
              <Label>Pašreizējie papildu attēli</Label>
              <div className="mt-2 grid grid-cols-3 md:grid-cols-5 gap-3">
                {currentAdditionalImages.map((imagePath, index) => (
                  <div key={index} className="relative">
                    <img
                      src={`/uploads/properties/${imagePath}`}
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

          {/* Jauni papildu attēli */}
          <div>
            <Label>Pievienot papildu attēlus</Label>
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
        </div>

        {/* Papildu opcijas */}
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

        {/* Saglabāšanas pogas */}
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
