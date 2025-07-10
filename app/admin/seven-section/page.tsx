"use client"

import { useEffect, useState } from "react"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import { Button } from "../../components/ui/button"
import AlertMessage from "../../components/ui/alert-message"

export default function SevenSectionSettings() {
  const [title, setTitle] = useState("")
  const [buttonText, setButtonText] = useState("")
  const [buttonLink, setButtonLink] = useState("")
  const [image, setImage] = useState<File | null>(null)
  const [existingImageUrl, setExistingImageUrl] = useState("")
  const [showSuccess, setShowSuccess] = useState(false)
  const [showError, setShowError] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/seven-section")
      const data = await res.json()
      setTitle(data.title || "")
      setButtonText(data.buttonText || "")
      setButtonLink(data.buttonLink || "")
      setExistingImageUrl(data.imageUrl || "")
    }

    fetchData()
  }, [])

  const handleSave = async () => {
    const formData = new FormData()
    formData.append("title", title)
    formData.append("buttonText", buttonText)
    formData.append("buttonLink", buttonLink)
    formData.append("existingImageUrl", existingImageUrl)
    if (image) formData.append("image", image)

    const res = await fetch("/api/seven-section", {
      method: "POST",
      body: formData,
    })

    if (res.ok) {
      setShowSuccess(true)
    } else {
      setShowError(true)
    }
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-10">
      <h2 className="text-2xl font-bold text-[#00332D]">Dublētās sadaļas iestatījumi</h2>

      {showSuccess && (
        <AlertMessage
          type="success"
          message="Izmaiņas saglabātas veiksmīgi!"
          onClose={() => setShowSuccess(false)}
        />
      )}
      {showError && (
        <AlertMessage
          type="error"
          message="Radās kļūda saglabājot izmaiņas."
          onClose={() => setShowError(false)}
        />
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>Sadaļas virsraksts</Label>
          <Textarea
            rows={2}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Pogas teksts</Label>
          <Input
            value={buttonText}
            onChange={(e) => setButtonText(e.target.value)}
          />
        </div>
      </div>

      {/* Link */}
      <div className="space-y-2">
        <Label>Pogas saite</Label>
        <Input
          value={buttonLink}
          onChange={(e) => setButtonLink(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Sadaļas attēls</Label>
        {existingImageUrl && (
          <img
            src={existingImageUrl}
            alt="Sadaļas attēls"
            className="w-full max-w-xs rounded-md mb-2"
          />
        )}
        <label
          htmlFor="image-upload"
          className="block w-full max-w-xs px-4 py-2 text-center text-sm font-medium text-[#00332D] bg-white border border-dashed border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition"
        >
          Izvēlieties attēlu no failiem
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files?.[0] || null)}
            className="sr-only"
          />
        </label>
      </div>

      <Button className="mt-4" onClick={handleSave}>
        Saglabāt izmaiņas
      </Button>
    </div>
  )
}
