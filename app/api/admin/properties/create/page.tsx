"use client"
console.log("🔄 CreateProperty komponenta render sākās")
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "../../../../components/ui/button"
import { Input } from "../../../../components/ui/input"
import { Label } from "../../../../components/ui/label"
import { Textarea } from "../../../../components/ui/textarea"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import AlertMessage from "../../../../components/ui/alert-message"

interface Category {
  id: string
  name: string
}

export default function CreateProperty() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [agent, setAgent] = useState<{ firstName: string; lastName: string } | null>(null)
  
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

  useEffect(() => {
    console.log("🧠 useEffect tika palaists")
    loadCategories()
    loadAgent()
  }, [])  
  
  const loadAgent = async () => {
    console.log("fetching agent...")
    try {
      const res = await fetch("/api/admin/agent/me", { credentials: "include" })
      const data = await res.json()
      console.log("✅ Agent loaded:", data)
      setAgent({ firstName: data.firstName, lastName: data.lastName })
      console.log("agent state set:", { firstName: data.firstName, lastName: data.lastName })
    } catch (error) {
      console.error("❌ Neizdevās ielādēt aģentu", error)
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

      const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setErrorMessage(null)

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
          const submitData = {
            title: formData.title.trim(),
            description: formData.description.trim(),
            price: parseFloat(formData.price) || 0,
            currency: formData.currency,
            address: formData.address.trim(),
            city: formData.city.trim(),
            district: formData.district.trim() || null,
            rooms: formData.rooms ? parseInt(formData.rooms) : null,
            area: formData.area ? parseFloat(formData.area) : null,
            floor: formData.floor ? parseInt(formData.floor) : null,
            totalFloors: formData.totalFloors ? parseInt(formData.totalFloors) : null,
            categoryId: formData.categoryId,
            status: formData.status,
            isActive: formData.isActive,
            isFeatured: formData.isFeatured
          }

          const res = await fetch("/api/admin/properties", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(submitData)
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

          {agent && (
  <div className="bg-white p-4 rounded-lg border">
    <p className="text-sm text-gray-500">Agent component rendered</p>
    <Label className="block mb-1">Aģents</Label>
    <Input
      value={`${agent.firstName} ${agent.lastName}`}
      disabled
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
