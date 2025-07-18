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
  const [categoriesLoading, setCategoriesLoading] = useState(true)
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
  const [additionalImages, setAdditionalImages] = useState<File[]>([])
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null)
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState<string[]>([])

  // FILE SIZE VALIDATION HELPER
  const validateFileSize = (file: File, maxSizeMB: number = 10): boolean => {
    const maxSizeBytes = maxSizeMB * 1024 * 1024
    if (file.size > maxSizeBytes) {
      setErrorMessage(`Fails "${file.name}" pārāk liels. Maksimums ${maxSizeMB}MB.`)
      return false
    }
    return true
  }

  // CALCULATE TOTAL UPLOAD SIZE
  const getTotalUploadSize = (): number => {
    let totalSize = 0
    if (mainImage) totalSize += mainImage.size
    additionalImages.forEach(img => totalSize += img.size)
    return totalSize
  }

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      console.log('📁 Main image selected:', {
        name: file.name,
        size: file.size,
        type: file.type,
        sizeMB: (file.size / 1024 / 1024).toFixed(2)
      })

      // Validate file size
      if (!validateFileSize(file, 10)) {
        return
      }

      setMainImage(file)
      const previewUrl = URL.createObjectURL(file)
      setMainImagePreview(previewUrl)
    }
  }

  const handleAdditionalImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    console.log('📁 Additional images selected:', files.map(f => ({
      name: f.name,
      size: f.size,
      sizeMB: (f.size / 1024 / 1024).toFixed(2)
    })))

    // Validate each file size
    for (const file of files) {
      if (!validateFileSize(file, 10)) {
        return
      }
    }

    // Check total number of images
    if (files.length + additionalImages.length > 10) {
      setErrorMessage("Maksimums 10 papildu attēli")
      return
    }

    // Check total upload size
    const currentTotalSize = getTotalUploadSize()
    const newFilesSize = files.reduce((sum, file) => sum + file.size, 0)
    const totalSizeMB = (currentTotalSize + newFilesSize) / 1024 / 1024

    if (totalSizeMB > 50) {
      setErrorMessage(`Kopējais failu izmērs pārāk liels: ${totalSizeMB.toFixed(1)}MB. Maksimums 50MB.`)
      return
    }

    setAdditionalImages(prev => [...prev, ...files])
    
    const newPreviews = files.map(file => URL.createObjectURL(file))
    setAdditionalImagePreviews(prev => [...prev, ...newPreviews])
  }

  const removeAdditionalImage = (index: number) => {
    console.log('🗑️ Removing additional image:', index)
    setAdditionalImages(prev => prev.filter((_, i) => i !== index))
    setAdditionalImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  useEffect(() => {
    loadCategories()
    loadAgent()
  }, [])

  // DEBUG: Log state changes
  useEffect(() => {
    console.log('🔄 Categories state changed:', {
      count: categories.length,
      loading: categoriesLoading,
      categories: categories.map(c => ({ id: c.id, name: c.name, visible: c.isVisible }))
    })
  }, [categories, categoriesLoading])

  useEffect(() => {
    console.log('🔄 Form categoryId changed:', formData.categoryId)
  }, [formData.categoryId])

  const loadAgent = async () => {
    try {
      console.log('👤 Loading agent...')
      const res = await fetch("/api/admin/agent/me")
      
      if (!res.ok) {
        console.warn('⚠️ Agent API returned non-OK status:', res.status)
        return
      }
      
      const data = await res.json()
      setAgent({ firstName: data.firstName, lastName: data.lastName })
      console.log('✅ Agent loaded:', data.firstName, data.lastName)
    } catch (error) {
      console.error("❌ Failed to load agent:", error)
    }
  }

  const loadCategories = async () => {
    try {
      console.log('📂 Loading categories...')
      setCategoriesLoading(true)
      
      const res = await fetch("/api/admin/property-categories")
      
      console.log('📂 Categories API response:', {
        status: res.status,
        statusText: res.statusText,
        ok: res.ok,
        headers: Object.fromEntries(res.headers.entries())
      })
      
      if (!res.ok) {
        throw new Error(`Categories API failed: ${res.status} ${res.statusText}`)
      }
      
      const data = await res.json()
      
      console.log('📂 Categories raw data:', data)
      console.log('📂 Categories count:', data?.length || 0)
      
      if (!Array.isArray(data)) {
        throw new Error(`Categories API returned invalid data type: ${typeof data}`)
      }
      
      // SVARĪGI: Admin panelī rādam VISAS kategorijas
      setCategories(data)
      
      console.log('✅ Categories loaded successfully:', {
        total: data.length,
        visible: data.filter((c: Category) => c.isVisible).length,
        hidden: data.filter((c: Category) => !c.isVisible).length
      })
      
    } catch (error) {
      console.error("❌ Error loading categories:", error)
      setErrorMessage(`Neizdevās ielādēt kategorijas: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setCategoriesLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('🚀 Starting form submission...')
    
    setLoading(true)
    setErrorMessage(null)
    setUploadProgress(0)

    // CLIENT-SIDE VALIDATION
    console.log('✅ Validating form data...')
    
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

    // Validate selected category exists
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

    console.log('✅ Validation passed, preparing form data...')

    // Progress simulation
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
      
      // Log what we're sending
      console.log('📝 Form data being sent:', {
        title: formData.title,
        categoryId: formData.categoryId,
        selectedCategory: selectedCategory.name,
        price: formData.price,
        address: formData.address,
        city: formData.city,
        mainImage: mainImage ? `${mainImage.name} (${(mainImage.size / 1024 / 1024).toFixed(2)}MB)` : 'None',
        additionalImages: additionalImages.length,
        totalSizeMB: totalSizeMB.toFixed(2)
      })

      // Add form fields
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

      // Add images
      if (mainImage) {
        console.log('📎 Adding main image:', mainImage.name)
        formDataToSend.append("mainImage", mainImage)
      }
      
      additionalImages.forEach((image, index) => {
        console.log(`📎 Adding additional image ${index + 1}:`, image.name)
        formDataToSend.append(`additionalImage${index}`, image)
      })

      console.log('🌐 Sending POST request to /api/admin/properties...')

      const res = await fetch("/api/admin/properties", {
        method: "POST",
        body: formDataToSend
      })

      console.log('📡 API Response:', {
        status: res.status,
        statusText: res.statusText,
        ok: res.ok,
        headers: Object.fromEntries(res.headers.entries())
      })

      const responseData = await res.json()
      console.log('📄 Response data:', responseData)

      setUploadProgress(100)
      clearInterval(progressInterval)

      if (res.ok) {
        console.log('🎉 Property created successfully!')
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

            {/* DEBUG INFO (remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-gray-100 p-4 rounded-lg text-xs">
          <h4 className="font-bold mb-2">Debug Info:</h4>
          <p>Categories loading: {categoriesLoading ? 'Yes' : 'No'}</p>
          <p>Categories count: {categories.length}</p>
          <p>Selected category: {formData.categoryId || 'None'}</p>
          <p>Total upload size: {(getTotalUploadSize() / 1024 / 1024).toFixed(2)}MB</p>
          <p>Agent: {agent ? `${agent.firstName} ${agent.lastName}` : 'Not loaded'}</p>
        </div>
      )}

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