"use client"

import { useEffect, useState } from "react"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Button } from "../../components/ui/button"
import { Plus, Trash } from "lucide-react"
import AlertMessage from "../../components/ui/alert-message"
import { Textarea } from "@/app/components/ui/textarea"

type BlogPost = {
  id?: string
  title: string
  date: string
  excerpt: string
  image: File | string | null
}

export default function BlogSettings() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null)

  useEffect(() => {
    fetch("/api/blog")
      .then((res) => res.json())
      .then((data) => {
        setPosts(
          data.map((p: any) => ({
            id: p.id,
            title: p.title,
            date: p.date,
            excerpt: p.excerpt,
            image: p.imageUrl,
          }))
        )
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
    setAlert(null)

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
      if (post.id) {
        formData.append("id", post.id)
      }

      const res = await fetch("/api/blog", {
        method: "POST",
        body: formData,
      })

      if (res.ok) {
        setAlert({ type: "success", message: "Dati saglabāti veiksmīgi!" })
      } else {
        setAlert({ type: "error", message: "Kļūda saglabājot datus!" })
      }
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-10 space-y-8">
      <h2 className="text-2xl font-bold">Bloga ieraksti</h2>
      {alert && (
        <AlertMessage type={alert.type} message={alert.message} />
      )}
      {posts.map((post, i) => (
        <div key={i} className="border p-4 rounded-lg space-y-4 bg-gray-50">
          <div className="flex justify-between items-center">
            <Label>Bloga ieraksts #{i + 1}</Label>
            <Button variant="ghost" size="icon" onClick={() => removePost(i)}>
              <Trash className="text-red-500 w-4 h-4" />
            </Button>
          </div>

          <Input
            value={post.title}
            onChange={(e) => updatePost(i, "title", e.target.value)}
            placeholder="Virsraksts"
          />
          <Input
            value={post.date}
            onChange={(e) => updatePost(i, "date", e.target.value)}
            placeholder="Datums"
          />
          
          <div>
            <Label className="block text-sm font-semibold mb-2">Apraksts</Label>
                    <Textarea
            value={post.excerpt}
            onChange={(e) => updatePost(i, "date", e.target.value)}
            placeholder="Apraksts"
          />
          </div>

          <label className="block w-full max-w-sm px-4 py-2 border border-dashed border-gray-300 rounded-lg text-center cursor-pointer bg-gray-50">
            <span>Izvēlieties attēlu no failiem</span>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => updatePost(i, "image", e.target.files?.[0] || null)}
              className="hidden"
            />
            {typeof post.image === "string" && (
              <img src={post.image} alt="Preview" className="w-full max-w-xs rounded-md mt-2" />
            )}
          </label>
        </div>
      ))}

      <Button variant="outline" onClick={addPost}>
        <Plus className="w-4 h-4 mr-2" /> Pievienot rakstu
      </Button>

      <Button onClick={handleSave}>Saglabāt izmaiņas</Button>
    </div>
  )
}
