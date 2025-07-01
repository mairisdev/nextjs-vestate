"use client"

import { useEffect, useState } from "react"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Button } from "../../components/ui/button"
import { Plus, Trash } from "lucide-react"
import AlertMessage from "../../components/ui/alert-message"

export default function WhyChooseUsAdminPage() {
  const [title, setTitle] = useState("")
  const [buttonText, setButtonText] = useState("")
  const [points, setPoints] = useState<string[]>([])
  const [image, setImage] = useState<File | null>(null)
  const [existingImageUrl, setExistingImageUrl] = useState("")
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/why-choose-us")
      const data = await res.json()

      setTitle(data.title || "")
      setButtonText(data.buttonText || "")
      setPoints(Array.isArray(data.points) ? data.points : [])
      setExistingImageUrl(data.imageUrl || "")
    }

    fetchData()
  }, [])

  const updatePoint = (i: number, val: string) => {
    const copy = [...points]
    copy[i] = val
    setPoints(copy)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAlert(null)

    const formData = new FormData()
    formData.append("title", title)
    formData.append("buttonText", buttonText)
    formData.append("points", JSON.stringify(points))
    formData.append("existingImageUrl", existingImageUrl)
    if (image) formData.append("image", image)

    const res = await fetch("/api/why-choose-us", {
      method: "POST",
      body: formData,
    })

    if (res.ok) {
      setAlert({ type: "success", message: "Dati saglabāti veiksmīgi!" })
    } else {
      setAlert({ type: "error", message: "Kļūda saglabājot datus!" })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-8 py-10">
      <h2 className="text-2xl font-bold text-[#00332D]">Kāpēc izvēlēties mūs iestatījumi</h2>

      {alert && (
        <AlertMessage type={alert.type} message={alert.message} />
      )}

      <div className="space-y-2">
        <Label>Virsraksts</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label>Punkti</Label>
        {points.map((point, i) => (
          <div key={i} className="flex gap-2 items-center">
            <Input
              value={point}
              onChange={(e) => updatePoint(i, e.target.value)}
              className="flex-1"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setPoints(points.filter((_, idx) => idx !== i))}
            >
              <Trash className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        ))}
        <Button type="button" onClick={() => setPoints([...points, ""])} variant="outline">
          <Plus className="w-4 h-4 mr-1" /> Pievienot punktu
        </Button>
      </div>

      <div className="space-y-2">
        <Label>Attēls</Label>
        {existingImageUrl && (
          <img
            src={existingImageUrl}
            alt="Esošais attēls"
            className="w-full max-w-sm rounded-md border"
          />
        )}
        <label className="block w-full max-w-sm px-4 py-2 border border-dashed border-gray-300 rounded-lg text-center cursor-pointer bg-gray-50">
          <span>Izvēlieties attēlu no failiem</span>
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files?.[0] || null)}
            className="hidden"
          />
        </label>
      </div>

      <div className="space-y-2">
        <Label>Pogas teksts</Label>
        <Input value={buttonText} onChange={(e) => setButtonText(e.target.value)} />
      </div>

      <Button type="submit" className="mt-4">
        Saglabāt izmaiņas
      </Button>
    </form>
  )
}
