"use client"

import { useEffect, useState } from "react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import { Plus, Trash, ChevronDown, ChevronRight } from "lucide-react"
import AlertMessage from "../../components/ui/alert-message"

interface SubItem {
  label: string
  link: string
}

interface MenuItem {
  label: string
  link: string
  isVisible: boolean
  isDropdown: boolean
  subItems?: SubItem[]
}

export default function NavigationSettings() {
  const [id, setId] = useState("")
  const [logoAlt, setLogoAlt] = useState("")
  const [logoUrl, setLogoUrl] = useState("")
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [phone, setPhone] = useState("")
  const [securityText, setSecurityText] = useState("")
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [expandedDropdowns, setExpandedDropdowns] = useState<number[]>([])

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
          
          const combinedItems = [
            ...(data.menuItems || []).map((item: any) => ({
              ...item,
              isDropdown: false,
              subItems: []
            })),
            ...(data.dropdownItems || []).map((item: any) => ({
              ...item,
              isDropdown: true,
              subItems: item.subItems || []
            }))
          ]
          const normalizedItems = combinedItems.map((item: any) => ({
            ...item,
            isVisible: typeof item.isVisible === "string" ? item.isVisible === "true" : item.isVisible,
            isDropdown: typeof item.isDropdown === "string" ? item.isDropdown === "true" : item.isDropdown,
          }))
          setMenuItems(normalizedItems)
        }
      })
      .catch((err) => {
        console.error("Kļūda ielādējot navigācijas datus:", err)
        setErrorMessage("Neizdevās ielādēt navigācijas iestatījumus.")
      })
  }, [])

  const updateMenuItem = (i: number, field: keyof MenuItem, value: any) => {
    const copy = [...menuItems]
    copy[i] = { ...copy[i], [field]: value }
    setMenuItems(copy)
  }

  const toggleDropdown = (i: number) => {
    const copy = [...menuItems]
    copy[i].isDropdown = !copy[i].isDropdown
    
    if (copy[i].isDropdown && !copy[i].subItems) {
      copy[i].subItems = [{ label: "", link: "" }]
    } else if (!copy[i].isDropdown) {
      copy[i].subItems = []
    }
    
    setMenuItems(copy)
  }

  const addMenuItem = () => {
    setMenuItems([...menuItems, { 
      label: "", 
      link: "#", 
      isVisible: true, 
      isDropdown: false,
      subItems: []
    }])
  }

  const removeMenuItem = (i: number) => {
    setMenuItems(menuItems.filter((_, idx) => idx !== i))
  }

  const addSubItem = (menuIndex: number) => {
    const copy = [...menuItems]
    if (!copy[menuIndex].subItems) {
      copy[menuIndex].subItems = []
    }
    copy[menuIndex].subItems!.push({ label: "", link: "" })
    setMenuItems(copy)
  }

  const removeSubItem = (menuIndex: number, subIndex: number) => {
    const copy = [...menuItems]
    copy[menuIndex].subItems = copy[menuIndex].subItems!.filter((_, idx) => idx !== subIndex)
    setMenuItems(copy)
  }

  const updateSubItem = (menuIndex: number, subIndex: number, field: keyof SubItem, value: string) => {
    const copy = [...menuItems]
    copy[menuIndex].subItems![subIndex][field] = value
    setMenuItems(copy)
  }

  const toggleExpanded = (index: number) => {
    if (expandedDropdowns.includes(index)) {
      setExpandedDropdowns(expandedDropdowns.filter(i => i !== index))
    } else {
      setExpandedDropdowns([...expandedDropdowns, index])
    }
  }

  const handleSave = async () => {
    setSuccessMessage(null)
    setErrorMessage(null)

    const regularMenuItems = menuItems
      .filter(item => !item.isDropdown)
      .map(({ isDropdown, subItems, ...rest }) => rest)
    
    const dropdownItems = menuItems
      .filter(item => item.isDropdown)
      .map(({ isDropdown, ...rest }) => rest)

    const formData = new FormData()
    formData.append("id", id)
    formData.append("logoAlt", logoAlt)
    formData.append("phone", phone)
    formData.append("securityText", securityText)
    formData.append("menuItems", JSON.stringify(regularMenuItems))
    formData.append("dropdownItems", JSON.stringify(dropdownItems))
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
    <div className="space-y-8 max-w-6xl mx-auto py-10">
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
        <Label className="block mb-2 font-semibold">Navigācijas izvēlne</Label>
        <div className="space-y-4">
          {menuItems.map((item, index) => (
            <div key={index} className="border rounded-lg p-4 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                <div>
                  <Label>Nosaukums</Label>
                  <Input
                    value={item.label}
                    onChange={(e) => updateMenuItem(index, 'label', e.target.value)}
                    placeholder="Nosaukums"
                  />
                </div>

                <div>
                  <Label>Saite</Label>
                  <Input
                    value={item.link}
                    onChange={(e) => updateMenuItem(index, 'link', e.target.value)}
                    placeholder="Saite"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={item.isVisible}
                    onChange={(e) => updateMenuItem(index, 'isVisible', e.target.checked)}
                  />
                  <Label>Rādīt</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={item.isDropdown}
                    onChange={() => toggleDropdown(index)}
                  />
                  <Label>Dropdown</Label>
                </div>

                <div className="flex space-x-2">
                  {item.isDropdown && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleExpanded(index)}
                    >
                      {expandedDropdowns.includes(index) ? 
                        <ChevronDown className="w-4 h-4" /> : 
                        <ChevronRight className="w-4 h-4" />
                      }
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeMenuItem(index)}
                  >
                    <Trash className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>

              {item.isDropdown && expandedDropdowns.includes(index) && (
                <div className="mt-4 pl-4 border-l-2 border-gray-300">
                  <Label className="block mb-2">Apakšlinki</Label>
                  <div className="space-y-2">
                    {item.subItems?.map((subItem, subIndex) => (
                      <div key={subIndex} className="grid grid-cols-1 md:grid-cols-2 gap-2 p-3 bg-white rounded border">
                        <Input
                          value={subItem.label}
                          onChange={(e) => updateSubItem(index, subIndex, 'label', e.target.value)}
                          placeholder="Apakšlinka nosaukums"
                        />
                        <div className="flex items-center space-x-2">
                          <Input
                            value={subItem.link}
                            onChange={(e) => updateSubItem(index, subIndex, 'link', e.target.value)}
                            placeholder="/saite"
                            className="flex-1"
                          />
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => removeSubItem(index, subIndex)}
                          >
                            <Trash className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button 
                    onClick={() => addSubItem(index)} 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                  >
                    <Plus className="w-4 h-4 mr-1" /> Pievienot apakšlinku
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <Button onClick={addMenuItem} variant="outline" size="sm" className="mt-4">
          <Plus className="w-4 h-4 mr-1" /> Pievienot linku
        </Button>
      </div>

      <Button onClick={handleSave} className="mt-6">
        Saglabāt izmaiņas
      </Button>
    </div>
  )
}
