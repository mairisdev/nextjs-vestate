"use client"

import { useEffect, useState } from "react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import { Plus, Trash } from "lucide-react"

export default function NavigationSettings() {
  const [id, setId] = useState("")
  const [logoAlt, setLogoAlt] = useState("")
  const [phone, setPhone] = useState("")
  const [securityText, setSecurityText] = useState("")
  const [menuItems, setMenuItems] = useState<any[]>([])
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/navigation-settings")
      .then((res) => res.json())
      .then((data) => {
        setId(data.id)
        setLogoAlt(data.logoAlt)
        setPhone(data.phone)
        setSecurityText(data.securityText)
        setMenuItems(data.menuItems || [])
      })
  }, [])

  const handleChange = (i: number, key: string, val: string | boolean) => {
    const copy = [...menuItems]
    copy[i][key] = val
    setMenuItems(copy)
  }

  const addItem = () => setMenuItems([...menuItems, { label: "", link: "#", isVisible: true }])
  const removeItem = (i: number) => setMenuItems(menuItems.filter((_, idx) => idx !== i))

  const handleSave = async () => {
    setSuccessMessage(null)
    setErrorMessage(null)

    const res = await fetch("/api/navigation-settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, logoAlt, phone, securityText, menuItems }),
    })

    if (res.ok) {
      setSuccessMessage("Veiksmīgi izmainīts!")
    } else {
      setErrorMessage("❌ Kļūda")
    }
  }

  // Izvēles paziņojuma noņemšana pēc 3 sekundēm
  useEffect(() => {
    if (successMessage || errorMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null)
        setErrorMessage(null)
      }, 3000)

      return () => clearTimeout(timer) // Iztīrīt taimeri, kad komponente tiek noņemta vai paziņojums mainās
    }
  }, [successMessage, errorMessage])

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-10">
      <h2 className="text-2xl font-bold">Navigācijas iestatījumi</h2>

      {/* Paziņojums */}
      {successMessage && (
        <div className="bg-green-500 text-white p-4 rounded-md">
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="bg-red-500 text-white p-4 rounded-md">
          {errorMessage}
        </div>
      )}

      <div>
        <Label>Logo Alt teksts</Label>
        <Input value={logoAlt} onChange={(e) => setLogoAlt(e.target.value)} />
      </div>

      <div>
        <Label>Drošības teksts</Label>
        <Textarea value={securityText} onChange={(e) => setSecurityText(e.target.value)} />
      </div>

      <div>
        <Label>Tālrunis</Label>
        <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>

      <div>
        <Label>Izvēlnes vienības</Label>
        <div className="space-y-3">
          {menuItems.map((item, i) => (
            <div key={i} className="flex gap-2 items-center">
              <Input
                value={item.label}
                onChange={(e) => handleChange(i, "label", e.target.value)}
                placeholder="Nosaukums"
              />
              <Input
                value={item.link}
                onChange={(e) => handleChange(i, "link", e.target.value)}
                placeholder="Saite"
              />
              <input
                type="checkbox"
                checked={item.isVisible}
                onChange={(e) => handleChange(i, "isVisible", e.target.checked)}
              />
              <Button variant="ghost" size="icon" onClick={() => removeItem(i)}>
                <Trash className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          ))}
          <Button onClick={addItem} variant="outline" size="sm" className="mt-2">
            <Plus className="w-4 h-4 mr-1" /> Pievienot vienību
          </Button>
        </div>
      </div>

      <Button onClick={handleSave}>Saglabāt izmaiņas</Button>
    </div>
  )
}
