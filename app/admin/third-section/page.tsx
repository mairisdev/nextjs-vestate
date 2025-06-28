"use client"

import { useState } from "react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import { Plus, Trash } from "lucide-react"

export default function ThirdSectionSettings() {
  const [heading, setHeading] = useState("Pakalpojumi, ko sniedz mūsu komanda")
  const [subheading, setSubheading] = useState("Pieredzes bagāti nekustamo īpašumu speciālisti")
  const [services, setServices] = useState([
    "Pārstāv jūsu intereses visa pārdošanas procesa gaitā.",
    "Sniedz info par nodokļiem, piemērojamiem likumiem.",
    "Veic profesionālu mārketingu un sludinājumu izvietošanu.",
    "Palīdz pircējiem visos kredīta un pirkuma procesa posmos.",
    "Rūpējas, lai īpašniekam ir pēc iespējas mazāks slogs darījumā.",
    "Konsultē par tirgus situāciju, īpašuma vērtību un pārdošanas nosacījumiem.",
    "Palīdz sagatavot darījuma dokumentus un sakārtot pārvaldības jautājumus.",
    "Komunicē ar interesentiem, saskaņo apskates.",
    "Koordinē darījuma gaitu ar notāriem, īpašniekiem, pircējiem."
  ])

  const handleServiceChange = (index: number, value: string) => {
    const updated = [...services]
    updated[index] = value
    setServices(updated)
  }

  const addService = () => setServices([...services, "Jauns pakalpojums..."])
  const removeService = (index: number) => {
    setServices(services.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-10">
      <h2 className="text-2xl font-bold text-[#00332D]">Trešās sadaļas iestatījumi</h2>

      {/* Zemvirsraksts */}
      <div className="space-y-2">
        <Label>Zemvirsraksts (mazais teksts augšā)</Label>
        <Input
          value={subheading}
          onChange={(e) => setSubheading(e.target.value)}
        />
      </div>

      {/* Virsraksts */}
      <div className="space-y-2">
        <Label>Virsraksts</Label>
        <Textarea
          rows={2}
          value={heading}
          onChange={(e) => setHeading(e.target.value)}
        />
      </div>

      {/* Pakalpojumi */}
      <div className="space-y-2">
        <Label>Pakalpojumu saraksts</Label>
        {services.map((item, index) => (
          <div key={index} className="flex gap-2 items-start">
            <Textarea
              rows={2}
              value={item}
              onChange={(e) => handleServiceChange(index, e.target.value)}
              className="flex-1"
            />
            <Button variant="ghost" size="icon" onClick={() => removeService(index)}>
              <Trash className="text-red-500 w-4 h-4" />
            </Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={addService} className="mt-2">
          <Plus className="w-4 h-4 mr-1" /> Pievienot pakalpojumu
        </Button>
      </div>

      {/* Saglabāt */}
      <div>
        <Button className="mt-4">Saglabāt izmaiņas</Button>
      </div>
    </div>
  )
}
