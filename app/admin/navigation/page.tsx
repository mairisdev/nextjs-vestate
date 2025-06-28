"use client"

import { useState } from "react"

import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import { Plus, Trash } from "lucide-react"

export default function NavigationSettings() {
  const [logo, setLogo] = useState<File | null>(null)
  const [logoAlt, setLogoAlt] = useState("Vestate logo")
  const [menuItems, setMenuItems] = useState([
    { label: "Kāpēc mēs?", link: "#why-us", isVisible: true },
    { label: "Mūsu komanda", link: "#team", isVisible: true },
    { label: "Mūsu darbi", link: "#projects", isVisible: true },
    { label: "Atsauksmes", link: "#testimonials", isVisible: true },
    { label: "Kontakti", link: "#contact", isVisible: true },
    { label: "Blogs", link: "#blog", isVisible: true },
  ])
  const [securityText, setSecurityText] = useState("DARĪJUMA DROŠĪBAS GARANTIJA")
  const [phone, setPhone] = useState("+371 28446677")

  const handleMenuChange = (index: number, field: string, value: string | boolean) => {
    const newItems = [...menuItems]
    newItems[index] = { ...newItems[index], [field]: value }
    setMenuItems(newItems)
  }

  const addMenuItem = () => {
    setMenuItems([...menuItems, { label: "Jauns", link: "#", isVisible: true }])
  }

  const removeMenuItem = (index: number) => {
    setMenuItems(menuItems.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-10">
      <h2 className="text-2xl font-bold">Navigācijas iestatījumi</h2>

      {/* Logo */}
      <div className="space-y-2">
        <Label>Logo attēls</Label>
        <Input
          type="file"
          accept="image/*"
          onChange={(e) => setLogo(e.target.files?.[0] || null)}
        />
        <Label className="block mt-2">Alt teksts</Label>
        <Input
          value={logoAlt}
          onChange={(e) => setLogoAlt(e.target.value)}
        />
      </div>

      {/* Menu */}
      <div className="space-y-2">
        <Label>Izvēlnes vienības</Label>
        {menuItems.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input
              placeholder="Nosaukums"
              value={item.label}
              onChange={(e) => handleMenuChange(index, "label", e.target.value)}
            />
            <Input
              placeholder="Saite"
              value={item.link}
              onChange={(e) => handleMenuChange(index, "link", e.target.value)}
            />
            <input
              type="checkbox"
              checked={item.isVisible}
              onChange={(e) => handleMenuChange(index, "isVisible", e.target.checked)}
              title="Rādīt"
            />
            <Button variant="ghost" size="icon" onClick={() => removeMenuItem(index)}>
              <Trash className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={addMenuItem} className="mt-2">
          <Plus className="w-4 h-4 mr-1" /> Pievienot vienību
        </Button>
      </div>

      {/* Drošības teksts */}
      <div className="space-y-2">
        <Label>Drošības garantijas teksts</Label>
        <Textarea
          rows={2}
          value={securityText}
          onChange={(e) => setSecurityText(e.target.value)}
        />
      </div>

      {/* Telefons */}
      <div className="space-y-2">
        <Label>Tālruņa numurs</Label>
        <Input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>

      <div>
        <Button className="mt-4">Saglabāt izmaiņas</Button>
      </div>
    </div>
  )
}