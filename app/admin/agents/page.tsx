"use client"

import { useState } from "react"
import { Input } from "../../components/ui/input"
import { Button } from "../../components/ui/button"
import { Label } from "../../components/ui/label"
import { Trash, Plus } from "lucide-react"

type Agent = {
  name: string
  title: string
  phone: string
  image: string | File
  reviews: string[]
}

export default function AgentsAdminPage() {
  const [agents, setAgents] = useState<Agent[]>([
    {
      name: "",
      title: "",
      phone: "",
      image: "",
      reviews: [],
    }
  ])

  const updateAgent = (index: number, field: keyof Agent, value: any) => {
    const updated = [...agents]
    updated[index][field] = value
    setAgents(updated)
  }

  const addAgent = () => {
    setAgents([...agents, {
      name: "", title: "", phone: "", image: "", reviews: []
    }])
  }

  const removeAgent = (index: number) => {
    setAgents(agents.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    const formData = new FormData()
    const agentsToSend = agents.map(agent => ({
      ...agent,
      image: typeof agent.image === "string" ? agent.image : (agent.image as File).name
    }))

    formData.append("agents", JSON.stringify(agentsToSend))

    agents.forEach(agent => {
      if (agent.image instanceof File) {
        formData.append("files", agent.image)
      }
    })

    const res = await fetch("/api/agents", {
      method: "POST",
      body: formData
    })

    const data = await res.json()
    alert(data.success ? "Saglabāts veiksmīgi!" : `Kļūda: ${data.message}`)
  }

  return (
    <div className="max-w-4xl mx-auto py-10 space-y-6">
      <h2 className="text-2xl font-bold text-[#00332D]">Aģentu iestatījumi</h2>

      {agents.map((agent, index) => (
        <div key={index} className="p-4 border rounded-md space-y-4 relative">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Vārds</Label>
              <Input value={agent.name} onChange={e => updateAgent(index, "name", e.target.value)} />
            </div>
            <div>
              <Label>Amats</Label>
              <Input value={agent.title} onChange={e => updateAgent(index, "title", e.target.value)} />
            </div>
            <div>
              <Label>Tālrunis</Label>
              <Input value={agent.phone} onChange={e => updateAgent(index, "phone", e.target.value)} />
            </div>
            <div>
              <Label>Attēls</Label>
              <Input type="file" accept="image/*" onChange={e => updateAgent(index, "image", e.target.files?.[0] || "")} />
              {typeof agent.image === "string" && (
                <p className="text-sm text-gray-500 mt-1">{agent.image}</p>
              )}
            </div>
          </div>

          <div>
            <Label>Atsauksmes</Label>
            {agent.reviews.map((review, rIdx) => (
              <Input
                key={rIdx}
                value={review}
                className="my-1"
                onChange={e => {
                  const updated = [...agent.reviews]
                  updated[rIdx] = e.target.value
                  updateAgent(index, "reviews", updated)
                }}
              />
            ))}
            <Button variant="outline" size="sm" onClick={() => updateAgent(index, "reviews", [...agent.reviews, ""])}>
              <Plus className="w-4 h-4 mr-1" /> Pievienot atsauksmi
            </Button>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 text-red-600"
            onClick={() => removeAgent(index)}
          >
            <Trash className="w-4 h-4" />
          </Button>
        </div>
      ))}

      <Button variant="outline" onClick={addAgent}>
        <Plus className="w-4 h-4 mr-1" /> Pievienot aģentu
      </Button>

      <div>
        <Button className="mt-6" onClick={handleSave}>
          Saglabāt izmaiņas
        </Button>
      </div>
    </div>
  )
}
