"use client"

import { useEffect, useState } from "react"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Button } from "../../components/ui/button"
import { Plus, Trash, Upload } from "lucide-react"
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
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch("/api/partners")
        if (!res.ok) {
          throw new Error("Failed to load partners data")
        }
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
      } catch (error) {
        console.error("Error loading partners data:", error)
        setAlert({ type: "error", message: "Neizdevās ielādēt partneru datus" })
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validējam faila tipu
      if (!file.type.startsWith('image/')) {
        setAlert({ type: "error", message: "Lūdzu, izvēlieties attēla failu" })
        return
      }

      // Validējam faila izmēru (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setAlert({ type: "error", message: "Attēls pārāk liels. Maksimums 5MB." })
        return
      }

      console.log('📁 Partner logo selected:', {
        name: file.name,
        size: file.size,
        type: file.type,
        sizeMB: (file.size / 1024 / 1024).toFixed(2)
      })

      updatePartner(index, "logo", file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAlert(null)
    setIsSubmitting(true)

    try {
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

      console.log('📤 Submitting partners data...', {
        title,
        subtitle,
        partnersCount: partners.length
      })

      const res = await fetch("/api/partners", {
        method: "POST",
        body: formData,
      })

      const responseData = await res.json()

      if (res.ok) {
        setAlert({ type: "success", message: "Partneru dati saglabāti veiksmīgi!" })
        
        // Atjaunojam partner logotipu URL, ja tika augšupielādēti jauni
        if (responseData.partners) {
          setPartners(
            responseData.partners.map((p: any) => ({
              name: p.name,
              order: p.order,
              logo: p.logoUrl || null,
            }))
          )
        }
      } else {
        throw new Error(responseData.error || "Kļūda saglabājot datus")
      }
    } catch (error) {
      console.error("Error submitting partners data:", error)
      const errorMessage = error instanceof Error ? error.message : "Kļūda saglabājot datus"
      setAlert({ type: "error", message: errorMessage })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-6xl mx-auto py-10 space-y-8">
      <h2 className="text-3xl font-bold text-[#00332D]">Sadarbības partneri</h2>

      {alert && <AlertMessage type={alert.type} message={alert.message} />}

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <Label>Virsraksts</Label>
          <Input 
            value={title} 
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ievadiet virsrakstu"
            disabled={isSubmitting}
          />
        </div>
        <div>
          <Label>Apakšvirsraksts</Label>
          <Input 
            value={subtitle} 
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="Ievadiet apakšvirsrakstu"
            disabled={isSubmitting}
          />
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
                disabled={isSubmitting}
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
                placeholder="Partnera nosaukums"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label>Kārtošanas secība</Label>
              <Input
                type="number"
                value={partner.order}
                onChange={(e) => updatePartner(i, "order", Number(e.target.value))}
                min="1"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label>Logo attēls</Label>
              
              {/* Pašreizējā attēla priekšskatījums */}
              {typeof partner.logo === "string" && partner.logo && (
                <div className="flex justify-center">
                  <img
                    src={partner.logo}
                    alt={`${partner.name} logo`}
                    className="h-20 w-auto object-contain border rounded bg-gray-50 p-2"
                  />
                </div>
              )}
              
              {/* Faila augšupielādes poga */}
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-4 text-gray-500" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Noklikšķiniet, lai augšupielādētu</span>
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG vai SVG (MAX. 5MB)</p>
                    {partner.logo instanceof File && (
                      <p className="text-xs text-green-600 mt-2">
                        Izvēlēts: {partner.logo.name}
                      </p>
                    )}
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, i)}
                    disabled={isSubmitting}
                  />
                </label>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center">
        <Button
          type="button"
          onClick={addPartner}
          variant="outline"
          className="flex items-center gap-2"
          disabled={isSubmitting}
        >
          <Plus className="w-4 h-4" />
          Pievienot partneri
        </Button>

        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="min-w-[120px]"
        >
          {isSubmitting ? "Saglabā..." : "Saglabāt"}
        </Button>
      </div>
    </form>
  )
}