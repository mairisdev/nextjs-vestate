"use client"

import { useEffect, useState } from "react"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Button } from "../../components/ui/button"
import { Plus, Trash } from "lucide-react"

type Partner = {
  name: string
  order: number
  logo: File | string | null
}

export default function PartnersAdminPage() {
  const [title, setTitle] = useState("")
  const [subtitle, setSubtitle] = useState("")
  const [partners, setPartners] = useState<Partner[]>([])

  // ← Load data on page load
  useEffect(() => {
    const loadData = async () => {
      const res = await fetch("/api/partners")
      if (!res.ok) return

      const data = await res.json()

      setTitle(data.title || "")
      setSubtitle(data.subtitle || "")

      if (Array.isArray(data.partners)) {
        setPartners(data.partners.map((p: any) => ({
          name: p.name,
          order: p.order,
          logo: p.logoUrl || null,
        })))
      }
    }

    loadData()
  }, [])

  const updatePartner = <K extends keyof Partner>(i: number, field: K, value: Partner[K]) => {
    const updated = [...partners]
    updated[i] = { ...updated[i], [field]: value }
    setPartners(updated)
  }

  const addPartner = () => {
    setPartners([...partners, { name: "", order: partners.length + 1, logo: null }])
  }

  const removePartner = (i: number) => {
    setPartners(partners.filter((_, idx) => idx !== i))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const formData = new FormData()
    formData.append("title", title)
    formData.append("subtitle", subtitle)

    partners.forEach((partner, index) => {
      formData.append(`partners[${index}][name]`, partner.name)
      formData.append(`partners[${index}][order]`, partner.order.toString())

      if (partner.logo instanceof File) {
        formData.append(`partners[${index}][logo]`, partner.logo)
      } else if (typeof partner.logo === "string") {
        formData.append(`partners[${index}][logoUrl]`, partner.logo)
      }
    })

    const res = await fetch("/api/partners", {
      method: "POST",
      body: formData,
    })

    if (res.ok) alert("Saglabāts veiksmīgi!")
    else alert("Kļūda saglabājot datus")
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-6 py-10">
      <h2 className="text-2xl font-bold">Sadarbības partneri</h2>

      <div>
        <Label>Virsraksts</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>

      <div>
        <Label>Apakšvirsraksts</Label>
        <Input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
      </div>

      {partners.map((partner, i) => (
        <div key={i} className="border p-4 rounded space-y-2">
          <div className="flex justify-between items-center">
            <Label>Partneris #{i + 1}</Label>
            <Button type="button" variant="ghost" size="icon" onClick={() => removePartner(i)}>
              <Trash className="text-red-500 w-4 h-4" />
            </Button>
          </div>

          <Input
            placeholder="Nosaukums"
            value={partner.name}
            onChange={(e) => updatePartner(i, "name", e.target.value)}
          />

          <Input
            type="number"
            value={partner.order}
            onChange={(e) => updatePartner(i, "order", Number(e.target.value))}
          />

          <Input
            type="file"
            accept="image/*"
            onChange={(e) => updatePartner(i, "logo", e.target.files?.[0] || null)}
          />

          {typeof partner.logo === "string" && (
            <img src={partner.logo} alt="logo preview" className="h-16 object-contain" />
          )}
        </div>
      ))}

      <Button type="button" variant="outline" onClick={addPartner}>
        <Plus className="w-4 h-4 mr-2" /> Pievienot partneri
      </Button>

      <Button type="submit">Saglabāt</Button>
    </form>
  )
}
