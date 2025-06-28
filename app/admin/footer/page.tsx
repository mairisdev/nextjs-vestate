"use client"

import { useState } from "react"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import { Button } from "../../components/ui/button"

export default function FooterSettings() {
  const [companyName, setCompanyName] = useState("SIA Vestate")
  const [companyDesc, setCompanyDesc] = useState("Profesionāli nekustamā īpašuma pakalpojumi Rīgā un visā Latvijā.")
  const [phone, setPhone] = useState("+371 28446677")
  const [email, setEmail] = useState("info@vestate.lv")
  const [address, setAddress] = useState("Dominas biroji, Ieriķu iela 3, Rīga, LV-1084")

  const [facebookUrl, setFacebookUrl] = useState("")
  const [instagramUrl, setInstagramUrl] = useState("")
  const [linkedinUrl, setLinkedinUrl] = useState("")

  const [copyright, setCopyright] = useState(
    "© 2025 Vestate. Visas tiesības aizsargātas. Izstrāde: MairisDigital"
  )

  return (
    <div className="max-w-4xl mx-auto py-10 space-y-6">
      <h2 className="text-2xl font-bold">Kājenes iestatījumi</h2>

      <div>
        <Label>Uzņēmuma nosaukums</Label>
        <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
      </div>

      <div>
        <Label>Apraksts</Label>
        <Textarea value={companyDesc} onChange={(e) => setCompanyDesc(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Tālrunis</Label>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div>
          <Label>E-pasts</Label>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <Label>Adrese</Label>
          <Input value={address} onChange={(e) => setAddress(e.target.value)} />
        </div>
      </div>

      <div>
        <Label>Facebook URL</Label>
        <Input value={facebookUrl} onChange={(e) => setFacebookUrl(e.target.value)} />
      </div>
      <div>
        <Label>Instagram URL</Label>
        <Input value={instagramUrl} onChange={(e) => setInstagramUrl(e.target.value)} />
      </div>
      <div>
        <Label>LinkedIn URL</Label>
        <Input value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} />
      </div>

      <div>
        <Label>Autortiesību teksts</Label>
        <Input value={copyright} onChange={(e) => setCopyright(e.target.value)} />
      </div>

      <Button className="mt-4">Saglabāt izmaiņas</Button>
    </div>
  )
}
