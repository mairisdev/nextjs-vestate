"use client"

import { useEffect, useState } from "react"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import { Button } from "../../components/ui/button"
import AlertMessage from "../../components/ui/alert-message"

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
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ heading, subtext, address, phone, email, hours }),
    })

    if (res.ok) {
      setStatus("success")
    } else {
      setStatus("error")
    }

    setTimeout(() => setStatus(""), 3000)
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Kontaktinformācija</h2>

        {status === "success" && (
          <AlertMessage type="success" message="Izmaiņas saglabātas veiksmīgi." />
        )}
        {status === "error" && (
          <AlertMessage type="error" message="Radās kļūda saglabājot izmaiņas." />
        )}

        <br/>

      <div className="bg-white rounded-2xl shadow p-6 space-y-5">
        <div>
          <Label className="mb-1 block">Galvenais virsraksts</Label>
          <Textarea value={heading} onChange={(e) => setHeading(e.target.value)} />
        </div>

        <div>
          <Label className="mb-1 block">Apakšteksts</Label>
          <Input value={subtext} onChange={(e) => setSubtext(e.target.value)} />
        </div>

        <div>
          <Label className="mb-1 block">Adrese</Label>
          <Textarea value={address} onChange={(e) => setAddress(e.target.value)} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="mb-1 block">Tālrunis</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>

          <div>
            <Label className="mb-1 block">E-pasts</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
        </div>

        <div>
          <Label className="mb-1 block">Darba laiks</Label>
          <Input value={hours} onChange={(e) => setHours(e.target.value)} />
        </div>

        <div className="pt-4">
          <Button onClick={handleSave} className="w-full md:w-auto">
            Saglabāt izmaiņas
          </Button>
        </div>

      </div>
    </div>
  )
}
