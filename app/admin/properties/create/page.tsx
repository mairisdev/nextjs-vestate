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
  isVisible: boolean
  id: string
  name: string
  slug: string
}

export default function CreateProperty() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [, setCategoriesLoading] = useState(true)
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [agent, setAgent] = useState<{ firstName: string; lastName: string } | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)

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
    visibility: 'public'
  })

  const [mainImage, setMainImage] = useState<File | null>(null)
  const [additionalImages, setAdditionalImages] = useState<{ file: File; preview: string }[]>([])
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null)

  const validateFileSize = (file: File, maxSizeMB: number = 10): boolean => {
    const maxSizeBytes = maxSizeMB * 1024 * 1024
    if (file.size > maxSizeBytes) {
      setErrorMessage(`Fails "${file.name}" pārāk liels. Maksimums ${maxSizeMB}MB.`)
      return false
    }
    return true
  }

  const getTotalUploadSize = (): number => {
    let totalSize = 0
    if (mainImage) totalSize += mainImage.size
    additionalImages.forEach(img => totalSize += img.file.size)
    return totalSize
  }

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!validateFileSize(file, 10)) {
        return
      }

      setMainImage(file)
      const previewUrl = URL.createObjectURL(file)
      setMainImagePreview(previewUrl)
    }
  }

const handleAdditionalImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = e.target.files ? [...e.target.files] : []

  for (const file of files) {
    if (!validateFileSize(file, 10)) return
  }

  if (files.length + additionalImages.length > 30) {
    setErrorMessage("Maksimums 30 papildu attēli")
    return
  }

  if (files.length === 0) {
    setErrorMessage("Nav izvēlēti papildu attēli")
    return
  }

  const currentTotalSize = getTotalUploadSize()
  const newFilesSize = files.reduce((sum, file) => sum + file.size, 0)
  const totalSizeMB = (currentTotalSize + newFilesSize) / 1024 / 1024

  if (totalSizeMB > 50) {
    setErrorMessage(`Kopējais failu izmērs pārāk liels: ${totalSizeMB.toFixed(1)}MB. Maksimums 50MB.`)
    return
  }

  const newEntries = files.map(file => ({
    file,
    preview: URL.createObjectURL(file),
  }))

  setAdditionalImages(prev => [...prev, ...newEntries])
}

const removeAdditionalImage = (index: number) => {
  const removed = additionalImages[index]
  if (removed?.preview) URL.revokeObjectURL(removed.preview)
  setAdditionalImages(prev => prev.filter((_, i) => i !== index))
}

