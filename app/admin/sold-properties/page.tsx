"use client"

import { useState } from "react"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Button } from "../../components/ui/button"
import { Textarea } from "../../components/ui/textarea"
import { Trash, Plus } from "lucide-react"

interface Property {
  title: string
  price: string
  status: "pārdots" | "pārdošanā"
  image: File | null
  size: string
  series: string
  floor: string
  link: string
}

export default function SoldPropertiesSettings() {
  const [properties, setProperties] = useState<Property[]>([
    {
      title: "3 istabu dzīvoklis Salaspilī",
      price: "€75 800",
      status: "pārdots",
      image: null,
      size: "77m2",
      series: "103 sērija",
      floor: "4 stāvs",
      link: "#",
    },
  ])

  const updateProperty = (index: number, field: keyof Property, value: any) => {
    const updated = [...properties]
    updated[index] = { ...updated[index], [field]: value }
    setProperties(updated)
  }

  const addProperty = () => {
    setProperties([
      ...properties,
      {
        title: "",
        price: "",
        status: "pārdots",
        image: null,
        size: "",
        series: "",
        floor: "",
        link: "#",
      },
    ])
  }

  const removeProperty = (index: number) => {
    setProperties(properties.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-10">
      <h2 className="text-2xl font-bold">Pārdoto īpašumu iestatījumi</h2>

      {properties.map((property, index) => (
        <div key={index} className="border rounded-lg p-4 space-y-4 bg-white">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-lg">Īpašums #{index + 1}</h3>
            <Button variant="ghost" size="icon" onClick={() => removeProperty(index)}>
              <Trash className="w-4 h-4 text-red-500" />
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Nosaukums</Label>
              <Input
                value={property.title}
                onChange={(e) => updateProperty(index, "title", e.target.value)}
              />
            </div>
            <div>
              <Label>Cena</Label>
              <Input
                value={property.price}
                onChange={(e) => updateProperty(index, "price", e.target.value)}
              />
            </div>
            <div>
              <Label>Statuss</Label>
              <select
                className="w-full border px-2 py-2 rounded-md"
                value={property.status}
                onChange={(e) =>
                  updateProperty(index, "status", e.target.value as "pārdots" | "pārdošanā")
                }
              >
                <option value="pārdots">Pārdots</option>
                <option value="pārdošanā">Pārdošanā</option>
              </select>
            </div>
            <div>
              <Label>Attēls</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  updateProperty(index, "image", e.target.files?.[0] || null)
                }
              />
            </div>
            <div>
              <Label>Platība</Label>
              <Input
                value={property.size}
                onChange={(e) => updateProperty(index, "size", e.target.value)}
              />
            </div>
            <div>
              <Label>Sērija</Label>
              <Input
                value={property.series}
                onChange={(e) => updateProperty(index, "series", e.target.value)}
              />
            </div>
            <div>
              <Label>Stāvs / Istabas</Label>
              <Input
                value={property.floor}
                onChange={(e) => updateProperty(index, "floor", e.target.value)}
              />
            </div>
            <div>
              <Label>Saite (skatīt vairāk)</Label>
              <Input
                value={property.link}
                onChange={(e) => updateProperty(index, "link", e.target.value)}
              />
            </div>
          </div>
        </div>
      ))}

      <Button variant="outline" size="sm" onClick={addProperty}>
        <Plus className="w-4 h-4 mr-1" /> Pievienot īpašumu
      </Button>

      <div>
        <Button className="mt-6">Saglabāt izmaiņas</Button>
      </div>
    </div>
  )
}
