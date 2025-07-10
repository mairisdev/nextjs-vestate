"use client"

import { useEffect, useState, useRef } from "react"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Button } from "../../components/ui/button"
import { Plus, Edit, Trash } from "lucide-react"
import AlertMessage from "../../components/ui/alert-message"

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
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const contentRef = useRef<HTMLTextAreaElement | null>(null)

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
    setIsCreating(true)
    setEditingIndex(posts.length)
  }

  const removePost = async (i: number) => {
    if (!confirm("Vai tiešām dzēst šo rakstu?")) return
    
    const post = posts[i]
    if (post.id) {
      try {
        const res = await fetch(`/api/blog/${post.id}`, {
          method: "DELETE"
        })
        if (res.ok) {
          setAlert({ type: "success", message: "Raksts dzēsts!" })
        } else {
          setAlert({ type: "error", message: "Kļūda dzēšot rakstu!" })
          return
        }
      } catch (error) {
        setAlert({ type: "error", message: "Kļūda dzēšot rakstu!" })
        return
      }
    }
    
    setPosts(posts.filter((_, idx) => idx !== i))
    setEditingIndex(null)
  }

  const handleSave = async (postIndex: number) => {
    setAlert(null)
    const post = posts[postIndex]

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

    try {
      const res = await fetch("/api/blog", {
        method: "POST",
        body: formData,
      })

      if (res.ok) {
        const savedPost = await res.json()
        if (!post.id) {
          const copy = [...posts]
          copy[postIndex] = { ...copy[postIndex], id: savedPost.id }
          setPosts(copy)
        }
        setAlert({ type: "success", message: "Raksts saglabāts!" })
        setEditingIndex(null)
        setIsCreating(false)
      } else {
        setAlert({ type: "error", message: "Kļūda saglabājot rakstu!" })
      }
    } catch (error) {
      setAlert({ type: "error", message: "Kļūda saglabājot rakstu!" })
    }
  }

  const cancelEdit = (postIndex: number) => {
    if (isCreating) {
      setPosts(posts.filter((_, idx) => idx !== postIndex))
      setIsCreating(false)
    }
    setEditingIndex(null)
  }

  const startEdit = (index: number) => {
    setEditingIndex(index)
    setIsCreating(false)
  }

  const insertText = (before: string, after: string = "") => {
    const textarea = contentRef.current
    if (!textarea || editingIndex === null) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = posts[editingIndex].excerpt.substring(start, end)
    const newText = 
      posts[editingIndex].excerpt.substring(0, start) + 
      before + selectedText + after + 
      posts[editingIndex].excerpt.substring(end)
    
    updatePost(editingIndex, "excerpt", newText)
    
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + before.length, end + before.length)
    }, 0)
  }

  const insertLink = () => {
    const url = prompt("Ievadiet URL:")
    if (url) {
      const text = prompt("Ievadiet saites tekstu:") || url
      insertText(`<a href="${url}" target="_blank">`, `${text}</a>`)
    }
  }

  const insertImage = () => {
    const url = prompt("Ievadiet attēla URL:")
    if (url) {
      const alt = prompt("Ievadiet attēla aprakstu:") || ""
      insertText(`<img src="${url}" alt="${alt}" class="max-w-full h-auto rounded-lg my-4" />`)
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-10">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Bloga ieraksti</h2>
        <Button onClick={addPost} disabled={editingIndex !== null}>
          <Plus className="w-4 h-4 mr-2" />
          Pievienot rakstu
        </Button>
      </div>

      {alert && (
        <AlertMessage type={alert.type} message={alert.message} />
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Raksts
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Datums
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Īsais apraksts
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Darbības
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {posts.map((post, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {typeof post.image === "string" && post.image && (
                        <img
                          src={post.image}
                          alt={post.title}
                          className="w-16 h-16 object-cover rounded-lg mr-4"
                        />
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {post.title || "Bez nosaukuma"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {post.excerpt ? `${post.excerpt.substring(0, 100)}...` : "Nav satura"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {post.date || "-"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs">
                      {post.shortDescription || "-"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => startEdit(i)}
                        disabled={editingIndex !== null}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => removePost(i)}
                        disabled={editingIndex !== null}
                      >
                        <Trash className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {posts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Nav pievienoti bloga raksti.</p>
          <p className="text-gray-400 text-sm mt-2">Pievienojiet jaunu rakstu, lai sāktu.</p>
        </div>
      )}

      {editingIndex !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">
                  {isCreating ? "Jauns bloga raksts" : "Rediģēt rakstu"}
                </h3>
                <Button variant="ghost" onClick={() => cancelEdit(editingIndex)}>
                  ✕
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Virsraksts</Label>
                  <Input
                    value={posts[editingIndex].title}
                    onChange={(e) => updatePost(editingIndex, "title", e.target.value)}
                    placeholder="Ievadiet virsrakstu"
                  />
                </div>

                <div>
                  <Label>Datums</Label>
                  <Input
                    value={posts[editingIndex].date}
                    onChange={(e) => updatePost(editingIndex, "date", e.target.value)}
                    placeholder="YYYY-MM-DD"
                  />
                </div>

                <div>
                  <Label>Īsais apraksts</Label>
                  <Input
                    value={posts[editingIndex].shortDescription}
                    onChange={(e) => updatePost(editingIndex, "shortDescription", e.target.value)}
                    placeholder="Īsais apraksts (parādīsies kartītēs)"
                  />
                </div>

                <div>
                  <Label>Galvenais saturs</Label>
                  
                  <div className="flex flex-wrap gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
                    <Button type="button" size="sm" variant="outline" onClick={() => insertText("<strong>", "</strong>")}>
                      B
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => insertText("<i>", "</i>")}>
                      I
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => insertText("<u>", "</u>")}>
                      U
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => insertText("<h1>", "</h1>")}>
                      H1
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => insertText("<h2>", "</h2>")}>
                      H2
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => insertText("<h3>", "</h3>")}>
                      H3
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => insertText("<h4>", "</h4>")}>
                      H4
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => insertText("<h5>", "</h5>")}>
                      H5
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => insertText("<h6>", "</h6>")}>
                      H6
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => insertText("<p>", "</p>")}>
                      P
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => insertLink()}>
                      Link
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => insertImage()}>
                      Img
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => insertText("<li>", "</li>")}>
                      LI
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => insertText("<blockquote>", "</blockquote>")}>
                      Quote
                    </Button>
                  </div>

                  <textarea
                    ref={contentRef}
                    value={posts[editingIndex].excerpt}
                    onChange={(e) => updatePost(editingIndex, "excerpt", e.target.value)}
                    placeholder="Ieraksta saturs... Vari izmantot HTML tagus vai Markdown."
                    rows={15}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Atbalsta HTML un Markdown formatējumu. Izmanto toolbar pogas ātrai formatēšanai.
                  </p>
                </div>

                <div>
                  <Label>Attēls</Label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => updatePost(editingIndex, "image", e.target.files?.[0] || null)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {typeof posts[editingIndex].image === "string" && posts[editingIndex].image && (
                    <img 
                      src={posts[editingIndex].image as string} 
                      alt="Preview" 
                      className="w-32 h-32 object-cover rounded-md mt-2" 
                    />
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button variant="outline" onClick={() => cancelEdit(editingIndex)}>
                  Atcelt
                </Button>
                <Button onClick={() => handleSave(editingIndex)}>
                  Saglabāt
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}