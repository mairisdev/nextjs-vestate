"use client"

import { useState } from "react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import { Plus, Trash } from "lucide-react"

export default function SecondSectionSettings() {
  const [image, setImage] = useState<File | null>(null)
  const [heading, setHeading] = useState("Daži iemesli kāpēc\nvajadzētu izvēlēties mākleri:")
  const [reasons, setReasons] = useState([
    "Cilvēkiem pašiem nav laika vai vēlēšanās iedziļināties procesā un nodarboties ar pārdošanu;",
    "Cilvēkiem nav pieredzes īpašuma pārdošanā, viņi nepārzina nozares tirgu, nevar noteikt optimālo pārdošanas cenu;",
    "Cilvēki baidās, ka viņus apkrāps vai trāpīsies negodprātīgi pircēji, baidās pieļaut būtiskas kļūdas noformēšanas procesā;",
  ])

  const handleReasonChange = (index: number, value: string) => {
    const newList = [...reasons]
    newList[index] = value
    setReasons(newList)
  }

  const addReason = () => setReasons([...reasons, "Jauns iemesls..."])
  const removeReason = (index: number) => {
    setReasons(reasons.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-10">
      <h2 className="text-2xl font-bold text-[#00332D]">Otrās sadaļas iestatījumi</h2>

      {/* Attēls */}
      <div className="space-y-2">
        <Label>Sadaļas attēls</Label>
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
        <p className="text-sm text-muted-foreground">Lieto jaunu rindu (“Enter”), lai sadalītu vairākās rindiņās.</p>
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
        <Button className="mt-4">Saglabāt izmaiņas</Button>
      </div>
    </div>
  )
}
