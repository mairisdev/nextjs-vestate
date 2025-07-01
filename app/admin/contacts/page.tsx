"use client"

import { useEffect, useState } from "react"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import { Button } from "../../components/ui/button"

export default function ContactSettings() {
  const [heading, setHeading] = useState("")
  const [subtext, setSubtext] = useState("")
  const [address, setAddress] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [hours, setHours] = useState("")
  const [status, setStatus] = useState("")

  useEffect(() => {
    fetch("/api/contact")
      .then((res) => res.json())
      .then((data) => {
        setHeading(data.heading || "")
        setSubtext(data.subtext || "")
        setAddress(data.address || "")
        setPhone(data.phone || "")
        setEmail(data.email || "")
        setHours(data.hours || "")
      })
  }, [])

  const handleSave = async () => {
    setStatus("Saglabājas...")

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ heading, subtext, address, phone, email, hours }),
    })

    if (res.ok) {
      setStatus("Saglabāts veiksmīgi ✅")
    } else {
      setStatus("Kļūda saglabājot ❌")
    }
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto py-10">
      <h2 className="text-2xl font-bold">Kontaktinformācija</h2>

      <div>
        <Label>Galvenais virsraksts</Label>
        <Textarea value={heading} onChange={(e) => setHeading(e.target.value)} />
      </div>

      <div>
        <Label>Apakšteksts</Label>
        <Input value={subtext} onChange={(e) => setSubtext(e.target.value)} />
      </div>

      <div>
        <Label>Adrese</Label>
        <Textarea value={address} onChange={(e) => setAddress(e.target.value)} />
      </div>

      <div>
        <Label>Tālrunis</Label>
        <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>

      <div>
        <Label>E-pasts</Label>
        <Input value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>

      <div>
        <Label>Darba laiks</Label>
        <Input value={hours} onChange={(e) => setHours(e.target.value)} />
      </div>

      <Button className="mt-4" onClick={handleSave}>Saglabāt izmaiņas</Button>
      {status && <p className="mt-2 text-sm">{status}</p>}
    </div>
  )
}
