"use client"

import { useEffect, useState } from "react"
import { Button } from "../../components/ui/button"
import { Label } from "../../components/ui/label"
import { Plus, Edit, Trash, Eye, FileText, GraduationCap, Home } from "lucide-react"
import Link from "next/link"
import AlertMessage from "../../components/ui/alert-message"

interface Content {
  id: string
  title: string
  slug: string
  excerpt: string
  type: "EDUCATIONAL" | "VILLAGES"
  published: boolean
  publishedAt: string | null
  featuredImage: string | null
  author: string | null
  createdAt: string
  updatedAt: string
}

export default function ContentAdmin() {
  const [content, setContent] = useState<Content[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState<string>("all")
  const [filterPublished, setFilterPublished] = useState<string>("all")
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    loadContent()
  }, [filterType, filterPublished])

  const loadContent = async () => {
    try {
      const params = new URLSearchParams()
      if (filterType !== "all") params.append("type", filterType)
      if (filterPublished !== "all") params.append("published", filterPublished)
      
      const res = await fetch(`/api/content?${params.toString()}`)
      const data = await res.json()
      setContent(data)
    } catch (error) {
      setErrorMessage("Neizdevās ielādēt saturu")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Vai tiešām dzēst šo ierakstu?")) return

    try {
      const res = await fetch(`/api/content/${id}`, {
        method: "DELETE"
      })

      if (res.ok) {
        setSuccessMessage("Ieraksts dzēsts!")
        loadContent()
      } else {
        setErrorMessage("Kļūda dzēšot ierakstu")
      }
    } catch (error) {
      setErrorMessage("Kļūda dzēšot ierakstu")
    }
  }

  const togglePublished = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/content/${id}/toggle-published`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !currentStatus })
      })

      if (res.ok) {
        setSuccessMessage(`Ieraksts ${!currentStatus ? 'publicēts' : 'noņemts no publikācijas'}!`)
        loadContent()
      } else {
        setErrorMessage("Kļūda mainot publikācijas statusu")
      }
    } catch (error) {
      setErrorMessage("Kļūda mainot publikācijas statusu")
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "EDUCATIONAL":
        return <GraduationCap className="w-4 h-4" />
      case "VILLAGES":
        return <Home className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "EDUCATIONAL":
        return "Izglītojošais"
      case "VILLAGES":
        return "Ciemati"
      default:
        return type
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">Ielādē...</div>
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-10">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Satura pārvaldība</h2>
        <Link href="/admin/content/create">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Pievienot saturu
          </Button>
        </Link>
      </div>

      {successMessage && <AlertMessage type="success" message={successMessage} />}
      {errorMessage && <AlertMessage type="error" message={errorMessage} />}

      <div className="flex flex-col md:flex-row gap-4 bg-gray-50 p-4 rounded-lg">
        <div>
          <Label>Tips</Label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Visi tipi</option>
            <option value="EDUCATIONAL">Izglītojošais</option>
            <option value="VILLAGES">Ciemati</option>
          </select>
        </div>
        
        <div>
          <Label>Status</Label>
          <select
            value={filterPublished}
            onChange={(e) => setFilterPublished(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Visi</option>
            <option value="true">Publicēti</option>
            <option value="false">Melnraksti</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Saturs
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tips
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Autors
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Darbības
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {content.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {item.featuredImage && (
                        <img
                          src={item.featuredImage}
                          alt={item.title}
                          className="w-16 h-16 object-cover rounded-lg mr-4"
                        />
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {item.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {item.excerpt.substring(0, 100)}...
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(item.createdAt).toLocaleDateString('lv-LV')}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(item.type)}
                      <span className="text-sm text-gray-900">{getTypeLabel(item.type)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      item.published 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {item.published ? 'Publicēts' : 'Melnraksts'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.author || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Link href={`/admin/content/${item.id}/edit`}>
                        <Button variant="ghost" size="icon">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => togglePublished(item.id, item.published)}
                      >
                        <Eye className={`w-4 h-4 ${item.published ? 'text-green-600' : 'text-gray-400'}`} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDelete(item.id)}
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

      {content.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Nav atrasts saturs pēc norādītajiem kritērijiem.</p>
          <p className="text-gray-400 text-sm mt-2">Izveidojiet jaunu ierakstu, lai sāktu.</p>
        </div>
      )}
    </div>
  )
}