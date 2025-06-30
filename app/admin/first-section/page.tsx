"use client"

import { useEffect, useState } from "react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import AlertMessage from "../../components/ui/alert-message"

export default function FirstSectionSettings() {
  const [backgroundImageFile, setBackgroundImageFile] = useState<File | null>(null)
  const [backgroundImageUrl, setBackgroundImageUrl] = useState<string>("")
  const [headline, setHeadline] = useState<string>("")
  const [buttonText, setButtonText] = useState<string>("")
  const [buttonLink, setButtonLink] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showError, setShowError] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch('/api/first-section')
      const data = await res.json()

      if (data) {
        setHeadline(data.headline || "")
        setButtonText(data.buttonText || "")
        setButtonLink(data.buttonLink || "")
        setBackgroundImageUrl(data.backgroundImage || "")
      }

      setLoading(false)
    }

    fetchData()
  }, [])

  const handleSave = async () => {
    setLoading(true)

    let finalImageUrl = backgroundImageUrl

    if (backgroundImageFile) {
      const form = new FormData()
      form.append("image", backgroundImageFile)
      form.append("title", headline)
      form.append("type", "first-section")

      const response = await fetch("/api/upload-image", {
        method: "POST",
        body: form,
      })

      const data = await response.json()
      finalImageUrl = data.imageUrl
      setBackgroundImageUrl(finalImageUrl)
    }

    const saveRes = await fetch("/api/first-section", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        headline,
        buttonText,
        buttonLink,
        backgroundImage: finalImageUrl,
      }),
    })

    if (saveRes.ok) {
      setShowSuccess(true)
    } else {
      setShowError(true)
    }

    setLoading(false)
  }

  if (loading) return <p>Loading...</p>

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-10">
      <h2 className="text-2xl font-bold text-[#00332D]">Pirmās sadaļas iestatījumi</h2>

      {showSuccess && (
        <AlertMessage type="success" message="Saglabāts veiksmīgi!" onClose={() => setShowSuccess(false)} />
      )}
      {showError && (
        <AlertMessage type="error" message="Saglabāšanas kļūda!" onClose={() => setShowError(false)} />
      )}

      <div className="space-y-2">
        <Label>Virsraksts</Label>
        <Input value={headline} onChange={(e) => setHeadline(e.target.value)} />
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
        <Label>Fona attēls</Label>
        {backgroundImageUrl && (
          <img src={backgroundImageUrl} alt="Esošais attēls" className="w-full max-w-xs rounded-md mb-2" />
        )}
        <Input
          type="file"
          accept="image/*"
          onChange={(e) => setBackgroundImageFile(e.target.files?.[0] || null)}
        />
      </div>

      <Button className="mt-6" onClick={handleSave} disabled={loading}>
        {loading ? "Saglabājas..." : "Saglabāt izmaiņas"}
      </Button>
    </div>
  )
}
