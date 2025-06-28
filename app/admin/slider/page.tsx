"use client"

import { useState } from "react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import { Trash, Plus } from "lucide-react"

type Slide = {
  title: string
  subtitle: string
  description: string
  buttonText: string
  buttonLink: string
  image: File | null
}

export default function SliderSettings() {
  const [slides, setSlides] = useState<Slide[]>([
    {
      title: "Piemērs",
      subtitle: "Apakšvirsraksts",
      description: "Apraksts",
      buttonText: "Uzzināt vairāk",
      buttonLink: "#",
      image: null,
    },
  ])

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

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-10">
      <h2 className="text-2xl font-bold text-[#00332D]">Slaidera iestatījumi</h2>

      {slides.map((slide, index) => (
        <div key={index} className="border p-6 rounded-xl space-y-4 relative bg-white shadow-sm">
          <button
            className="absolute top-4 right-4 text-red-600"
            onClick={() => removeSlide(index)}
            title="Dzēst"
          >
            <Trash className="w-5 h-5" />
          </button>

          <div className="space-y-2">
            <Label>Virsraksts</Label>
            <Input
              value={slide.title}
              onChange={(e) => handleSlideChange(index, "title", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Apakšvirsraksts</Label>
            <Input
              value={slide.subtitle}
              onChange={(e) => handleSlideChange(index, "subtitle", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Apraksts</Label>
            <Textarea
              rows={3}
              value={slide.description}
              onChange={(e) => handleSlideChange(index, "description", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Pogas teksts</Label>
              <Input
                value={slide.buttonText}
                onChange={(e) => handleSlideChange(index, "buttonText", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Pogas saite</Label>
              <Input
                value={slide.buttonLink}
                onChange={(e) => handleSlideChange(index, "buttonLink", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Attēls</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => handleSlideChange(index, "image", e.target.files?.[0] || null)}
            />
          </div>
        </div>
      ))}

      <Button variant="outline" onClick={addSlide}>
        <Plus className="w-4 h-4 mr-1" /> Pievienot slaidu
      </Button>

      <div>
        <Button className="mt-6">Saglabāt izmaiņas</Button>
      </div>
    </div>
  )
}
