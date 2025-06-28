"use client"

import { useState } from "react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"

export default function FirstSectionSettings() {
  const [backgroundImage, setBackgroundImage] = useState<File | null>(null)
  const [headline, setHeadline] = useState("UZZINIET, CIK MAKSĀ JŪSU ĪPAŠUMS\nUN CIK ILGĀ LAIKĀ TO VAR PĀRDOT")
  const [buttonText, setButtonText] = useState("SAŅEMT MŪSU SPECIĀLISTA BEZMAKSAS KONSULTĀCIJU")
  const [buttonLink, setButtonLink] = useState("#contact")

  return (
    <div className="space-y-8 max-w-3xl mx-auto py-10">
      <h2 className="text-2xl font-bold text-[#00332D]">Pirmās sadaļas iestatījumi</h2>

      <div className="space-y-2">
        <Label>Fona attēls</Label>
        <Input
          type="file"
          accept="image/*"
          onChange={(e) => setBackgroundImage(e.target.files?.[0] || null)}
        />
      </div>

      <div className="space-y-2">
        <Label>Virsraksts</Label>
        <Textarea
          rows={3}
          value={headline}
          onChange={(e) => setHeadline(e.target.value)}
          placeholder="UZZINIET, CIK MAKSĀ JŪSU ĪPAŠUMS\nUN CIK ILGĀ LAIKĀ TO VAR PĀRDOT"
        />
        <p className="text-sm text-muted-foreground">Lieto "\n" vai Enter, lai sadalītu virsrakstu vairākās rindās.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      </div>

      <div>
        <Button className="mt-4">Saglabāt izmaiņas</Button>
      </div>
    </div>
  )
}
