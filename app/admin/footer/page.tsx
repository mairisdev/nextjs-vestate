"use client"

import { useEffect, useState } from "react"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import { Button } from "../../components/ui/button"
import AlertMessage from "../../components/ui/alert-message"

export default function FooterSettings() {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState("")
  const [id, setId] = useState("")

  const [companyName, setCompanyName] = useState("")
  const [companyDesc, setCompanyDesc] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [address, setAddress] = useState("")

  const [facebookUrl, setFacebookUrl] = useState("")
  const [instagramUrl, setInstagramUrl] = useState("")
  const [linkedinUrl, setLinkedinUrl] = useState("")

  const [developerName, setDeveloperName] = useState("")
  const [developerUrl, setDeveloperUrl] = useState("")

  const [copyrightText, setCopyrightText] = useState("")

  useEffect(() => {
    fetch("/api/footer-settings")
      .then((res) => res.json())
      .then((data) => {
        setId(data.id || "")
        setCompanyName(data.companyName || "")
        setCompanyDesc(data.companyDesc || "")
        setPhone(data.phone || "")
        setEmail(data.email || "")
        setAddress(data.address || "")
        setFacebookUrl(data.facebookUrl || "")
        setInstagramUrl(data.instagramUrl || "")
        setLinkedinUrl(data.linkedinUrl || "")
        setDeveloperName(data.developerName || "")
        setDeveloperUrl(data.developerUrl || "")
        setCopyrightText(data.copyrightText || "")
      })
  }, [])

  const handleSave = async () => {
    setLoading(true)
    const res = await fetch("/api/footer-settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        companyName,
        companyDesc,
        phone,
        email,
        address,
        facebookUrl,
        instagramUrl,
        linkedinUrl,
        developerName,
        developerUrl,
        copyrightText,
      }),
    })

    setStatus(res.ok ? "success" : "error")
    setLoading(false)

    setTimeout(() => setStatus(""), 3000)
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Kājenes iestatījumi</h2>

        {status === "success" && (
          <AlertMessage type="success" message="Izmaiņas saglabātas veiksmīgi." />
        )}
        {status === "error" && (
          <AlertMessage type="error" message="Radās kļūda saglabājot izmaiņas." />
        )}

        <br/>

      <div className="bg-white shadow rounded-2xl p-6 space-y-5">
        <div>
          <Label className="mb-1 block">Uzņēmuma nosaukums</Label>
          <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
        </div>

        <div>
          <Label className="mb-1 block">Apraksts</Label>
          <Textarea
            className="min-h-[80px]"
            value={companyDesc}
            onChange={(e) => setCompanyDesc(e.target.value)}
          />
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
          <Label className="mb-1 block">Adrese</Label>
          <Textarea value={address} onChange={(e) => setAddress(e.target.value)} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="mb-1 block">Facebook URL</Label>
            <Input value={facebookUrl} onChange={(e) => setFacebookUrl(e.target.value)} />
          </div>
          <div>
            <Label className="mb-1 block">Instagram URL</Label>
            <Input value={instagramUrl} onChange={(e) => setInstagramUrl(e.target.value)} />
          </div>
          <div>
            <Label className="mb-1 block">LinkedIn URL</Label>
            <Input value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} />
          </div>
        </div>

        <div>
          <Label className="mb-1 block">Izstrādātāja vārds</Label>
          <Input value={developerName} onChange={(e) => setDeveloperName(e.target.value)} />
        </div>

        <div>
          <Label className="mb-1 block">Izstrādātāja URL</Label>
          <Input value={developerUrl} onChange={(e) => setDeveloperUrl(e.target.value)} />
        </div>

        <div>
          <Label className="mb-1 block">Autortiesību teksts</Label>
          <Input value={copyrightText} onChange={(e) => setCopyrightText(e.target.value)} />
        </div>

        <div className="pt-4">
          <Button onClick={handleSave} disabled={loading} className="w-full md:w-auto">
            {loading ? "Saglabājas..." : "Saglabāt izmaiņas"}
          </Button>
        </div>

      </div>
    </div>
  )
}
