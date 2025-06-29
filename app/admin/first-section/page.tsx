"use client"

import { useState, useEffect } from "react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"

export default function FirstSectionSettings() {
  const [backgroundImage, setBackgroundImage] = useState<File | null>(null)
  const [headline, setHeadline] = useState<string>("")
  const [buttonText, setButtonText] = useState<string>("")
  const [buttonLink, setButtonLink] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const fetchFirstSection = async () => {
      const res = await fetch('/api/first-section')
      const data = await res.json()

      if (data) {
        // Pārliecināmies, ka dati ir ielādēti pirms piekļuves
        setHeadline(data.headline || "")
        setButtonText(data.buttonText || "")
        setButtonLink(data.buttonLink || "")
      }

      setLoading(false)
    }

    fetchFirstSection()
  }, [])

  if (loading) return <p>Loading...</p> // Ātri atgriezties, ja dati vēl nav ielādēti

  const handleSave = async () => {
    setLoading(true)
    setSuccessMessage(null)
    setErrorMessage(null)

    const formData: { [key: string]: string } = {
      headline,
      buttonText,
      buttonLink,
    }

    if (backgroundImage) {
      const form = new FormData()
      form.append('image', backgroundImage)
      form.append('title', headline)
      form.append('type', 'first-section')

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
      formData.backgroundImage = data.imageUrl
    }

    const response = await fetch("/api/first-section", {
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

    setSuccessMessage("Veiksmīgi izmainīts!")
    setLoading(false)
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-10">
      <h2 className="text-2xl font-bold text-[#00332D]">Pirmās sadaļas iestatījumi</h2>
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

      <div className="space-y-2">
        <Label>Virsraksts</Label>
        <Input
          value={headline}
          onChange={(e) => setHeadline(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Pogas teksts</Label>
        <Input
          value={buttonText}
          onChange={(e) => setButtonText(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Pogas saite</Label>
        <Input
          value={buttonLink}
          onChange={(e) => setButtonLink(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Fona attēls</Label>
        <Input
          type="file"
          accept="image/*"
          onChange={(e) => setBackgroundImage(e.target.files?.[0] || null)}
        />
      </div>

      <Button className="mt-6" onClick={handleSave} disabled={loading}>
        {loading ? "Saglabājas..." : "Saglabāt izmaiņas"}
      </Button>
    </div>
  )
}
