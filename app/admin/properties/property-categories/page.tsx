// app/admin/property-categories/page.tsx
"use client"

import { useEffect, useState } from "react"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Textarea } from "../../../components/ui/textarea"
import { Plus, Trash, Edit } from "lucide-react"
import AlertMessage from "../../../components/ui/alert-message"

interface Category {
  id: string
  name: string
  slug: string
  description: string
  isVisible: boolean
  order: number
}

export default function PropertyCategoriesAdmin() {
  const [categories, setCategories] = useState<Category[]>([])
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    isVisible: true,
    order: 0
  })

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const res = await fetch("/api/admin/property-categories")
      const data = await res.json()
      setCategories(data)
    } catch (error) {
      setErrorMessage("Neizdevās ielādēt kategorijas")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingCategory 
        ? `/api/admin/property-categories/${editingCategory.id}`
        : "/api/admin/property-categories"
      
      const method = editingCategory ? "PUT" : "POST"
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        setSuccessMessage(editingCategory ? "Kategorija atjaunināta!" : "Kategorija izveidota!")
        loadCategories()
        resetForm()
      } else {
        setErrorMessage("Kļūda saglabājot kategoriju")
      }
    } catch (error) {
      setErrorMessage("Kļūda saglabājot kategoriju")
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
      isVisible: true,
      order: 0
    })
    setEditingCategory(null)
    setIsCreating(false)
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description,
      isVisible: category.isVisible,
      order: category.order
    })
    setIsCreating(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Vai tiešām dzēst šo kategoriju?")) return

    try {
      const res = await fetch(`/api/admin/property-categories/${id}`, {
        method: "DELETE"
      })

      if (res.ok) {
        setSuccessMessage("Kategorija dzēsta!")
        loadCategories()
      } else {
        setErrorMessage("Kļūda dzēšot kategoriju")
      }
    } catch (error) {
      setErrorMessage("Kļūda dzēšot kategoriju")
    }
  }

  // Auto-ģenerē slug no name
  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: name.toLowerCase()
        .replace(/ā/g, 'a').replace(/č/g, 'c').replace(/ē/g, 'e')
        .replace(/ģ/g, 'g').replace(/ī/g, 'i').replace(/ķ/g, 'k')
        .replace(/ļ/g, 'l').replace(/ņ/g, 'n').replace(/š/g, 's')
        .replace(/ū/g, 'u').replace(/ž/g, 'z')
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
    }))
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-10">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Īpašumu kategorijas</h2>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Pievienot kategoriju
        </Button>
      </div>

      {successMessage && <AlertMessage type="success" message={successMessage} />}
      {errorMessage && <AlertMessage type="error" message={errorMessage} />}

      {/* Kategoriju forma */}
      {isCreating && (
        <div className="bg-gray-50 p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">
            {editingCategory ? "Rediģēt kategoriju" : "Jauna kategorija"}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Nosaukums</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Dzīvokļi"
                  required
                />
              </div>
              
              <div>
                <Label>Slug (URL)</Label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="dzivokli"
                  required
                />
              </div>
            </div>

            <div>
              <Label>Apraksts</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Kategorijas apraksts..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.isVisible}
                  onChange={(e) => setFormData(prev => ({ ...prev, isVisible: e.target.checked }))}
                />
                <Label>Rādīt publiskā lapā</Label>
              </div>

              <div>
                <Label>Secība</Label>
                <Input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>

            <div className="flex space-x-2">
              <Button type="submit">
                {editingCategory ? "Atjaunināt" : "Izveidot"}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Atcelt
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Kategoriju saraksts */}
      <div className="space-y-4">
        {categories.map((category) => (
          <div key={category.id} className="bg-white p-4 rounded-lg border flex justify-between items-center">
            <div>
              <h3 className="font-semibold">{category.name}</h3>
              <p className="text-sm text-gray-600">/{category.slug}</p>
              {category.description && (
                <p className="text-sm text-gray-500 mt-1">{category.description}</p>
              )}
              <div className="flex items-center space-x-4 mt-2">
                <span className={`text-xs px-2 py-1 rounded ${category.isVisible ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {category.isVisible ? 'Redzams' : 'Paslēpts'}
                </span>
                <span className="text-xs text-gray-500">Secība: {category.order}</span>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button variant="ghost" size="icon" onClick={() => handleEdit(category)}>
                <Edit className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => handleDelete(category.id)}>
                <Trash className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
