"use client"

import { useState, useEffect } from "react"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Button } from "../../components/ui/button"
import { Plus, Trash } from "lucide-react"
import AlertMessage from "../../components/ui/alert-message"

interface Statistic {
  id?: string
  icon: string
  value: string
  description: string
}

export default function StatisticsAdminPage() {
  const [stats, setStats] = useState<Statistic[]>([])
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null)

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
    setAlert(null)
    const res = await fetch("/api/statistics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(stats),
    })
    const result = await res.json()

    if (result.success) {
      setAlert({ type: "success", message: "Dati saglabāti veiksmīgi!" })
    } else {
      setAlert({ type: "error", message: "Kļūda saglabājot datus!" })
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-10 space-y-6">
      <h2 className="text-2xl font-bold text-[#00332D]">Statistikas vienības</h2>

      {alert && <AlertMessage type={alert.type} message={alert.message} />}

      <div className="text-sm text-gray-600">
        Ikonu nosaukumus vari atrast vietnē{" "}
        <a
          href="https://lucide.dev/icons"
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-blue-600 hover:text-blue-800"
        >
          lucide.dev/icons
        </a>
        .
        <br />
        Lai ievadītu pareizu ikonas nosaukumu:
        <ul className="list-disc pl-5 mt-1 space-y-1">
          <li>Atver <strong>lucide.dev/icons</strong></li>
          <li>Uzspied uz ikonas, kuru vēlies izmantot</li>
          <li>Apakšā atvērsies logs - spied uz ikonas nosaukuma un nokopē to</li>
          <li>Pārliecinies, ka nosaukums sākas ar lielo burtu, piemēram: <code>Clock</code></li>
        </ul>
      </div>


      {stats.map((stat, i) => (
        <div
          key={i}
          className="border p-4 rounded-lg bg-white shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4 relative"
        >
          <div>
            <Label>Ikonas nosaukums</Label>
            <Input
              placeholder="Piem. Clock"
              value={stat.icon}
              onChange={e => updateStat(i, "icon", e.target.value)}
            />
          </div>

          <div>
            <Label>Vērtība</Label>
            <Input
              placeholder="Piem. 84%"
              value={stat.value}
              onChange={e => updateStat(i, "value", e.target.value)}
            />
          </div>

          <div className="md:col-span-2">
            <Label>Apraksts</Label>
            <Input
              placeholder="Apraksts"
              value={stat.description}
              onChange={e => updateStat(i, "description", e.target.value)}
            />
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4"
            onClick={() => removeStat(i)}
          >
            <Trash className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      ))}

      <Button onClick={addStat} variant="outline">
        <Plus className="w-4 h-4 mr-2" /> Pievienot vienību
      </Button>

      <div>
        <Button className="mt-6" onClick={handleSave}>
          Saglabāt izmaiņas
        </Button>
      </div>
    </div>
  )
}
