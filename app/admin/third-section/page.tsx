"use client"

import { useEffect, useState } from "react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import { Plus, Trash } from "lucide-react"
import AlertMessage from "../../components/ui/alert-message"

export default function ThirdSectionSettings() {
  const [heading, setHeading] = useState("")
  const [subheading, setSubheading] = useState("")
  const [services, setServices] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showError, setShowError] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/third-section")
      const data = await res.json()
      if (data) {
        setHeading(data.heading || "")
        setSubheading(data.subheading || "")
        setServices(data.services || [])
      }
      setLoading(false)
    }

    fetchData()
  }, [])

  const handleServiceChange = (index: number, value: string) => {
    const updated = [...services]
    updated[index] = value
    setServices(updated)
  }

  const addService = () => setServices([...services, ""])
  const removeService = (index: number) =>
    setServices(services.filter((_, i) => i !== index))

  const handleSave = async () => {
    setLoading(true)

    const payload = {
      heading,
      subheading,
      services,
    }

    const res = await fetch("/api/third-section", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    if (res.ok) {
      setShowSuccess(true)
    } else {
      setShowError(true)
    }

    setLoading(false)
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-10">
      <h2 className="text-2xl font-bold text-[#00332D]">Trešās sadaļas iestatījumi</h2>

      {showSuccess && (
        <AlertMessage
          type="success"
          message="Izmaiņas saglabātas veiksmīgi!"
          onClose={() => setShowSuccess(false)}
        />
      )}
      {showError && (
        <AlertMessage
          type="error"
          message="Radās kļūda saglabājot izmaiņas."
          onClose={() => setShowError(false)}
        />
      )}

      {/* Subheading & Heading side-by-side */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>Zemvirsraksts</Label>
          <Input
            value={subheading}
            onChange={(e) => setSubheading(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Virsraksts</Label>
          <Textarea
            rows={2}
            value={heading}
            onChange={(e) => setHeading(e.target.value)}
          />
        </div>
      </div>

      {/* Services in grid */}
      <div className="space-y-2">
        <Label>Pakalpojumu saraksts</Label>
        <div className="grid md:grid-cols-2 gap-4">
          {services.map((item, index) => (
            <div key={index} className="flex gap-2 items-start">
              <Textarea
                rows={2}
                value={item}
                onChange={(e) => handleServiceChange(index, e.target.value)}
                className="flex-1"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeService(index)}
                title="Dzēst"
              >
                <Trash className="text-red-500 w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={addService}
          className="mt-2"
        >
          <Plus className="w-4 h-4 mr-1" /> Pievienot pakalpojumu
        </Button>
      </div>

      <Button className="mt-6" onClick={handleSave} disabled={loading}>
        {loading ? "Saglabājas..." : "Saglabāt izmaiņas"}
      </Button>
    </div>
  )
}
