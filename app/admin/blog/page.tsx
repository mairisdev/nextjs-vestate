"use client"

import { useEffect, useState } from "react"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import { Button } from "../../components/ui/button"
import { Plus, Trash } from "lucide-react"

type BlogPost = {
  id?: string
  title: string
  date: string
  excerpt: string
  image: File | string | null
}

export default function BlogSettings() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [status, setStatus] = useState("")

  useEffect(() => {
    fetch("/api/blog")
      .then(res => res.json())
      .then(data => {
        setPosts(data.map((p: any) => ({
          id: p.id,
          title: p.title,
          date: p.date,
          excerpt: p.excerpt,
          image: p.imageUrl,
        })))
      })
  }, [])

  const updatePost = <K extends keyof BlogPost>(i: number, field: K, value: BlogPost[K]) => {
    const copy = [...posts]
    copy[i] = { ...copy[i], [field]: value }
    setPosts(copy)
  }

  const addPost = () => {
    setPosts([...posts, { title: "", date: "", excerpt: "", image: null }])
  }

  const removePost = (i: number) => {
    setPosts(posts.filter((_, idx) => idx !== i))
  }

  const handleSave = async () => {
    setStatus("Saglabājas...")

    for (const post of posts) {
      const formData = new FormData()
      formData.append("title", post.title)
      formData.append("date", post.date)
      formData.append("excerpt", post.excerpt)
      if (post.image instanceof File) {
        formData.append("image", post.image)
      } else if (typeof post.image === "string") {
        formData.append("existingImageUrl", post.image)
      }

      await fetch("/api/blog", {
        method: "POST",
        body: formData,
      })
    }

    setStatus("Saglabāts veiksmīgi ✅")
  }

  return (
    <div className="max-w-4xl mx-auto py-10 space-y-8">
      <h2 className="text-2xl font-bold">Bloga ieraksti</h2>

      {posts.map((post, i) => (
        <div key={i} className="border p-4 rounded-lg space-y-4 bg-gray-50">
          <div className="flex justify-between items-center">
            <Label>Bloga ieraksts #{i + 1}</Label>
            <Button variant="ghost" size="icon" onClick={() => removePost(i)}>
              <Trash className="text-red-500 w-4 h-4" />
            </Button>
          </div>

          <Input value={post.title} onChange={(e) => updatePost(i, "title", e.target.value)} placeholder="Virsraksts" />
          <Input value={post.date} onChange={(e) => updatePost(i, "date", e.target.value)} placeholder="Datums" />
          <Textarea value={post.excerpt} onChange={(e) => updatePost(i, "excerpt", e.target.value)} placeholder="Apraksts" />

          <Input
            type="file"
            accept="image/*"
            onChange={(e) => updatePost(i, "image", e.target.files?.[0] || null)}
          />
          {typeof post.image === "string" && (
            <img src={post.image} alt="Preview" className="w-full max-w-xs rounded-md" />
          )}
        </div>
      ))}

      <Button variant="outline" onClick={addPost}>
        <Plus className="w-4 h-4 mr-2" /> Pievienot rakstu
      </Button>

      <Button onClick={handleSave}>Saglabāt izmaiņas</Button>
      {status && <p className="text-sm mt-2">{status}</p>}
    </div>
  )
}
