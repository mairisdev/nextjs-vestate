"use client"

import { useState } from "react"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Button } from "../../components/ui/button"
import { Plus, Trash } from "lucide-react"

export default function WhyChooseUsAdminPage() {
  const [title, setTitle] = useState("Kāpēc izvēlēties mūs?")
  const [buttonText, setButtonText] = useState("Saņemt piedāvājumu")
  const [points, setPoints] = useState<string[]>([
    "Komanda ar daudzu gadu pieredzi",
    "Sadarbība ar citām aģentūrām",
  ])
  const [image, setImage] = useState<File | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!image) return alert("Lūdzu pievieno attēlu!")

    const formData = new FormData()
    formData.append("title", title)
    formData.append("buttonText", buttonText)
    formData.append("points", JSON.stringify(points))
    formData.append("image", image)

    const res = await fetch("/api/why-choose-us", {
      method: "POST",
      body: formData,
    })

    if (res.ok) alert("Saglabāts veiksmīgi!")
    else alert("Kļūda saglabājot datus")
  }

  const updatePoint = (i: number, val: string) => {
    const copy = [...points]
    copy[i] = val
    setPoints(copy)
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-6 py-10">
      <h2 className="text-2xl font-bold">“Kāpēc izvēlēties mūs” iestatījumi</h2>

      <div>
        <Label>Virsraksts</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>

      <div>
        <Label>Punkti</Label>
        {points.map((point, i) => (
          <div key={i} className="flex gap-2 items-center mt-2">
            <Input value={point} onChange={(e) => updatePoint(i, e.target.value)} />
            <Button variant="ghost" size="icon" onClick={() => setPoints(points.filter((_, idx) => idx !== i))}>
              <Trash className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        ))}
        <Button type="button" onClick={() => setPoints([...points, ""])} variant="outline" className="mt-2">
          <Plus className="w-4 h-4 mr-2" /> Pievienot punktu
        </Button>
      </div>

      <div>
        <Label>Attēls</Label>
        <Input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} />
      </div>

      <div>
        <Label>Pogas teksts</Label>
        <Input value={buttonText} onChange={(e) => setButtonText(e.target.value)} />
      </div>

      <Button type="submit">Saglabāt izmaiņas</Button>
    </form>
  )
}
