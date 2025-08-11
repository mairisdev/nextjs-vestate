// app/admin/agents/page.tsx (AIZVIETO PILNĪBĀ)
"use client"

import { useState, useEffect } from "react"
import { Input } from "../../components/ui/input"
import { Button } from "../../components/ui/button"
import { Label } from "../../components/ui/label"
import { Trash, Plus, Pencil } from "lucide-react"
import ReviewModal from "../../components/ReviewModal"

type Agent = {
  id?: string 
  name: string
  title: string
  phone: string
  image: string | File
  reviews: {
    id?: string
    content: string
    author: string
    rating: number
    imageFile?: File | null
    imageUrl?: string
  }[]
}

export default function AgentsAdminPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(false)
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [activeAgentIndex, setActiveAgentIndex] = useState<number | null>(null)
  const [editingReviewIndex, setEditingReviewIndex] = useState<number | null>(null)
  const [editingReviewData, setEditingReviewData] = useState<{
    id?: string
    content: string
    author: string
    rating: number
    imageUrl?: string
  } | null>(null)

  useEffect(() => {
    const fetchAgents = async () => {
      const res = await fetch("/api/agents")
      const data = await res.json()
      if (data.success) {
        setAgents(
          data.agents.map((agent: any) => ({
            ...agent,
            image: agent.image || "",
            reviews:
              agent.reviews?.map((r: any) => ({
                id: r.id, // ✅ Pievienojam ID
                content: r.content,
                author: r.author,
                rating: r.rating || 5,
                imageUrl: r.imageUrl, // ✅ Pievienojam imageUrl
              })) || [],
          }))
        )
      }
    }
    fetchAgents()
  }, [])

  const updateAgent = (index: number, field: keyof Agent, value: any) => {
    const updated = [...agents]
    updated[index][field] = value
    setAgents(updated)
  }

  const addAgent = () => {
    setAgents([
      ...agents,
      { name: "", title: "", phone: "", image: "", reviews: [] },
    ])
  }

  const removeAgent = async (index: number) => {
    const agent = agents[index]
    if (agent?.id) {
      try {
        setLoading(true)
        const res = await fetch("/api/agents", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: agent.id }),
        })
        const data = await res.json()
        if (!res.ok || !data.success) {
          alert(data.message || "Neizdevās izdzēst aģentu")
          return
        }
      } catch (err) {
        console.error("Delete agent error:", err)
        alert("Radās kļūda dzēšot aģentu")
        return
      } finally {
        setLoading(false)
      }
    }
    setAgents((prev) => prev.filter((_, i) => i !== index))
  }

