"use client"

import { useState } from "react"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import { Button } from "../../components/ui/button"
import { Trash, Plus } from "lucide-react"

type Testimonial = {
  name: string
  message: string
  rating: number
  language?: string
}

export default function TestimonialsSettings() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([
    {
      name: "Aleksandra Pticiņa",
      message:
        "Мы очень рекомендуем «Vestate Latvija», отлично справились с нашей продажей! Достаточно быстро всё продали! 🥰👍",
      rating: 5,
      language: "ru",
    },
    {
      name: "Alena Kraveca",
      message:
        "Ļoti viss apmierina. Palīdzēja pārdot un arī palīdzēja atrast dzīvokli pirkšanai tieši tādu kā meklējām...",
      rating: 5,
      language: "lv",
    },
    {
      name: "Olga Leksina",
      message:
        "I was looking for a place to live in Riga and the real estate agent, Vineta helped me to find a good place...",
      rating: 5,
      language: "en",
    },
  ])

  const handleChange = (index: number, field: keyof Testimonial, value: string | number) => {
    const updated = [...testimonials]
    updated[index] = { ...updated[index], [field]: value }
    setTestimonials(updated)
  }

  const addTestimonial = () => {
    setTestimonials([
      ...testimonials,
      { name: "", message: "", rating: 5, language: "lv" },
    ])
  }

  const removeTestimonial = (index: number) => {
    setTestimonials(testimonials.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-10">
      <h2 className="text-2xl font-bold">Atsauksmju sadaļas iestatījumi</h2>

      {testimonials.map((item, index) => (
        <div key={index} className="bg-white rounded-xl p-4 shadow space-y-4 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Klienta vārds</Label>
              <Input
                value={item.name}
                onChange={(e) => handleChange(index, "name", e.target.value)}
              />
            </div>

            <div>
              <Label>Vērtējums (1–5)</Label>
              <Input
                type="number"
                min={1}
                max={5}
                value={item.rating}
                onChange={(e) => handleChange(index, "rating", parseInt(e.target.value))}
              />
            </div>
          </div>

          <div>
            <Label>Atsauksme</Label>
            <Textarea
              rows={3}
              value={item.message}
              onChange={(e) => handleChange(index, "message", e.target.value)}
            />
          </div>

          <div>
            <Label>Valoda (lv / en / ru)</Label>
            <Input
              value={item.language || "lv"}
              onChange={(e) => handleChange(index, "language", e.target.value)}
            />
          </div>

          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeTestimonial(index)}
              title="Dzēst"
            >
              <Trash className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        </div>
      ))}

      <Button variant="outline" onClick={addTestimonial}>
        <Plus className="w-4 h-4 mr-2" /> Pievienot atsauksmi
      </Button>

      <div>
        <Button className="mt-4">Saglabāt izmaiņas</Button>
      </div>
    </div>
  )
}
