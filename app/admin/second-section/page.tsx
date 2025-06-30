"use client"

import { useEffect, useState } from "react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import { Plus, Trash } from "lucide-react"
import AlertMessage from "../../components/ui/alert-message"

export default function SecondSectionSettings() {
  const [image, setImage] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState<string>("")
  const [heading, setHeading] = useState("")
  const [reasons, setReasons] = useState<string[]>([])
  const [showSuccess, setShowSuccess] = useState(false)
  const [showError, setShowError] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/second-section")
      if (!res.ok) return

      const data = await res.json()
      if (data) {
        setHeading(data.heading || "")
        setImageUrl(data.imageUrl || "")
        setReasons(Array.isArray(data.reasons) ? data.reasons : [])
      }
    }

    fetchData()
  }, [])

  const handleReasonChange = (index: number, value: string) => {
    const updated = [...reasons]
    updated[index] = value
    setReasons(updated)
  }

  const addReason = () => setReasons([...reasons, ""])
  const removeReason = (index: number) => setReasons(reasons.filter((_, i) => i !== index))

  const handleSave = async () => {

    let finalImageUrl = imageUrl

    if (image) {
      const form = new FormData()
      form.append("image", image)
      form.append("title", heading)
      form.append("type", "second-section")

      const res = await fetch("/api/upload-image", {
        method: "POST",
        body: form,
      })

      const data = await res.json()
      finalImageUrl = data.imageUrl
      setImageUrl(finalImageUrl)
    }

    const saveRes = await fetch("/api/second-section", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        heading,
        imageUrl: finalImageUrl,
        reasons,
      }),
    })

    if (saveRes.ok) {
      setShowSuccess(true)
    } else {
      setShowError(true)
    }

  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-10">
      <h2 className="text-2xl font-bold text-[#00332D]">Otrās sadaļas iestatījumi</h2>

    {showSuccess && (
      <AlertMessage type="success" message="Saglabāts veiksmīgi!" onClose={() => setShowSuccess(false)} />
    )}
    {showError && (
      <AlertMessage type="error" message="Saglabāšanas kļūda!" onClose={() => setShowError(false)} />
    )}

      {/* Attēls */}
      <div className="space-y-2">
        <Label>Sadaļas attēls</Label>
        {imageUrl && (
          <img src={imageUrl} alt="Izvēlētais attēls" className="w-full max-w-xs rounded-md mb-2" />
        )}
        <Input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files?.[0] || null)}
        />
      </div>

      {/* Virsraksts */}
      <div className="space-y-2">
        <Label>Sadaļas virsraksts</Label>
        <Textarea
          rows={2}
          value={heading}
          onChange={(e) => setHeading(e.target.value)}
        />
        <p className="text-sm text-muted-foreground">
          Lieto jaunu rindu (“Enter”), lai sadalītu vairākās rindiņās.
        </p>
      </div>

      {/* Iemeslu saraksts */}
      <div className="space-y-2">
        <Label>Iemesli</Label>
        {reasons.map((reason, index) => (
          <div key={index} className="flex gap-2 items-start">
            <Textarea
              rows={2}
              value={reason}
              className="flex-1"
              onChange={(e) => handleReasonChange(index, e.target.value)}
            />
            <Button variant="ghost" size="icon" onClick={() => removeReason(index)}>
              <Trash className="text-red-500 w-4 h-4" />
            </Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={addReason} className="mt-2">
          <Plus className="w-4 h-4 mr-1" /> Pievienot iemeslu
        </Button>
      </div>

      {/* Saglabāt */}
      <div>
        <Button className="mt-4" onClick={handleSave}>Saglabāt izmaiņas</Button>
      </div>
    </div>
  )
}
