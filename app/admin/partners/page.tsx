"use client"

import { useEffect, useState } from "react"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Button } from "../../components/ui/button"
import { Plus, Trash } from "lucide-react"
import AlertMessage from "../../components/ui/alert-message"

type Partner = {
  name: string
  order: number
  logo: File | string | null
}

export default function PartnersAdminPage() {
  const [title, setTitle] = useState("")
  const [subtitle, setSubtitle] = useState("")
  const [partners, setPartners] = useState<Partner[]>([])
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null)

  useEffect(() => {
    const loadData = async () => {
      const res = await fetch("/api/partners")
      if (!res.ok) return
      const data = await res.json()

      setTitle(data.title || "")
      setSubtitle(data.subtitle || "")
      setPartners(
        Array.isArray(data.partners)
          ? data.partners.map((p: any) => ({
              name: p.name,
              order: p.order,
              logo: p.logoUrl || null,
            }))
          : []
      )
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
    setAlert(null)

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

    if (res.ok) {
      setAlert({ type: "success", message: "Dati saglabāti veiksmīgi!" })
    } else {
      setAlert({ type: "error", message: "Kļūda saglabājot datus!" })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-6xl mx-auto py-10 space-y-8">
      <h2 className="text-3xl font-bold text-[#00332D]">Sadarbības partneri</h2>

      {alert && <AlertMessage type={alert.type} message={alert.message} />}

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <Label>Virsraksts</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <Label>Apakšvirsraksts</Label>
          <Input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {partners.map((partner, i) => (
          <div
            key={i}
            className="bg-white border border-gray-200 rounded-xl p-6 shadow relative space-y-4"
          >
            <div className="absolute top-4 right-4">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removePartner(i)}
              >
                <Trash className="w-4 h-4 text-red-500" />
              </Button>
            </div>

            <h4 className="text-lg font-semibold text-gray-800">Partneris #{i + 1}</h4>

            <div className="space-y-2">
              <Label>Nosaukums</Label>
              <Input
                value={partner.name}
                onChange={(e) => updatePartner(i, "name", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Kārtošanas secība</Label>
              <Input
                type="number"
                value={partner.order}
                onChange={(e) => updatePartner(i, "order", Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label>Logo attēls</Label>
              {typeof partner.logo === "string" && (
                <img
                  src={partner.logo}
                  alt="logo preview"
                  className="h-16 w-auto object-contain border rounded mx-auto"
                />
              )}
              <label className="block w-full px-4 py-2 border border-dashed border-gray-300 rounded-lg text-center cursor-pointer bg-gray-50 hover:bg-gray-100">
                <span>Izvēlieties attēlu no failiem</span>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => updatePartner(i, "logo", e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-4 items-center">
        <Button type="button" variant="outline" onClick={addPartner}>
          <Plus className="w-4 h-4 mr-2" /> Pievienot partneri
        </Button>

        <Button type="submit">Saglabāt izmaiņas</Button>
      </div>
    </form>
  )
}
