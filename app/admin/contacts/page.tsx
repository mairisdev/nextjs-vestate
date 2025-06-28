"use client"

import { useState } from "react"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import { Button } from "../../components/ui/button"

export default function ContactSettings() {
  const [heading, setHeading] = useState("Sadarbībai vai bezmaksas konsultācijai – zvaniet 28446677")
  const [subtext, setSubtext] = useState("vai aizpildiet formu, lai nosūtītu mums ziņu.")
  const [address, setAddress] = useState("Dominas biroji, Ieriķu iela 3, Rīga, LV-1084")
  const [phone, setPhone] = useState("+371 28 44 66 77")
  const [email, setEmail] = useState("info@vestate.lv")
  const [hours, setHours] = useState("Nenormēts: 24/7")

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

      <Button className="mt-4">Saglabāt izmaiņas</Button>
    </div>
  )
}
