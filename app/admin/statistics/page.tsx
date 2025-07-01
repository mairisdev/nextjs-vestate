"use client"

import { useState, useEffect } from "react"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Button } from "../../components/ui/button"
import { Plus, Trash } from "lucide-react"

interface Statistic {
  id?: string
  icon: string
  value: string
  description: string
}

export default function StatisticsAdminPage() {
  const [stats, setStats] = useState<Statistic[]>([])

  useEffect(() => {
    fetch("/api/statistics")
      .then(res => res.json())
      .then(data => setStats(data || []))
  }, [])

  const updateStat = (i: number, key: keyof Statistic, value: string) => {
    const updated = [...stats]
    updated[i][key] = value
    setStats(updated)
  }

  const addStat = () => {
    setStats([...stats, { icon: "", value: "", description: "" }])
  }

  const removeStat = (i: number) => {
    setStats(stats.filter((_, idx) => idx !== i))
  }

  const handleSave = async () => {
    const res = await fetch("/api/statistics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(stats),
    })
    const result = await res.json()
    alert(result.success ? "Saglabāts veiksmīgi!" : "Kļūda saglabājot")
  }

  return (
    <div className="max-w-3xl mx-auto py-10 space-y-6">
      <h2 className="text-2xl font-bold">Statistikas vienības</h2>

      {stats.map((stat, i) => (
        <div key={i} className="grid grid-cols-4 gap-2 items-center">
          <Input
            placeholder="Ikona (piem. Clock)"
            value={stat.icon}
            onChange={e => updateStat(i, "icon", e.target.value)}
          />
          <Input
            placeholder="Vērtība (piem. 84%)"
            value={stat.value}
            onChange={e => updateStat(i, "value", e.target.value)}
          />
          <Input
            placeholder="Apraksts"
            value={stat.description}
            onChange={e => updateStat(i, "description", e.target.value)}
          />
          <Button variant="ghost" size="icon" onClick={() => removeStat(i)}>
            <Trash className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      ))}

      <Button onClick={addStat} variant="outline">
        <Plus className="w-4 h-4 mr-1" /> Pievienot vienību
      </Button>

      <Button className="mt-4" onClick={handleSave}>Saglabāt izmaiņas</Button>
    </div>
  )
}
