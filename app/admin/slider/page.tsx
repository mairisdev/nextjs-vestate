"use client"

import { useState, useEffect } from "react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import { Trash, Plus } from "lucide-react"

type Slide = {
  id?: string
  title: string
  subtitle: string
  description: string
  buttonText: string
  buttonLink: string
  image: File | null
  imageUrl?: string
}

export default function SliderSettings() {
  const [slides, setSlides] = useState<Slide[]>([])
  const [loading, setLoading] = useState(true)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSlideChange = (index: number, field: keyof Slide, value: any) => {
    const updated = [...slides]
    updated[index] = { ...updated[index], [field]: value }
    setSlides(updated)
  }

  const addSlide = () => {
    setSlides([
      ...slides,
      {
        title: "",
        subtitle: "",
        description: "",
        buttonText: "",
        buttonLink: "",
        image: null,
      },
    ])
  }

  const removeSlide = (index: number) => {
    setSlides(slides.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    setLoading(true)
    setSuccessMessage(null)
    setErrorMessage(null)

    for (const slide of slides) {
      const formData: { [key: string]: string } = {
        title: slide.title,
        subtitle: slide.subtitle,
        description: slide.description,
        buttonText: slide.buttonText,
        buttonLink: slide.buttonLink,
      }

      if (slide.image) {
        const form = new FormData()
        form.append('image', slide.image)
        form.append('title', slide.title)

        const response = await fetch('/api/upload-image', {
          method: 'POST',
          body: form,
        })

        if (!response.ok) {
          setErrorMessage("❌ Kļūda augšupielādējot attēlu")
          setLoading(false)
          return
        }

        const data = await response.json()
        formData.imageUrl = data.imageUrl
      }

      if (slide.id) {
        formData.id = slide.id
      }

      const response = await fetch("/api/slides", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        setErrorMessage("❌ Kļūda")
        setLoading(false)
        return
      }
    }

    setSuccessMessage("Veiksmīgi izmainīts!")
    setLoading(false)
  }

  useEffect(() => {
    const fetchSlides = async () => {
      const res = await fetch("/api/slides")
      const data = await res.json()
      setSlides(data)
      setLoading(false)
    }

    fetchSlides()
  }, [])

  useEffect(() => {
    if (successMessage || errorMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null)
        setErrorMessage(null)
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [successMessage, errorMessage])

  if (loading) return <p>Loading...</p>

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-10">
      <h2 className="text-2xl font-bold text-[#00332D]">Slaidera iestatījumi</h2>
      {successMessage && (
        <div className="bg-green-500 text-white p-4 rounded-md">
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="bg-red-500 text-white p-4 rounded-md">
          {errorMessage}
        </div>
      )}

      {slides.map((slide, index) => (
        <div key={index} className="border p-6 rounded-xl space-y-4 relative bg-white shadow-sm">
          <button className="absolute top-4 right-4 text-red-600" onClick={() => removeSlide(index)} title="Dzēst">
            <Trash className="w-5 h-5" />
          </button>

          <div className="space-y-2">
            <Label>Virsraksts</Label>
            <Input value={slide.title} onChange={(e) => handleSlideChange(index, "title", e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Apakšvirsraksts</Label>
            <Input value={slide.subtitle} onChange={(e) => handleSlideChange(index, "subtitle", e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Apraksts</Label>
            <Textarea rows={3} value={slide.description} onChange={(e) => handleSlideChange(index, "description", e.target.value)} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Pogas teksts</Label>
              <Input value={slide.buttonText} onChange={(e) => handleSlideChange(index, "buttonText", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Pogas saite</Label>
              <Input value={slide.buttonLink} onChange={(e) => handleSlideChange(index, "buttonLink", e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Attēls</Label>
            <Input type="file" accept="image/*" onChange={(e) => handleSlideChange(index, "image", e.target.files?.[0] || null)} />
          </div>
        </div>
      ))}

      <Button variant="outline" onClick={addSlide}>
        <Plus className="w-4 h-4 mr-1" /> Pievienot slaidu
      </Button>

      <div>
        <Button className="mt-6" onClick={handleSave} disabled={loading}>
          {loading ? "Saglabājas..." : "Saglabāt izmaiņas"}
        </Button>
      </div>
    </div>
  )
}
