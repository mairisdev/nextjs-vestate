"use client"

import { useEffect, useState } from "react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import { Plus, Trash } from "lucide-react"
import AlertMessage from "../../components/ui/alert-message"

export default function NavigationSettings() {
  const [id, setId] = useState("")
  const [logoAlt, setLogoAlt] = useState("")
  const [logoUrl, setLogoUrl] = useState("")
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [phone, setPhone] = useState("")
  const [securityText, setSecurityText] = useState("")
  const [menuItems, setMenuItems] = useState<any[]>([])
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/navigation-settings")
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setId(data.id || "")
          setLogoAlt(data.logoAlt || "")
          setLogoUrl(data.logoUrl || "")
          setPhone(data.phone || "")
          setSecurityText(data.securityText || "")
          setMenuItems(data.menuItems || [])
        }
      })
      .catch((err) => {
        console.error("Kļūda ielādējot navigācijas datus:", err)
        setErrorMessage("Neizdevās ielādēt navigācijas iestatījumus.")
      })
  }, [])

  const handleChange = (i: number, key: string, val: string | boolean) => {
    const copy = [...menuItems]
    copy[i][key] = val
    setMenuItems(copy)
  }

  const addItem = () =>
    setMenuItems([...menuItems, { label: "", link: "#", isVisible: true }])

  const removeItem = (i: number) =>
    setMenuItems(menuItems.filter((_, idx) => idx !== i))

  const handleSave = async () => {
    setSuccessMessage(null)
    setErrorMessage(null)

    const formData = new FormData()
    formData.append("id", id)
    formData.append("logoAlt", logoAlt)
    formData.append("phone", phone)
    formData.append("securityText", securityText)
    formData.append("menuItems", JSON.stringify(menuItems))
    formData.append("existingLogoUrl", logoUrl || "")
    if (logoFile) {
      formData.append("logo", logoFile)
    }

    const res = await fetch("/api/navigation-settings", {
      method: "POST",
      body: formData,
    })

    if (res.ok) {
      setSuccessMessage("Veiksmīgi saglabāts!")
    } else {
      setErrorMessage("❌ Kļūda saglabājot datus")
    }
  }

  useEffect(() => {
    if (successMessage || errorMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null)
        setErrorMessage(null)
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [successMessage, errorMessage])

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-10">
      <h2 className="text-2xl font-bold">Navigācijas iestatījumi</h2>

      {successMessage && <AlertMessage type="success" message={successMessage} />}
      {errorMessage && <AlertMessage type="error" message={errorMessage} />}

      <div className="space-y-4">
        <div>
          <Label>Esošais logo</Label>
            {logoUrl ? (
              <img
                src={`/uploads/navigation/${logoUrl}`}
                alt="Logo"
                className="w-auto h-20"
              />
            ) : (
              <p className="text-gray-500 italic">Nav augšupielādēts</p>
            )}
        </div>

        <div>
          <Label>Augšupielādēt jaunu logo</Label>
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                setLogoFile(e.target.files[0])
              }
            }}
          />
        </div>

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
      </div>

      <div>
        <Label className="block mb-2 font-semibold">Izvēlnes vienības</Label>
        <div className="overflow-x-auto border rounded-md">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr className="border-b">
                <th className="text-left py-2 px-4">Nosaukums</th>
                <th className="text-left py-2 px-4">Saite</th>
                <th className="text-left py-2 px-4">Rādīt?</th>
                <th className="text-left py-2 px-4">Dzēst</th>
              </tr>
            </thead>
            <tbody>
              {menuItems.map((item, i) => (
                <tr key={i} className="border-b">
                  <td className="px-4 py-2">
                    <Input
                      value={item.label}
                      onChange={(e) => handleChange(i, "label", e.target.value)}
                      placeholder="Nosaukums"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <Input
                      value={item.link}
                      onChange={(e) => handleChange(i, "link", e.target.value)}
                      placeholder="Saite"
                    />
                  </td>
                  <td className="px-4 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={item.isVisible}
                      onChange={(e) => handleChange(i, "isVisible", e.target.checked)}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <Button variant="ghost" size="icon" onClick={() => removeItem(i)}>
                      <Trash className="w-4 h-4 text-red-500" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Button onClick={addItem} variant="outline" size="sm" className="mt-4">
          <Plus className="w-4 h-4 mr-1" /> Pievienot vienību
        </Button>
      </div>

      <Button onClick={handleSave} className="mt-6">
        Saglabāt izmaiņas
      </Button>
    </div>
  )
}
