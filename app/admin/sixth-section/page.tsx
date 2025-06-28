"use client"

import { useState } from "react"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import { Button } from "../../components/ui/button"

export default function SixthSectionSettings() {
  const [title, setTitle] = useState(
    "Uzziniet, vai pārdodot nekustamo īpašumu nebūs jāmaksā kapitāla pieauguma nodoklis"
  )
  const [buttonText, setButtonText] = useState("Saņemt mūsu jurista bezmaksas konsultāciju")
  const [buttonLink, setButtonLink] = useState("#")
  const [image, setImage] = useState<File | null>(null)

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-10">
      <h2 className="text-2xl font-bold">Sestās sadaļas iestatījumi</h2>

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

      <div className="space-y-2">
        <Label>Pogas saite</Label>
        <Input
          value={buttonLink}
          onChange={(e) => setButtonLink(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Fona attēls (kreisajā pusē)</Label>
        <Input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files?.[0] || null)}
        />
      </div>

      <div>
        <Button className="mt-4">Saglabāt izmaiņas</Button>
      </div>
    </div>
  )
}