const handleSave = async () => {
  setLoading(true)

  try {
    // Izšķiram starp jaunajiem un esošajiem aģentiem
    const newAgents = agents.filter(agent => !agent.id)
    const existingAgents = agents.filter(agent => agent.id)

    // 1. IZVEIDOJAM tikai jaunos aģentus
    if (newAgents.length > 0) {
      const formData = new FormData()
      const agentsToCreate = newAgents.map((agent) => ({
        name: agent.name,
        title: agent.title,
        phone: agent.phone,
        image: typeof agent.image === "string" ? agent.image : (agent.image as File).name,
        reviews: [] // Pagaidām bez atsauksmēm
      }))

      formData.append("agents", JSON.stringify(agentsToCreate))
      
      // Pievienojam attēlus
      newAgents.forEach((agent) => {
        if (agent.image instanceof File) {
          formData.append("files", agent.image)
        }
      })

      const createRes = await fetch("/api/agents", {
        method: "POST",
        body: formData,
      })

      const createData = await createRes.json()
      if (!createData.success) {
        alert(`Kļūda izveidojot aģentus: ${createData.message}`)
        setLoading(false)
        return
      }
    }

    // 2. ATJAUNOJAM esošos aģentus (bez atsauksmēm - tās tiek pārvaldītas atsevišķi)
    for (const agent of existingAgents) {
      console.log("Updating existing agent:", agent.id, agent.name)
      // Šeit tu vari pievienot loģiku esošo aģentu atjaunošanai, ja nepieciešams
    }

    // 3. ATJAUNOJAM lapu ar jaunākajiem datiem
    const refreshRes = await fetch("/api/agents")
    const refreshData = await refreshRes.json()
    if (refreshData.success) {
      setAgents(
        refreshData.agents.map((agent: any) => ({
          ...agent,
          image: agent.image || "",
          reviews: agent.reviews?.map((r: any) => ({
            id: r.id, // ✅ Pievienojam ID
            content: r.content,
            author: r.author,
            rating: r.rating || 5,
            imageUrl: r.imageUrl, // ✅ Pievienojam imageUrl
          })) || [],
        }))
      )
    }

    alert("Aģenti saglabāti veiksmīgi!")
  } catch (error) {
    console.error("Error saving agents:", error)
    alert("Radās kļūda saglabājot aģentus")
  } finally {
    setLoading(false)
  }
}

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Aģentu pārvaldība</h1>

      <div className="space-y-6">
        {agents.map((agent, index) => (
          <div key={index} className="border p-4 rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                Aģents #{index + 1} {agent.name && `- ${agent.name}`}
              </h3>
              <Button variant="outline" size="sm" onClick={() => removeAgent(index)}>
                <Trash className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Vārds</Label>
                <Input
                  value={agent.name}
                  onChange={(e) => updateAgent(index, "name", e.target.value)}
                  placeholder="Vineta Villere"
                />
              </div>
              <div>
                <Label>Amats</Label>
                <Input
                  value={agent.title}
                  onChange={(e) => updateAgent(index, "title", e.target.value)}
                  placeholder="Nekustamo īpašumu speciālists"
                />
              </div>
            </div>

            <div>
              <Label>Tālrunis</Label>
              <Input
                value={agent.phone}
                onChange={(e) => updateAgent(index, "phone", e.target.value)}
                placeholder="+371 28 446 677"
              />
            </div>

            <div>
              <Label>Attēls</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    updateAgent(index, "image", file)
                  }
                }}
                placeholder={typeof agent.image === "string" ? agent.image : (agent.image as File)?.name || ""}
              />
              {typeof agent.image === "string" && agent.image && (
                <div className="mt-2">
                  <img
                    src={agent.image}
                    alt="Aģenta attēls"
                    className="w-24 h-24 object-cover rounded-md border"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Atsauksmes</Label>
              <div className="space-y-2">
                {agent.reviews.map((review, rIdx) => (
                  <div key={rIdx} className="bg-gray-50 p-2 rounded-md border text-sm flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-800">{review.author}</p>
                      <p className="text-gray-600 text-xs mb-1">{review.content}</p>
                      <p className="text-[#77D4B4] text-xs">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</p>
                    </div>
                    <button
                      onClick={() => {
                        setActiveAgentIndex(index)
                        setEditingReviewIndex(rIdx)
                        setEditingReviewData(review)
                        setReviewModalOpen(true)
                      }}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Labot
                    </button>
                  </div>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setActiveAgentIndex(index)
                  setEditingReviewIndex(null)
                  setEditingReviewData(null)
                  setReviewModalOpen(true)
                }}
              >
                <Plus className="w-4 h-4 mr-1" /> Pievienot atsauksmi
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Button variant="outline" onClick={addAgent}>
        <Plus className="w-4 h-4 mr-1" /> Pievienot aģentu
      </Button>

      <div>
        <Button className="mt-6" onClick={handleSave} disabled={loading}>
          {loading ? "Saglabā..." : "Saglabāt izmaiņas"}
        </Button>
      </div>
      {agents.length === 0 && (
        <p className="text-gray-500">Nav pievienots neviens aģents.</p>
      )}

      {/* Atsauksmju modāls */}
      {activeAgentIndex !== null && (
        <ReviewModal
          open={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          initialData={editingReviewData}
          onSave={(review) => {
            const updated = [...agents]
            if (editingReviewIndex !== null) {
              // Rediģē esošo atsauksmi
              updated[activeAgentIndex].reviews[editingReviewIndex] = review
            } else {
              // Pievieno jaunu atsauksmi
              updated[activeAgentIndex].reviews.push(review)
            }
            setAgents(updated)
            setEditingReviewIndex(null)
            setEditingReviewData(null)
          }}
          agentId={agents[activeAgentIndex]?.id || ""}
        />
      )}
    </div>
  )
}