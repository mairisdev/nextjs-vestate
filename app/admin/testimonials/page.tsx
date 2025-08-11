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
  id?: string
  name: string
  message: string
  rating: number
  language: string
}

export default function TestimonialsPage() {
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
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchTestimonials()
  }, [])

  const fetchTestimonials = async () => {
    try {
      const res = await fetch("/api/testimonials")
      const data = await res.json()
      setTestimonials(data)
    } catch (error) {
      console.error("Error fetching testimonials:", error)
      setShowError(true)
    }
  }

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
    if (!formData.name.trim() || !formData.message.trim()) {
      alert("Lūdzu aizpildiet visus obligātos laukus!")
      return
    }

    setLoading(true)
    const updated = [...testimonials]
    
    if (editingIndex !== null) {
      updated[editingIndex] = formData
    } else {
      updated.push(formData)
    }

    try {
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testimonials: updated }),
      })

      const data = await res.json()

      if (data.success) {
        setTestimonials(updated)
        setModalOpen(false)
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 3000)
      } else {
        setShowError(true)
        setTimeout(() => setShowError(false), 3000)
      }
    } catch (err) {
      console.error("Error saving testimonial:", err)
      setShowError(true)
      setTimeout(() => setShowError(false), 3000)
    } finally {
      setLoading(false)
    }
  }

  const removeTestimonial = async (index: number) => {
    if (!confirm("Vai tiešām vēlaties dzēst šo atsauksmi?")) return

    setLoading(true)
    const updated = testimonials.filter((_, i) => i !== index)
    
    try {
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testimonials: updated }),
      })

      const data = await res.json()

      if (data.success) {
        setTestimonials(updated)
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 3000)
      } else {
        setShowError(true)
        setTimeout(() => setShowError(false), 3000)
      }
    } catch (err) {
      console.error("Error removing testimonial:", err)
      setShowError(true)
      setTimeout(() => setShowError(false), 3000)
    } finally {
      setLoading(false)
    }
  }

  return (
      <div className="space-y-8 max-w-6xl mx-auto">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-[#00332D]">Atsauksmju pārvaldība</h1>
          <Button 
            onClick={() => openEditModal(null)}
            className="bg-[#00332D] hover:bg-[#00443B]"
            disabled={loading}
          >
            <Plus className="w-4 h-4 mr-2" /> 
            Pievienot atsauksmi
          </Button>
        </div>

        {showSuccess && (
          <AlertMessage 
            type="success" 
            message="Darbība veikta veiksmīgi!" 
            onClose={() => setShowSuccess(false)} 
          />
        )}
        {showError && (
          <AlertMessage 
            type="error" 
            message="Radās kļūda! Lūdzu mēģiniet vēlreiz." 
            onClose={() => setShowError(false)} 
          />
        )}

        {loading && (
          <div className="text-center py-4">
            <div className="inline-flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-[#00332D] border-t-transparent rounded-full animate-spin"></div>
              Apstrādā...
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((item, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#77D4B4]/10 text-[#00332D]">
                    {item.language.toUpperCase()}
                  </span>
                  <div className="text-[#77D4B4] text-lg">
                    {"★".repeat(item.rating)}{"☆".repeat(5 - item.rating)}
                  </div>
                </div>

                <blockquote className="text-gray-700 italic leading-relaxed">
                  "{item.message}"
                </blockquote>

                <div className="text-right">
                  <cite className="font-semibold text-[#00332D] not-italic">
                    — {item.name}
                  </cite>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditModal(index)}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    disabled={loading}
                  >
                    <Pencil className="w-4 h-4 mr-1" />
                    Labot
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTestimonial(index)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    disabled={loading}
                  >
                    <Trash className="w-4 h-4 mr-1" />
                    Dzēst
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {testimonials.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-4">Nav nevienas atsauksmes</div>
            <Button 
              onClick={() => openEditModal(null)}
              variant="outline"
              className="border-[#00332D] text-[#00332D] hover:bg-[#00332D] hover:text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Pievienot pirmo atsauksmi
            </Button>
          </div>
        )}

        {/* Modal ar uzlabotu dizainu */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-[#00332D]">
                {editingIndex !== null ? "Labot atsauksmi" : "Pievienot jaunu atsauksmi"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 px-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                    Klienta vārds *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Pēteris Ozoliņš"
                    className="border-gray-300 focus:border-[#00332D] focus:ring-[#00332D]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language" className="text-sm font-medium text-gray-700">
                    Valoda
                  </Label>
                  <select
                    id="language"
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-[#00332D] focus:ring-[#00332D] focus:ring-1"
                  >
                    <option value="lv">Latviešu</option>
                    <option value="en">English</option>
                    <option value="ru">Русский</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rating" className="text-sm font-medium text-gray-700">
                  Vērtējums
                </Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="rating"
                    type="number"
                    min={1}
                    max={5}
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) || 1 })}
                    className="w-24 border-gray-300 focus:border-[#00332D] focus:ring-[#00332D]"
                  />
                  <div className="text-[#77D4B4] text-lg">
                    {"★".repeat(formData.rating)}{"☆".repeat(5 - formData.rating)}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="text-sm font-medium text-gray-700">
                  Atsauksmes teksts *
                </Label>
                <Textarea
                  id="message"
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Rakstiet atsauksmi šeit..."
                  className="border-gray-300 focus:border-[#00332D] focus:ring-[#00332D] resize-none"
                />
                <div className="text-xs text-gray-500">
                  {formData.message.length}/500 rakstzīmes
                </div>
              </div>
            </div>

            <DialogFooter className="gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setModalOpen(false)}
                disabled={loading}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Atcelt
              </Button>
              <Button 
                type="button" 
                onClick={saveTestimonial}
                disabled={loading || !formData.name.trim() || !formData.message.trim()}
                className="bg-[#00332D] hover:bg-[#00443B] text-white"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saglabā...
                  </div>
                ) : (
                  editingIndex !== null ? "Saglabāt izmaiņas" : "Pievienot atsauksmi"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
  )
}