"use client"

import { useState } from "react"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Button } from "../../components/ui/button"
import { Plus, Trash } from "lucide-react"

export default function PartnersSettings() {
  const [title, setTitle] = useState("Mūsu galvenie sadarbības partneri")
  const [subtitle, setSubtitle] = useState("Sadarbojamies ar vadošajām Latvijas bankām")
  const [partners, setPartners] = useState<string[]>([
    "/logos/luminor.svg",
    "/logos/seb.svg",
    "/logos/citadele.svg",
    "/logos/swedbank.svg",
    "/logos/grandcredit.svg",
    "/logos/westkredit.svg"
  ])

  const updatePartner = (index: number, value: string) => {
    const updated = [...partners]
    updated[index] = value
    setPartners(updated)
  }

  const addPartner = () => setPartners([...partners, ""])
  const removePartner = (index: number) =>
    setPartners(partners.filter((_, i) => i !== index))

  return (
    <div className="space-y-6 max-w-3xl mx-auto py-10">
      <h2 className="text-2xl font-bold">Partneru sadaļa</h2>

      <div className="space-y-2">
        <Label>Virsraksts</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label>Apakšvirsraksts</Label>
        <Input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label>Partneru logotipu URL saraksts</Label>
        {partners.map((partner, i) => (
          <div key={i} className="flex gap-2 items-center">
            <Input
              placeholder="https://..."
              value={partner}
              onChange={(e) => updatePartner(i, e.target.value)}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removePartner(i)}
            >
              <Trash className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={addPartner}>
          <Plus className="w-4 h-4 mr-1" />
          Pievienot partneri
        </Button>
      </div>

      <div>
        <Button className="mt-4">Saglabāt izmaiņas</Button>
      </div>
    </div>
  )
}
