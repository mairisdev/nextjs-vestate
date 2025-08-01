// app/components/ReviewModal.tsx (AIZVIETO PILNĪBĀ)
"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Textarea } from "../components/ui/textarea"
import { Button } from "../components/ui/button"

type Review = {
  id?: string // Pievienojam ID lauku
  content: string
  author: string
  rating: number
  imageFile?: File | null
  imageUrl?: string
}

type Props = {
  open: boolean
  onClose: () => void
  onSave: (review: Review) => void
  initialData?: Review | null
  agentId: string // Pievienojam agentId
}

export default function ReviewModal({ open, onClose, onSave, initialData, agentId }: Props) {
  const [content, setContent] = useState("")
  const [author, setAuthor] = useState("")
  const [rating, setRating] = useState(5)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined)
  const [loading, setLoading] = useState(false)

  // Kad atver modal, ielādē sākotnējos datus
  useEffect(() => {
    if (initialData) {
      setContent(initialData.content)
      setAuthor(initialData.author)
      setRating(initialData.rating)
      setImageUrl(initialData.imageUrl)
    } else {
      setContent("")
      setAuthor("")
      setRating(5)
      setImageUrl(undefined)
    }
    setImageFile(null)
  }, [initialData, open])

  const handleSave = async () => {
    if (!content.trim() || !author.trim()) {
      alert("Atsauksmes teksts un autors ir obligāti!")
      return
    }

    setLoading(true)

    try {
      const formData = new FormData()
      formData.append("content", content)
      formData.append("author", author)
      formData.append("rating", rating.toString())
      
      if (imageFile) {
        formData.append("image", imageFile)
      }

      let response
      if (initialData?.id) {
        // UPDATE esošā atsauksme
        formData.append("reviewId", initialData.id)
        formData.append("existingImageUrl", imageUrl || "")
        response = await fetch("/api/agent-reviews", {
          method: "PUT",
          body: formData,
        })
      } else {
        // CREATE jauna atsauksme
        formData.append("agentId", agentId)
        response = await fetch("/api/agent-reviews", {
          method: "POST",
          body: formData,
        })
      }

      const data = await response.json()
      
      if (data.success) {
        // Atjaunojam lokālo state ar datubāzes datiem
        onSave({
          id: data.review.id,
          content: data.review.content,
          author: data.review.author,
          rating: data.review.rating,
          imageUrl: data.review.imageUrl,
        })
        onClose()
      } else {
        alert(`Kļūda: ${data.message}`)
      }
    } catch (error) {
      console.error("Error saving review:", error)
      alert("Radās kļūda saglabājot atsauksmi")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Labot atsauksmi" : "Pievienot atsauksmi"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Atsauksmes teksts</Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Ievadi atsauksmi"
            />
          </div>
          <div>
            <Label>Autors</Label>
            <Input
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Pēteris Ozoliņš"
            />
          </div>
          <div>
            <Label>Novērtējums (1–5)</Label>
            <Input
              type="number"
              min={1}
              max={5}
              value={rating}
              onChange={(e) => setRating(parseInt(e.target.value))}
            />
          </div>
          <div>
            <Label>Attēls (neobligāts)</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0] || null
                setImageFile(file)
              }}
            />
            {imageUrl && (
              <div className="mt-2">
                <img
                  src={imageUrl}
                  alt="Atsauksmes attēls"
                  className="w-20 h-20 object-cover rounded-md border"
                />
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Atcelt
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saglabā..." : (initialData ? "Saglabāt" : "Pievienot")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}