// app/admin/properties/create/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Textarea } from "../../../components/ui/textarea"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import AlertMessage from "../../../components/ui/alert-message"

interface Category {
  id: string
  name: string
}

// PĀRBAUDI VAI ŠĪ RINDA IR FAILA BEIGĀS!
export default function CreateProperty() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
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

    // Pievienojam attēlu stāvokļus
    const [mainImage, setMainImage] = useState<File | null>(null)
    const [additionalImages, setAdditionalImages] = useState<File[]>([])
    const [mainImagePreview, setMainImagePreview] = useState<string | null>(null)
    const [additionalImagePreviews, setAdditionalImagePreviews] = useState<string[]>([])

    // Attēlu apstrādes funkcijas
    const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
        setMainImage(file)
        const previewUrl = URL.createObjectURL(file)
        setMainImagePreview(previewUrl)
    }
    }

    const handleAdditionalImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length + additionalImages.length > 5) {
        setErrorMessage("Maksimums 5 papildu attēli")
        return
    }
    
    setAdditionalImages(prev => [...prev, ...files])
    
    // Izveidojam preview
    const newPreviews = files.map(file => URL.createObjectURL(file))
    setAdditionalImagePreviews(prev => [...prev, ...newPreviews])
    }

    const removeAdditionalImage = (index: number) => {
    setAdditionalImages(prev => prev.filter((_, i) => i !== index))
    setAdditionalImagePreviews(prev => prev.filter((_, i) => i !== index))
    }

    useEffect(() => {
        loadCategories()
    }, [])

    const loadCategories = async () => {
        try {
        const res = await fetch("/api/admin/property-categories")
        const data = await res.json()
        setCategories(data.filter((cat: any) => cat.isVisible))
        } catch (error) {
        setErrorMessage("Neizdevās ielādēt kategorijas")
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage(null)

    // Validācija
    if (!formData.title.trim()) {
        setErrorMessage("Nosaukums ir obligāts")
        setLoading(false)
        return
    }

    if (!formData.categoryId) {
        setErrorMessage("Kategorija ir obligāta")
        setLoading(false)
        return
    }

    if (!formData.address.trim()) {
        setErrorMessage("Adrese ir obligāta")
        setLoading(false)
        return
    }

    if (!formData.city.trim()) {
        setErrorMessage("Pilsēta ir obligāta")
        setLoading(false)
        return
    }

    try {
        // Izmantojam FormData attēlu augšupielādei
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

        // Pievienojam attēlus
        if (mainImage) {
        formDataToSend.append("mainImage", mainImage)
        }
        
        additionalImages.forEach((image, index) => {
        formDataToSend.append(`additionalImage${index}`, image)
        })

        const res = await fetch("/api/admin/properties", {
        method: "POST",
        body: formDataToSend // Nevis JSON!
        })

        const responseData = await res.json()

        if (res.ok) {
        setSuccessMessage("Īpašums izveidots veiksmīgi!")
        setTimeout(() => {
            router.push("/admin/properties")
        }, 1500)
        } else {
        setErrorMessage(responseData.error || "Kļūda izveidojot īpašumu")
        }
    } catch (error) {
        console.error("Submit error:", error)
        setErrorMessage("Kļūda izveidojot īpašumu")
    } finally {
        setLoading(false)
    }
    }

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({
        ...prev,
        [field]: value
        }))
    }

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-10">
      <div className="flex items-center space-x-4">
        <Link href="/admin/properties">
          <Button variant="outline" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <h2 className="text-2xl font-bold">Pievienot jaunu īpašumu</h2>
      </div>

      {successMessage && <AlertMessage type="success" message={successMessage} />}
      {errorMessage && <AlertMessage type="error" message={errorMessage} />}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Pamata informācija */}
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

            <div className="bg-white p-6 rounded-lg border">
                <h3 className="text-lg font-semibold mb-4">Attēli</h3>
            
                <div className="mb-6">
                    <Label>Galvenais attēls</Label>
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
                                alt="Galvenais attēls"
                                className="w-32 h-32 object-cover rounded-lg border"
                            />
                            <button
                                type="button"
                                onClick={() => {
                                setMainImage(null)
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

                <div>
                    <Label>Papildu attēli (maksimums 5)</Label>
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
                                    alt={`Papildu attēls ${index + 1}`}
                                    className="w-20 h-20 object-cover rounded-lg border"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeAdditionalImage(index)}
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
          <Button type="submit" disabled={loading}>
            {loading ? "Saglabā..." : "Izveidot īpašumu"}
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
