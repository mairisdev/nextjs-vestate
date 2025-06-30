"use client"

import { useEffect, useState } from "react"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import { Button } from "../../components/ui/button"

export default function SixthSectionSettings() {
  const [title, setTitle] = useState("")
  const [buttonText, setButtonText] = useState("")
  const [buttonLink, setButtonLink] = useState("")
  const [image, setImage] = useState<File | null>(null)
  const [existingImageUrl, setExistingImageUrl] = useState("")
  const [status, setStatus] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/sixth-section")
      const data = await res.json()
      setTitle(data.title || "")
      setButtonText(data.buttonText || "")
      setButtonLink(data.buttonLink || "")
      setExistingImageUrl(data.imageUrl || "")
    }

    fetchData()
  }, [])

  const handleSave = async () => {
    setStatus("Saglabājas...")

    const formData = new FormData()
    formData.append("title", title)
    formData.append("buttonText", buttonText)
    formData.append("buttonLink", buttonLink)
    formData.append("existingImageUrl", existingImageUrl)
    if (image) formData.append("image", image)

    const res = await fetch("/api/sixth-section", {
      method: "POST",
      body: formData,
    })

    if (res.ok) {
      setStatus("Saglabāts veiksmīgi ✅")
    } else {
      setStatus("Kļūda saglabājot ❌")
    }
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-10">
      <h2 className="text-2xl font-bold">Sestās sadaļas iestatījumi</h2>

      <div className="space-y-2">
        <Label>Sadaļas virsraksts</Label>
        <Textarea rows={2} value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label>Pogas teksts</Label>
        <Input value={buttonText} onChange={(e) => setButtonText(e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label>Pogas saite</Label>
        <Input value={buttonLink} onChange={(e) => setButtonLink(e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label>Fona attēls (kreisajā pusē)</Label>
        <Input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} />
        {existingImageUrl && (
          <img src={existingImageUrl} alt="Preview" className="w-full max-w-sm rounded-md mt-2" />
        )}
      </div>

      <Button className="mt-4" onClick={handleSave}>Saglabāt izmaiņas</Button>
      {status && <p className="mt-2 text-sm">{status}</p>}
    </div>
  )
}
