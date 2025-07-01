"use client"

import { useState, useEffect } from "react"
import { Input } from "../../components/ui/input"
import { Button } from "../../components/ui/button"
import { Label } from "../../components/ui/label"
import { Trash, Plus, Pencil } from "lucide-react"
import ReviewModal from "../../components/ReviewModal"

// === Types ===
type Agent = {
  name: string
  title: string
  phone: string
  image: string | File
  reviews: { content: string; author: string; rating: number }[]
}

export default function AgentsAdminPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(false)
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [activeAgentIndex, setActiveAgentIndex] = useState<number | null>(null)
  const [editingReviewIndex, setEditingReviewIndex] = useState<number | null>(null)
  const [editingReviewData, setEditingReviewData] = useState<{
    content: string
    author: string
    rating: number
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
                content: r.content,
                author: r.author,
                rating: r.rating || 5,
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

  const removeAgent = (index: number) => {
    setAgents(agents.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    setLoading(true)

    const formData = new FormData()
    const agentsToSend = agents.map((agent) => ({
      ...agent,
      image:
        typeof agent.image === "string"
          ? agent.image
          : (agent.image as File).name,
    }))

    formData.append("agents", JSON.stringify(agentsToSend))
    agents.forEach((agent) => {
      if (agent.image instanceof File) {
        formData.append("files", agent.image)
      }
    })

    const res = await fetch("/api/agents", {
      method: "POST",
      body: formData,
    })

    const data = await res.json()
    alert(data.success ? "Saglabāts veiksmīgi!" : `Kļūda: ${data.message}`)
    setLoading(false)
  }

  return (
    <div className="max-w-6xl mx-auto py-10 space-y-6">
      <h2 className="text-2xl font-bold text-[#00332D] mb-6">Aģentu iestatījumi</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {agents.map((agent, index) => (
          <div
            key={index}
            className="bg-white shadow-md rounded-xl p-6 space-y-4 relative border"
          >
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 text-red-600"
              onClick={() => removeAgent(index)}
            >
              <Trash className="w-4 h-4" />
            </Button>

            <div className="space-y-2">
              <Label>Vārds</Label>
              <Input
                value={agent.name}
                onChange={(e) => updateAgent(index, "name", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Amats</Label>
              <Input
                value={agent.title}
                onChange={(e) => updateAgent(index, "title", e.target.value)}
              />
            </div>

            <div className="space-y-2">
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
                onChange={e => updateAgent(index, "image", e.target.files?.[0] || "")}
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

      {activeAgentIndex !== null && (
        <ReviewModal
          open={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          initialData={editingReviewData}
          onSave={(review) => {
            const updated = [...agents]
            if (editingReviewIndex !== null) {
              updated[activeAgentIndex].reviews[editingReviewIndex] = review
            } else {
              updated[activeAgentIndex].reviews.push(review)
            }
            setAgents(updated)
            setEditingReviewIndex(null)
            setEditingReviewData(null)
          }}
        />
      )}
    </div>
  )
}
