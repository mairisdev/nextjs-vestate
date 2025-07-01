"use client"

import { useState, useEffect } from "react"
import { Button } from "../../components/ui/button"
import { Trash, Plus, Pencil } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import AlertMessage from "../../components/ui/alert-message"

type Testimonial = {
  name: string
  message: string
  rating: number
  language: string
}

export default function TestimonialsSettings() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [status, setStatus] = useState("")
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [formData, setFormData] = useState<Testimonial>({
    name: "",
    message: "",
    rating: 5,
    language: "lv",
  })
  const [showSuccess, setShowSuccess] = useState(false)
  const [showError, setShowError] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/testimonials")
      const data = await res.json()
      setTestimonials(data)
    }
    fetchData()
  }, [])

  const openEditModal = (index: number | null) => {
    if (index !== null) {
      setFormData(testimonials[index])
      setEditingIndex(index)
    } else {
      setFormData({ name: "", message: "", rating: 5, language: "lv" })
      setEditingIndex(null)
    }
    setModalOpen(true)
  }

const saveTestimonial = async () => {
  const updated = [...testimonials]
  if (editingIndex !== null) {
    updated[editingIndex] = formData
  } else {
    updated.push(formData)
  }
  setTestimonials(updated)
  setModalOpen(false)

  setStatus("Saglabājas...")

  try {
    const res = await fetch("/api/testimonials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ testimonials: updated }),
    })

    const data = await res.json()

      if (data.success) {
      setShowSuccess(true)
    } else {
      setShowError(true)
    }
  } catch (err) {
    setStatus("Tīkla kļūda ❌")
  }
}

  const removeTestimonial = (index: number) => {
    setTestimonials(testimonials.filter((_, i) => i !== index))
  }

  const handleSaveAll = async () => {
    setStatus("Saglabājas...")

    try {
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testimonials }),
      })

      const data = await res.json()

      if (data.success) {
      setShowSuccess(true)
    } else {
      setShowError(true)
    }

    } catch (err) {
      setStatus("Tīkla kļūda ❌")
    }
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-10">
      <h2 className="text-2xl font-bold text-[#00332D]">Atsauksmju sadaļas iestatījumi</h2>

            {showSuccess && (
              <AlertMessage type="success" message="Saglabāts veiksmīgi!" onClose={() => setShowSuccess(false)} />
            )}
            {showError && (
              <AlertMessage type="error" message="Saglabāšanas kļūda!" onClose={() => setShowError(false)} />
            )}


      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {testimonials.map((item, index) => (
          <div key={index} className="bg-white rounded-xl p-4 shadow border space-y-3 text-sm relative">
            <div className="text-[13px] text-gray-600">{item.language.toUpperCase()}</div>
            <p className="text-gray-800 text-base leading-snug">"{item.message}"</p>
            <div className="flex justify-between items-center text-sm text-gray-600">
              <span className="font-medium">{item.name}</span>
              <span className="text-[#77D4B4] text-[15px]">
                {"★".repeat(item.rating)}{"☆".repeat(5 - item.rating)}
              </span>
            </div>

            <div className="flex justify-between items-center pt-2 border-t mt-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openEditModal(index)}
                className="text-blue-600"
              >
                <Pencil className="w-4 h-4 mr-1" />
                Labot
              </Button>
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
      </div>

      <Button variant="outline" onClick={() => openEditModal(null)}>
        <Plus className="w-4 h-4 mr-2" /> Pievienot atsauksmi
      </Button>

      <div>
        <Button className="mt-6" onClick={handleSaveAll}>
          Saglabāt visas atsauksmes
        </Button>
        {status && <p className="mt-2 text-sm">{status}</p>}
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingIndex !== null ? "Labot atsauksmi" : "Pievienot atsauksmi"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Klienta vārds</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <Label>Vērtējums (1–5)</Label>
              <Input
                type="number"
                min={1}
                max={5}
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
              />
            </div>

            <div>
              <Label>Atsauksme</Label>
              <Textarea
                rows={3}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              />
            </div>

            <div>
              <Label>Valoda</Label>
              <Input
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button onClick={saveTestimonial}>
              {editingIndex !== null ? "Saglabāt izmaiņas" : "Pievienot atsauksmi"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
