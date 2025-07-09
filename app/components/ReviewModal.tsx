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
}

export default function ReviewModal({ open, onClose, onSave, initialData }: Props) {
  const [content, setContent] = useState("")
  const [author, setAuthor] = useState("")
  const [rating, setRating] = useState(5)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined)

  // Kad atver modal, ielādē sākotnējos datus
  useEffect(() => {
    if (initialData) {
      setContent(initialData.content)
      setAuthor(initialData.author)
      setRating(initialData.rating)
      setImageUrl(initialData.imageUrl) // ← pievieno šo rindu
    } else {
      setContent("")
      setAuthor("")
      setRating(5)
      setImageUrl(undefined)
    }
  }, [initialData, open])

  const handleSave = () => {
    if (content.trim() && author.trim()) {
      onSave({ content, author, rating, imageFile, imageUrl }) // ← pievieno imageUrl
      onClose()
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
                if (file) setImageUrl(undefined)
              }}
            />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleSave}>
            {initialData ? "Saglabāt izmaiņas" : "Pievienot"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
