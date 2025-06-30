"use client"

import { useEffect, useState } from "react"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import { Button } from "../../components/ui/button"

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
    const fetchData = async () => {
      setLoading(true)
      try {
        const res = await fetch("/api/footer-settings")
        const data = await res.json()

        if (data?.id) setId(data.id)
        if (data?.companyName) setCompanyName(data.companyName)
        if (data?.description) setCompanyDesc(data.description)
        if (data?.phone) setPhone(data.phone)
        if (data?.email) setEmail(data.email)
        if (data?.address) setAddress(data.address)
        if (data?.facebookUrl) setFacebookUrl(data.facebookUrl)
        if (data?.instagramUrl) setInstagramUrl(data.instagramUrl)
        if (data?.linkedinUrl) setLinkedinUrl(data.linkedinUrl)
        if (data?.developerName) setDeveloperName(data.developerName)
        if (data?.developerUrl) setDeveloperUrl(data.developerUrl)
        if (data?.copyrightText) setCopyrightText(data.copyrightText)
      } catch (error) {
        console.error("Kļūda ielādējot kājenes datus:", error)
        setStatus("Neizdevās ielādēt datus ❌")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleSave = async () => {
    setStatus("Saglabājas...")
    try {
      const res = await fetch("/api/footer-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          companyName,
          description: companyDesc,
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

      if (res.ok) {
        const updated = await res.json()
        setId(updated.id)
        setStatus("Saglabāts veiksmīgi ✅")
      } else {
        setStatus("Kļūda saglabājot ❌")
      }
    } catch (error) {
      console.error("Kļūda saglabājot datus:", error)
      setStatus("Kļūda savienojumā ❌")
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-10 space-y-6">
      <h2 className="text-2xl font-bold">Kājenes iestatījumi</h2>

      {loading ? (
        <p className="text-gray-500">Notiek ielāde...</p>
      ) : (
        <>
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
            <Label>Izstrādātāja vārds</Label>
            <Input value={developerName} onChange={(e) => setDeveloperName(e.target.value)} />
          </div>
          <div>
            <Label>Izstrādātāja URL</Label>
            <Input value={developerUrl} onChange={(e) => setDeveloperUrl(e.target.value)} />
          </div>

          <div>
            <Label>Autortiesību teksts</Label>
            <Input value={copyrightText} onChange={(e) => setCopyrightText(e.target.value)} />
          </div>

          <Button className="mt-4" onClick={handleSave}>
            Saglabāt izmaiņas
          </Button>

          {status && <p className="text-sm mt-2">{status}</p>}
        </>
      )}
    </div>
  )
}
