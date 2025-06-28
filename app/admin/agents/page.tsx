"use client"

import { useState } from "react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Plus, Trash } from "lucide-react"

type Agent = {
  name: string
  title: string
  phone: string
  image: string
}

export default function AgentsSettings() {
  const [agents, setAgents] = useState([
    {
      name: "Vineta Villere",
      title: "Nekustamo īpašumu speciālists",
      phone: "+371 28 446 677",
      image: "", // image file or URL
    },
    {
      name: "Natalja Viļuma",
      title: "Nekustamo īpašumu speciālists",
      phone: "+371 29 820 890",
      image: "",
    },
  ])

    const updateAgent = (
    index: number,
    field: keyof Agent,
    value: string | File
    ) => {
    const updated = [...agents]
    if (field === "image" && value instanceof File) {
        updated[index][field] = value.name
    } else if (typeof value === "string") {
        updated[index][field] = value
    }
    setAgents(updated)
    }

  const addAgent = () => {
    setAgents([...agents, {
      name: "",
      title: "",
      phone: "",
      image: "",
    }])
  }

  const removeAgent = (index: number) => {
    setAgents(agents.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-10">
      <h2 className="text-2xl font-bold text-[#00332D]">Aģentu sadaļas iestatījumi</h2>

      {agents.map((agent, index) => (
        <div key={index} className="border p-6 rounded-xl bg-white space-y-4 shadow-sm relative">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Vārds, Uzvārds</Label>
              <Input
                value={agent.name}
                onChange={(e) => updateAgent(index, "name", e.target.value)}
              />
            </div>
            <div>
              <Label>Amats</Label>
              <Input
                value={agent.title}
                onChange={(e) => updateAgent(index, "title", e.target.value)}
              />
            </div>
            <div>
              <Label>Tālrunis</Label>
              <Input
                value={agent.phone}
                onChange={(e) => updateAgent(index, "phone", e.target.value)}
              />
            </div>
            <div>
              <Label>Attēls</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  updateAgent(index, "image", e.target.files?.[0] || "")
                }
              />
              <p className="text-xs text-gray-500 mt-1">
                {typeof agent.image === "string" ? agent.image : ""}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 text-red-500"
            onClick={() => removeAgent(index)}
          >
            <Trash className="w-4 h-4" />
          </Button>
        </div>
      ))}

      <Button variant="outline" onClick={addAgent}>
        <Plus className="w-4 h-4 mr-1" />
        Pievienot aģentu
      </Button>

      <div>
        <Button className="mt-6">Saglabāt izmaiņas</Button>
      </div>
    </div>
  )
}
