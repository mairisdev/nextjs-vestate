"use client"

import { useEffect, useState } from "react"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Button } from "../../components/ui/button"
import { Textarea } from "../../components/ui/textarea"
import { Trash, Plus } from "lucide-react"

import AlertMessage from "../../components/ui/alert-message"

// Types

type Property = {
  title: string
  price: string
  status: "pārdots" | "pārdošanā"
  imageFiles: File[]
  imageUrls: string[]
  size: string
  series: string
  floor: string
  description: string
  link: string
}

export default function SoldPropertiesSettings() {
  const [properties, setProperties] = useState<Property[]>([])
  const [status, setStatus] = useState("")
  const [showSuccess, setShowSuccess] = useState(false)
  const [showError, setShowError] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/sold-properties")
      const data = await res.json()
      const parsed: Property[] = data.map((item: any) => ({
        ...item,
        imageFiles: [],
        imageUrls: item.imageUrls || [],
      }))
      setProperties(parsed)
    }
    fetchData()
  }, [])

  const updateProperty = (index: number, field: keyof Property, value: any) => {
    const updated = [...properties]
    updated[index] = { ...updated[index], [field]: value }
    setProperties(updated)
  }

  const handleImageUpload = (index: number, files: FileList | null) => {
    if (!files) return
    const updated = [...properties]
    updated[index].imageFiles = Array.from(files)
    updateProperty(index, "imageUrls", [])
    setProperties(updated)
  }

  const addProperty = () => {
    setProperties([
      ...properties,
      {
        title: "",
        price: "",
        status: "pārdots",
        imageFiles: [],
        imageUrls: [],
        size: "",
        series: "",
        floor: "",
        description: "",
        link: "#",
      },
    ])
  }

  const removeProperty = (index: number) => {
    setProperties(properties.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    setStatus("Saglabājas...")

    const formData = new FormData()
    formData.append("data", JSON.stringify(properties.map(p => ({
      title: p.title,
      price: p.price,
      status: p.status,
      size: p.size,
      series: p.series,
      floor: p.floor,
      description: p.description,
      link: p.link,
      imageUrls: p.imageUrls,
    }))))

    properties.forEach((p, i) => {
      p.imageFiles.forEach(file => {
        formData.append(`images_${i}`, file)
      })
    })

    const res = await fetch("/api/sold-properties", {
      method: "POST",
      body: formData,
    })

    if (res.ok) {
      setShowSuccess(true)
    } else {
      setShowError(true)
    }
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-10">
      <h2 className="text-2xl font-bold text-[#00332D]">Pārdoto īpašumu iestatījumi</h2>

      {showSuccess && (
        <AlertMessage type="success" message="Saglabāts veiksmīgi!" onClose={() => setShowSuccess(false)} />
      )}
      {showError && (
        <AlertMessage type="error" message="Kļūda saglabājot!" onClose={() => setShowError(false)} />
      )}

      <div className="space-y-6">
        {properties.map((property, index) => (
          <div key={index} className="border rounded-xl p-6 space-y-6 bg-white shadow-sm">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-lg text-[#00332D]">Īpašums #{index + 1}</h3>
              <Button variant="ghost" size="icon" onClick={() => removeProperty(index)}>
                <Trash className="w-4 h-4 text-red-500" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Nosaukums</Label>
                <Input value={property.title} onChange={(e) => updateProperty(index, "title", e.target.value)} />
              </div>
              <div>
                <Label>Cena</Label>
                <Input value={property.price} onChange={(e) => updateProperty(index, "price", e.target.value)} />
              </div>
              <div>
                <Label>Statuss</Label>
                <select
                  className="w-full border px-3 py-2 rounded-md"
                  value={property.status}
                  onChange={(e) => updateProperty(index, "status", e.target.value as Property["status"])}
                >
                  <option value="pārdots">Pārdots</option>
                  <option value="pārdošanā">Pārdošanā</option>
                </select>
              </div>
              <div>
                <Label>Platība</Label>
                <Input value={property.size} onChange={(e) => updateProperty(index, "size", e.target.value)} />
              </div>
              <div>
                <Label>Sērija / Tips</Label>
                <Input value={property.series} onChange={(e) => updateProperty(index, "series", e.target.value)} />
              </div>
              <div>
                <Label>Stāvs / Istabas</Label>
                <Input value={property.floor} onChange={(e) => updateProperty(index, "floor", e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <Label>Apraksts (modal)</Label>
                <Textarea
                  rows={3}
                  value={property.description}
                  onChange={(e) => updateProperty(index, "description", e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <Label>Saite (apskatīt vairāk)</Label>
                <Input value={property.link} onChange={(e) => updateProperty(index, "link", e.target.value)} />
              </div>

              <div className="md:col-span-2">
                <Label>Attēli</Label>
                <div className="w-full border border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer bg-gray-50">
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    className="opacity-0 absolute inset-0 z-10 cursor-pointer"
                    onChange={(e) => handleImageUpload(index, e.target.files)}
                  />
                  <p className="text-sm text-gray-600">Izvēlieties vienu vai vairākus attēlus no failiem</p>
                </div>

                <div className="flex gap-2 mt-3 overflow-x-auto">
                  {(property.imageFiles.length > 0
                    ? property.imageFiles.map((f, i) => URL.createObjectURL(f))
                    : property.imageUrls
                  ).map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      className="w-24 h-16 object-cover rounded border"
                      alt={`preview-${i}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button variant="outline" size="sm" onClick={addProperty} className="mt-4">
        <Plus className="w-4 h-4 mr-1" /> Pievienot īpašumu
      </Button>

      <div>
        <Button className="mt-6" onClick={handleSave}>
          Saglabāt izmaiņas
        </Button>
        {status && <p className="mt-2 text-sm">{status}</p>}
      </div>
    </div>
  )
}
