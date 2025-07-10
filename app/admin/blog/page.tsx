"use client"

import { useEffect, useState, useRef } from "react"
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
  shortDescription: string
  image: File | string | null
}

export default function BlogSettings() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const contentRefs = useRef<(HTMLTextAreaElement | null)[]>([])

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
            shortDescription: p.shortDescription || "",
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
    setPosts([...posts, { title: "", date: "", excerpt: "", shortDescription: "", image: null }])
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
      formData.append("shortDescription", post.shortDescription)
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

  const insertText = (postIndex: number, before: string, after: string = "") => {
    const textarea = contentRefs.current[postIndex]
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = posts[postIndex].excerpt.substring(start, end)
    const newText = 
      posts[postIndex].excerpt.substring(0, start) + 
      before + selectedText + after + 
      posts[postIndex].excerpt.substring(end)
    
    updatePost(postIndex, "excerpt", newText)
    
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + before.length, end + before.length)
    }, 0)
  }

  const insertLink = (postIndex: number) => {
    const url = prompt("Ievadiet URL:")
    if (url) {
      const text = prompt("Ievadiet saites tekstu:") || url
      insertText(postIndex, `<a href="${url}" target="_blank">`, `${text}</a>`)
    }
  }

  const insertImage = (postIndex: number) => {
    const url = prompt("Ievadiet attēla URL:")
    if (url) {
      const alt = prompt("Ievadiet attēla aprakstu:") || ""
      insertText(postIndex, `<img src="${url}" alt="${alt}" class="max-w-full h-auto rounded-lg my-4" />`)
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
            <Label className="block text-sm font-semibold mb-2">Īsais apraksts</Label>
            <Input
              value={post.shortDescription}
              onChange={(e) => updatePost(i, "shortDescription", e.target.value)}
              placeholder="Īsais apraksts (parādīsies kartītēs)"
            />
          </div>

          <div>
            <Label className="block text-sm font-semibold mb-2">Galvenais saturs</Label>
            
{/* Formatting toolbar */}
<div className="flex flex-wrap gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
  <Button type="button" size="sm" variant="outline" onClick={() => insertText(i, "<strong>", "</strong>")}>
    B
  </Button>
  <Button type="button" size="sm" variant="outline" onClick={() => insertText(i, "<i>", "</i>")}>
    I
  </Button>
  <Button type="button" size="sm" variant="outline" onClick={() => insertText(i, "<u>", "</u>")}>
    U
  </Button>
  <Button type="button" size="sm" variant="outline" onClick={() => insertText(i, "<h1>", "</h1>")}>
    H1
  </Button>
  <Button type="button" size="sm" variant="outline" onClick={() => insertText(i, "<h2>", "</h2>")}>
    H2
  </Button>
  <Button type="button" size="sm" variant="outline" onClick={() => insertText(i, "<h3>", "</h3>")}>
    H3
  </Button>
  <Button type="button" size="sm" variant="outline" onClick={() => insertText(i, "<h4>", "</h4>")}>
    H4
  </Button>
  <Button type="button" size="sm" variant="outline" onClick={() => insertText(i, "<h5>", "</h5>")}>
    H5
  </Button>
  <Button type="button" size="sm" variant="outline" onClick={() => insertText(i, "<h6>", "</h6>")}>
    H6
  </Button>
  <Button type="button" size="sm" variant="outline" onClick={() => insertText(i, "<p>", "</p>")}>
    P
  </Button>
  <Button type="button" size="sm" variant="outline" onClick={() => insertText(i, "<br />")}>
    BR
  </Button>
  <Button type="button" size="sm" variant="outline" onClick={() => insertLink(i)}>
    Link
  </Button>
  <Button type="button" size="sm" variant="outline" onClick={() => insertImage(i)}>
    Img
  </Button>
  <Button type="button" size="sm" variant="outline" onClick={() => insertText(i, "<ul><li>", "</li></ul>")}>
    UL
  </Button>
  <Button type="button" size="sm" variant="outline" onClick={() => insertText(i, "<ol><li>", "</li></ol>")}>
    OL
  </Button>
  <Button type="button" size="sm" variant="outline" onClick={() => insertText(i, "<li>", "</li>")}>
    LI
  </Button>
  <Button type="button" size="sm" variant="outline" onClick={() => insertText(i, "<blockquote>", "</blockquote>")}>
    Quote
  </Button>
  <Button type="button" size="sm" variant="outline" onClick={() => insertText(i, "<code>", "</code>")}>
    Code
  </Button>
  <Button type="button" size="sm" variant="outline" onClick={() => insertText(i, "<pre><code>", "</code></pre>")}>
    Pre
  </Button>
  <Button type="button" size="sm" variant="outline" onClick={() => insertText(i, "<hr />")}>
    HR
  </Button>
  <Button type="button" size="sm" variant="outline" onClick={() => insertText(i, "<div>", "</div>")}>
    DIV
  </Button>
  <Button type="button" size="sm" variant="outline" onClick={() => insertText(i, "<span>", "</span>")}>
    SPAN
  </Button>
</div>

            <Textarea
              ref={(el) => { contentRefs.current[i] = el }}
              value={post.excerpt}
              onChange={(e) => updatePost(i, "excerpt", e.target.value)}
              placeholder="Ieraksta saturs... Vari izmantot HTML tagus vai Markdown."
              rows={15}
              className="font-mono text-sm"
            />
            
            <p className="text-sm text-gray-500 mt-2">
              Atbalsta HTML un Markdown formatējumu. Izmanto toolbar pogas ātrai formatēšanai.
            </p>
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