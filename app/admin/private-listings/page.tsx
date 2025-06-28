"use client"

import { useState } from "react"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Button } from "../../components/ui/button"
import { Textarea } from "../../components/ui/textarea"
import { Trash, Plus } from "lucide-react"

interface PrivateListing {
  title: string
  statusText: string
  image: File | null
  floors: string
  size: string
  info: string
  link: string
}

export default function PrivateListingsSettings() {
  const [listings, setListings] = useState<PrivateListing[]>([
    {
      title: "3 istabu dzīvoklis Jūrmalā",
      statusText: "Pēc vienošanās",
      image: null,
      floors: "2 stāvu dzīvoklis",
      size: "98m2",
      info: "Info2",
      link: "#",
    },
  ])

  const updateListing = (index: number, field: keyof PrivateListing, value: any) => {
    const updated = [...listings]
    updated[index] = { ...updated[index], [field]: value }
    setListings(updated)
  }

  const addListing = () => {
    setListings([
      ...listings,
      {
        title: "",
        statusText: "",
        image: null,
        floors: "",
        size: "",
        info: "",
        link: "#",
      },
    ])
  }

  const removeListing = (index: number) => {
    setListings(listings.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-10">
      <h2 className="text-2xl font-bold">Nepubliskie īpašumi</h2>

      {listings.map((listing, index) => (
        <div key={index} className="border rounded-lg p-4 space-y-4 bg-white">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-lg">Piedāvājums #{index + 1}</h3>
            <Button variant="ghost" size="icon" onClick={() => removeListing(index)}>
              <Trash className="w-4 h-4 text-red-500" />
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Nosaukums</Label>
              <Input
                value={listing.title}
                onChange={(e: { target: { value: any } }) => updateListing(index, "title", e.target.value)}
              />
            </div>
            <div>
              <Label>Statusa teksts</Label>
              <Input
                value={listing.statusText}
                onChange={(e: { target: { value: any } }) => updateListing(index, "statusText", e.target.value)}
              />
            </div>
            <div>
              <Label>Attēls</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                updateListing(index, "image", e.target.files?.[0] || null)
                }
              />
            </div>
            <div>
              <Label>Stāvu info</Label>
              <Input
                value={listing.floors}
                onChange={(e: { target: { value: any } }) => updateListing(index, "floors", e.target.value)}
              />
            </div>
            <div>
              <Label>Platība</Label>
              <Input
                value={listing.size}
                onChange={(e: { target: { value: any } }) => updateListing(index, "size", e.target.value)}
              />
            </div>
            <div>
              <Label>Papildus info</Label>
              <Input
                value={listing.info}
                onChange={(e: { target: { value: any } }) => updateListing(index, "info", e.target.value)}
              />
            </div>
            <div>
              <Label>Saite</Label>
              <Input
                value={listing.link}
                onChange={(e: { target: { value: any } }) => updateListing(index, "link", e.target.value)}
              />
            </div>
          </div>
        </div>
      ))}

      <Button variant="outline" size="sm" onClick={addListing}>
        <Plus className="w-4 h-4 mr-1" /> Pievienot piedāvājumu
      </Button>

      <div>
        <Button className="mt-6">Saglabāt izmaiņas</Button>
      </div>
    </div>
  )
}
