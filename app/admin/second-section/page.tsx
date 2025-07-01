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

    <div className="grid md:grid-cols-2 gap-6 items-start">
      <div className="space-y-2">
        <Label>Sadaļas attēls</Label>
        {imageUrl && (
          <img
            src={imageUrl}
            alt="Izvēlētais attēls"
            className="w-full max-w-sm rounded-md mb-2 object-cover shadow"
          />
        )}
      <label className="block w-full">
        <div className="mt-2 border border-dashed border-gray-300 bg-white hover:border-[#77D4B4] transition-colors rounded-md cursor-pointer text-center py-3 w-full max-w-sm">
          <span className="text-sm font-medium text-[#00332D]">
            {image?.name || "Izvēlieties attēlu no failiem"}
          </span>
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files?.[0] || null)}
            className="hidden"
          />
        </div>
      </label>
      </div>

      <div className="space-y-2">
        <Label>Sadaļas virsraksts</Label>
        <Textarea
          rows={3}
          value={heading}
          onChange={(e) => setHeading(e.target.value)}
          className="text-sm"
        />
        <p className="text-sm text-muted-foreground">
          Lieto jaunu rindu (“Enter”), lai sadalītu vairākās rindiņās.
        </p>
      </div>
    </div>

    <div className="space-y-2">
      <Label className="block mb-1">Iemesli</Label>

      <div className="grid md:grid-cols-2 gap-4">
        {reasons.map((reason, index) => (
          <div
            key={index}
            className="relative bg-white border border-gray-200 rounded-lg shadow-sm p-4"
          >
            <div className="absolute top-2 right-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeReason(index)}
                className="text-red-500 hover:text-red-600"
              >
                <Trash className="w-4 h-4" />
              </Button>
            </div>

            <p className="text-sm font-semibold text-gray-600 mb-2">Iemesls {index + 1}</p>
            <Textarea
              rows={2}
              value={reason}
              onChange={(e) => handleReasonChange(index, e.target.value)}
              className="text-sm"
            />
          </div>
        ))}
      </div>

      <div className="pt-4">
        <Button variant="outline" size="sm" onClick={addReason}>
          <Plus className="w-4 h-4 mr-2" />
          Pievienot iemeslu
        </Button>
      </div>
    </div>

      <div>
        <Button className="mt-4" onClick={handleSave}>Saglabāt izmaiņas</Button>
      </div>
    </div>
  )
}
