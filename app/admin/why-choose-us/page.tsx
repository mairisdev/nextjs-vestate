"use client"

import { useState } from "react"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import { Button } from "../../components/ui/button"
import { Plus, Trash } from "lucide-react"

export default function WhyChooseUsSettings() {
  const [title, setTitle] = useState("Kāpēc izvēlēties mūs?")
  const [buttonText, setButtonText] = useState("Saņemt piedāvājumu")
  const [points, setPoints] = useState([
    "Komanda ar daudzu gadu pieredzi",
    "Sadarbība ar citām aģentūrām",
    "Personīga un profesionāla pieeja",
    "Godīga attieksme",
    "Ātrs rezultāts",
    "Nenormēts darba laiks 24/7",
    "Bezmaksas juridiskās konsultācijas"
  ])

  const updatePoint = (index: number, value: string) => {
    const newPoints = [...points]
    newPoints[index] = value
    setPoints(newPoints)
  }

  const addPoint = () => setPoints([...points, ""])
  const removePoint = (index: number) =>
    setPoints(points.filter((_, i) => i !== index))

  return (
    <div className="space-y-6 max-w-3xl mx-auto py-10">
      <h2 className="text-2xl font-bold">“Kāpēc izvēlēties mūs” iestatījumi</h2>

      <div className="space-y-2">
        <Label>Sadaļas virsraksts</Label>
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
              variant="ghost"
              size="icon"
              onClick={() => removePoint(i)}
            >
              <Trash className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={addPoint}>
          <Plus className="w-4 h-4 mr-1" />
          Pievienot punktu
        </Button>
      </div>

      <div className="space-y-2">
        <Label>Pogas teksts</Label>
        <Input value={buttonText} onChange={(e) => setButtonText(e.target.value)} />
      </div>

      <div>
        <Button className="mt-4">Saglabāt izmaiņas</Button>
      </div>
    </div>
  )
}
