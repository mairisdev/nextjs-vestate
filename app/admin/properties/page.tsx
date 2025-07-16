"use client"

import { useEffect, useState } from "react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Plus, Edit, Trash, Eye, Search } from "lucide-react"
import Link from "next/link"
import AlertMessage from "../../components/ui/alert-message"
import { getImageUrl } from "@/lib/imageUtils"

interface Property {
  id: string
  title: string
  price: number
  currency: string
  address: string
  city: string
  rooms: number | null
  area: number | null
  status: string
  isActive: boolean
  isFeatured: boolean
  mainImage: string | null
  category: {
    name: string
  }
  createdAt: string
}

export default function PropertiesAdmin() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    loadProperties()
  }, [])

  const loadProperties = async () => {
    try {
      const res = await fetch("/api/admin/properties")
      const data = await res.json()
      setProperties(data)
    } catch (error) {
      setErrorMessage("Neizdevās ielādēt īpašumus")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Vai tiešām dzēst šo īpašumu?")) return

    try {
      const res = await fetch(`/api/admin/properties/${id}`, {
        method: "DELETE"
      })

      if (res.ok) {
        setSuccessMessage("Īpašums dzēsts!")
        loadProperties()
      } else {
        setErrorMessage("Kļūda dzēšot īpašumu")
      }
    } catch (error) {
      setErrorMessage("Kļūda dzēšot īpašumu")
    }
  }

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/admin/properties/${id}/toggle-active`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive })
      })

      if (res.ok) {
        setSuccessMessage(`Īpašums ${!isActive ? 'aktivizēts' : 'deaktivizēts'}!`)
        loadProperties()
      } else {
        setErrorMessage("Kļūda mainot statusu")
      }
    } catch (error) {
      setErrorMessage("Kļūda mainot statusu")
    }
  }

  const toggleFeatured = async (id: string, isFeatured: boolean) => {
    try {
      const res = await fetch(`/api/admin/properties/${id}/toggle-featured`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: !isFeatured })
      })

      if (res.ok) {
        setSuccessMessage(`Īpašums ${!isFeatured ? 'pievienots izcelti' : 'noņemts no izcelti'}!`)
        loadProperties()
      } else {
        setErrorMessage("Kļūda mainot izceltā statusu")
      }
    } catch (error) {
      setErrorMessage("Kļūda mainot izceltā statusu")
    }
  }

  const formatPrice = (price: number, currency: string) => {
    return `${(price / 100).toLocaleString()} ${currency}`
  }

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.city.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === "all" || 
                         (filterStatus === "active" && property.isActive) ||
                         (filterStatus === "inactive" && !property.isActive) ||
                         (filterStatus === "featured" && property.isFeatured)
    
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return <div className="flex justify-center items-center h-64">Ielādē...</div>
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-10">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Īpašumu pārvaldība</h2>
        <Link href="/admin/properties/create">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Pievienot īpašumu
          </Button>
        </Link>
      </div>

      {successMessage && <AlertMessage type="success" message={successMessage} />}
      {errorMessage && <AlertMessage type="error" message={errorMessage} />}

      {/* Filtri */}
      <div className="flex flex-col md:flex-row gap-4 bg-gray-50 p-4 rounded-lg">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Meklēt īpašumus..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Visi</option>
          <option value="active">Aktīvi</option>
          <option value="inactive">Neaktīvi</option>
          <option value="featured">Izceltie</option>
        </select>
      </div>

      {/* Īpašumu saraksts */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Īpašums
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kategorija
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cena
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Detaļas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Darbības
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProperties.map((property) => (
                <tr key={property.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {property.mainImage && (
                        <img
                          src={getImageUrl(property.mainImage) || '/placeholder-property.jpg'}
                          alt={property.title}
                          className="w-16 h-16 object-cover rounded-lg mr-4"
                          onError={(e) => {
                            // Fallback ja attēls neielādējas
                            e.currentTarget.src = '/placeholder-property.jpg'
                          }}
                        />
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {property.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {property.address}, {property.city}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {property.category.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatPrice(property.price, property.currency)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {property.rooms && `${property.rooms} ist.`}
                    {property.rooms && property.area && " • "}
                    {property.area && `${property.area} m²`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        property.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {property.isActive ? 'Aktīvs' : 'Neaktīvs'}
                      </span>
                      {property.isFeatured && (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Izcelts
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Link href={`/admin/properties/${property.id}/edit`}>
                        <Button variant="ghost" size="icon">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => toggleActive(property.id, property.isActive)}
                      >
                        <Eye className={`w-4 h-4 ${property.isActive ? 'text-green-600' : 'text-gray-400'}`} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => toggleFeatured(property.id, property.isFeatured)}
                        className={property.isFeatured ? 'text-yellow-600' : 'text-gray-400'}
                      >
                        ★
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDelete(property.id)}
                      >
                        <Trash className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredProperties.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Nav atrasti īpašumi pēc dotajiem kritērijiem.</p>
        </div>
      )}
    </div>
  )
}