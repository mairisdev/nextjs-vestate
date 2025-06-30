"use client"

import { useEffect, useState } from "react"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import { Button } from "../../components/ui/button"
import { Trash, Plus } from "lucide-react"

type Testimonial = {
  name: string
  message: string
  rating: number
  language: string
}

export default function TestimonialsSettings() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [status, setStatus] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/testimonials")
      const data = await res.json()
      setTestimonials(data)
    }
    fetchData()
  }, [])

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

  const handleSave = async () => {
    setStatus("Saglabājas...")

    const res = await fetch("/api/testimonials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ testimonials }),
    })

    if (res.ok) {
      setStatus("Saglabāts veiksmīgi ✅")
    } else {
      setStatus("Kļūda saglabājot ❌")
    }
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
                onChange={(e: { target: { value: string | number } }) => handleChange(index, "name", e.target.value)}
              />
            </div>

            <div>
              <Label>Vērtējums (1–5)</Label>
              <Input
                type="number"
                min={1}
                max={5}
                value={item.rating}
                onChange={(e: { target: { value: string } }) => handleChange(index, "rating", parseInt(e.target.value))}
              />
            </div>
          </div>

          <div>
            <Label>Atsauksme</Label>
            <Textarea
              rows={3}
              value={item.message}
              onChange={(e: { target: { value: string | number } }) => handleChange(index, "message", e.target.value)}
            />
          </div>

          <div>
            <Label>Valoda (lv / en / ru)</Label>
            <Input
              value={item.language}
              onChange={(e: { target: { value: string | number } }) => handleChange(index, "language", e.target.value)}
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
        <Button className="mt-4" onClick={handleSave}>
          Saglabāt izmaiņas
        </Button>
        {status && <p className="mt-2 text-sm">{status}</p>}
      </div>
    </div>
  )
}