const moveImage = (from: number, to: number) => {
  setAdditionalImages(prev => {
    const updated = [...prev]
    const [moved] = updated.splice(from, 1)
    updated.splice(to, 0, moved)
    return updated
  })
}

  useEffect(() => {
    loadCategories()
    loadAgent()
  }, [])

  const loadAgent = async () => {
    try {
      const res = await fetch("/api/admin/agent/me")
      
      if (!res.ok) {
        console.warn('⚠️ Agent API returned non-OK status:', res.status)
        return
      }
      
      const data = await res.json()
      setAgent({ firstName: data.firstName, lastName: data.lastName })
    } catch (error) {
      console.error("❌ Failed to load agent:", error)
    }
  }

  const loadCategories = async () => {
    try {
      setCategoriesLoading(true)
      
      const res = await fetch("/api/admin/property-categories")
            
      if (!res.ok) {
        throw new Error(`Categories API failed: ${res.status} ${res.statusText}`)
      }
      
      const data = await res.json()
            
      if (!Array.isArray(data)) {
        throw new Error(`Categories API returned invalid data type: ${typeof data}`)
      }
      
      setCategories(data)
      
    } catch (error) {
      console.error("❌ Error loading categories:", error)
      setErrorMessage(`Neizdevās ielādēt kategorijas: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setCategoriesLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setLoading(true)
    setErrorMessage(null)
    setUploadProgress(0)
    
    if (!formData.title.trim()) {
      setErrorMessage("Nosaukums ir obligāts")
      setLoading(false)
      return
    }

    if (!formData.categoryId) {
      setErrorMessage(`Kategorija ir obligāta. Pieejamas ${categories.length} kategorijas.`)
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
    if (!formData.rooms || isNaN(Number(formData.rooms)) || Number(formData.rooms) <= 0) {
      setErrorMessage("Istabu skaits ir obligāts un tam jābūt lielākam par 0")
      setLoading(false)
      return
    }
    if (!formData.area || isNaN(Number(formData.area)) || Number(formData.area) <= 0) {
      setErrorMessage("Platība ir obligāta un tai jābūt lielākai par 0")
      setLoading(false)
      return
    }
    if (!formData.floor || isNaN(Number(formData.floor)) || Number(formData.floor) < 0) {
      setErrorMessage("Stāvs ir obligāts un tam jābūt lielākam vai vienādam ar 0")
      setLoading(false)
      return
    }
    if (!formData.totalFloors || isNaN(Number(formData.totalFloors)) || Number(formData.totalFloors) <= 0) {
      setErrorMessage("Kopējais stāvu skaits ir obligāts un tam jābūt lielākam par 0")
      setLoading(false)
      return
    }
    if (!formData.series.trim()) {
      setErrorMessage("Sērija ir obligāta")
      setLoading(false)
      return
    }
    if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      setErrorMessage("Cena ir obligāta un tai jābūt lielākai par 0")
      setLoading(false)
      return
    }
    if (!mainImage) {
      setErrorMessage("Galvenais attēls ir obligāts")
      setLoading(false)
      return
    }

    const selectedCategory = categories.find(c => c.id === formData.categoryId)
    if (!selectedCategory) {
      setErrorMessage("Izvēlētā kategorija neeksistē")
      setLoading(false)
      return
    }

    // Final file size check
    const totalSizeMB = getTotalUploadSize() / 1024 / 1024
    if (totalSizeMB > 50) {
      setErrorMessage(`Kopējais failu izmērs pārāk liels: ${totalSizeMB.toFixed(1)}MB. Maksimums 50MB.`)
      setLoading(false)
      return
    }
    if (totalSizeMB === 0) {
      setErrorMessage("Nav pievienoti attēli")
      setLoading(false)
      return
    }
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return prev
        }
        return prev + 10
      })
    }, 500)

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
      formDataToSend.append("visibility", formData.visibility)
      formDataToSend.append("videoUrl", formData.videoUrl.trim())
      if (mainImage) {
        formDataToSend.append("mainImage", mainImage)
      }
      
    additionalImages.forEach((item, index) => {
      formDataToSend.append(`additionalImage${index}`, item.file)
    })
      
      const res = await fetch("/api/admin/properties", {
        method: "POST",
        body: formDataToSend
      })

      const responseData = await res.json()

      setUploadProgress(100)
      clearInterval(progressInterval)

      if (res.ok) {
        setSuccessMessage("Īpašums izveidots veiksmīgi!")
        setTimeout(() => {
          router.push("/admin/properties")
        }, 1500)
      } else {
        console.error('❌ API returned error:', responseData)
        setErrorMessage(responseData.error || `Kļūda izveidojot īpašumu (${res.status})`)
      }
    } catch (error) {
      console.error("💥 Submit error:", error)
      clearInterval(progressInterval)
      setUploadProgress(0)
      
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          setErrorMessage("Savienojuma kļūda. Pārbaudiet interneta savienojumu.")
        } else if (error.message.includes('413')) {
          setErrorMessage("Faili pārāk lieli serverim")
        } else {
          setErrorMessage(`Kļūda izveidojot īpašumu: ${error.message}`)
        }
      } else {
        setErrorMessage("Nezināma kļūda izveidojot īpašumu")
      }
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

      {/* Progress bar */}
      {loading && uploadProgress > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-blue-800">Augšupielādē...</span>
            <span className="text-sm text-blue-600">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Pamata informācija</h3>
          {agent && (
            <div className="md:col-span-2">
              <Label>Aģents</Label>
              <Input
                disabled
                value={`${agent.firstName} ${agent.lastName}`}
                className="bg-gray-100"
              />
            </div>
          )}

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
                  Nav kategoriju. Vispirms izveidojiet kategorijas admin panelī.
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
              <p className="text-sm text-gray-500 mt-1">
                Ielādētas {categories.length} kategorijas
              </p>
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
                    <Label>Papildu attēli (maksimums 30)</Label>
                    <div className="mt-2">
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleAdditionalImagesChange}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
{additionalImages.length > 0 && (
  <div className="mt-3 grid grid-cols-3 md:grid-cols-5 gap-3">
    {additionalImages.map((item, index) => (
      <div key={index} className="relative">
        <img
          src={item.preview}
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

        <div className="flex justify-center mt-1 space-x-1">
          {index > 0 && (
            <button
              type="button"
              className="text-xs bg-gray-100 px-2 py-1 rounded border hover:bg-gray-200"
              onClick={() => moveImage(index, index - 1)}
            >
              ↑
            </button>
          )}
          {index < additionalImages.length - 1 && (
            <button
              type="button"
              className="text-xs bg-gray-100 px-2 py-1 rounded border hover:bg-gray-200"
              onClick={() => moveImage(index, index + 1)}
            >
              ↓
            </button>
          )}
        </div>
      </div>
    ))}
  </div>
)}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="videoUrl">YouTube video saite</Label>
                      <Input
                        id="videoUrl"
                        type="url"
                        value={formData.videoUrl}
                        onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                        placeholder="https://www.youtube.com/embed/..."
                      />
                    </div>

                </div>
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
                onChange={(e) => handleInputChange('series', e.target.value)}
                placeholder="Specprojekts"
              />
            </div>

            <div className="flex items-center space-x-2 mt-2">
              <input
                type="checkbox"
                checked={formData.hasElevator}
                onChange={(e) => handleInputChange('hasElevator', e.target.checked)}
                id="hasElevator"
              />
              <Label htmlFor="hasElevator">Ir lifts</Label>
            </div>

            <div className="md:col-span-2 mt-2">
              <Label>Ērtības / ekstras (komats atdala)</Label>
              <Input
                value={formData.amenities}
                onChange={(e) => handleInputChange('amenities', e.target.value)}
                placeholder="Balkons, Autostāvvieta, Signalizācija"
              />
            </div>

          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Papildu opcijas</h3>
          
          <div className="space-y-3">
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Redzamības iestatījumi</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div>
                <Label>Sludinājuma veids *</Label>
                <select
                  value={formData.visibility}
                  onChange={(e) => handleInputChange('visibility', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="public">Publisks</option>
                  <option value="private">Privāts</option>
                </select>
                <p className="text-sm text-gray-500 mt-1">
                  Privātie sludinājumi būs redzami tikai ar piekļuves kodu
                </p>
              </div>

              <div>
                <Label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => handleInputChange('isActive', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Rādīt sludinājumu</span>
                </Label>
                <p className="text-sm text-gray-500 mt-1">
                  Neaktīvie sludinājumi netiks rādīti lietotājiem
                </p>
              </div>

            </div>
          </div>

          </div>
        </div>

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