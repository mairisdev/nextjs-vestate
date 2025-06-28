"use client"

import { useState } from "react"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Button } from "../../components/ui/button"
import { Plus, Trash } from "lucide-react"

interface StatItem {
  value: string
  description: string
}

export default function StatisticsSettings() {
  const [title, setTitle] = useState("Mūsu pārdošanas prakse")
  const [subtitle, setSubtitle] = useState("Pieredzes bagāti nekustamo īpašumu speciālisti")
  const [stats, setStats] = useState<StatItem[]>([
    { value: "84%", description: "īpašumu pārdodam 28 dienu laikā" },
    { value: "88%", description: "noturam īpašuma nolīgto cenu" },
    { value: "12%", description: "gadījumu pārdodam īpašumu par augstāku cenu" }
  ])

  const updateStat = (index: number, field: keyof StatItem, value: string) => {
    const updated = [...stats]
    updated[index][field] = value
    setStats(updated)
  }

  const addStat = () => setStats([...stats, { value: "", description: "" }])
  const removeStat = (index: number) => setStats(stats.filter((_, i) => i !== index))

  return (
    <div className="space-y-6 max-w-3xl mx-auto py-10">
      <h2 className="text-2xl font-bold">Statistikas sadaļa</h2>

      <div className="space-y-2">
        <Label>Virsraksts</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label>Apakšvirsraksts</Label>
        <Input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label>Statistikas vienības</Label>
        {stats.map((stat, i) => (
          <div key={i} className="grid grid-cols-3 gap-2 items-center">
            <Input
              placeholder="Procenti"
              value={stat.value}
              onChange={(e) => updateStat(i, "value", e.target.value)}
            />
            <Input
              placeholder="Apraksts"
              value={stat.description}
              onChange={(e) => updateStat(i, "description", e.target.value)}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeStat(i)}
            >
              <Trash className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={addStat}>
          <Plus className="w-4 h-4 mr-1" />
          Pievienot vienību
        </Button>
      </div>

      <div>
        <Button className="mt-4">Saglabāt izmaiņas</Button>
      </div>
    </div>
  )
}
