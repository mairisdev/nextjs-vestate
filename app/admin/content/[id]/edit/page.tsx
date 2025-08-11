// app/admin/content/[id]/edit/page.tsx
"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "../../../../components/ui/button"
import { Input } from "../../../../components/ui/input"
import { Label } from "../../../../components/ui/label"
import { Textarea } from "../../../../components/ui/textarea"
import { ArrowLeft, X, Edit, Trash, Plus } from "lucide-react"
import Link from "next/link"
import AlertMessage from "../../../../components/ui/alert-message"

interface Content {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  type: "EDUCATIONAL" | "VILLAGES"
  published: boolean
  publishedAt: string | null
  featuredImage: string | null
  videoUrl: string | null
  videoFile: string | null
  images: string[]
  tags: string[]
  author: string | null
  metaTitle: string | null
  metaDescription: string | null
}

interface EditContentProps {
  params: Promise<{ id: string }>
}

type ContentItem = {
  id?: string
  title: string
  excerpt: string
  content: string
  type: "EDUCATIONAL" | "VILLAGES"
  published: boolean
  videoUrl: string
  author: string
  tags: string
  metaTitle: string
  metaDescription: string
  featuredImage: File | string | null
  videoFile: File | string | null
  additionalImages: File[] | string[]
}

export default function EditContent({ params }: EditContentProps) {
  const router = useRouter()
  const [contentId, setContentId] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const contentRef = useRef<HTMLTextAreaElement>(null)
  const [contents, setContents] = useState<ContentItem[]>([])
  const [newFeaturedImage, setNewFeaturedImage] = useState<File | null>(null)
  const [newVideoFile, setNewVideoFile] = useState<File | null>(null)
  const [newAdditionalImages, setNewAdditionalImages] = useState<File[]>([])
  const [featuredImagePreview, setFeaturedImagePreview] = useState<string | null>(null)
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState<string[]>([])
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([])

  useEffect(() => {
    const loadData = async () => {
      const resolvedParams = await params
      setContentId(resolvedParams.id)
      await loadContent(resolvedParams.id)
      setLoading(false)
    }
    loadData()
  }, [params])

  const loadContent = async (id: string) => {
    try {
      const res = await fetch(`/api/content/${id}`)
      if (!res.ok) {
        setAlert({ type: "error", message: "Saturs nav atrasts" })
        return
      }
      
      const content: Content = await res.json()
      
      const contentItem: ContentItem = {
        id: content.id,
        title: content.title,
        excerpt: content.excerpt,
        content: content.content,
        type: content.type,
        published: content.published,
        videoUrl: content.videoUrl || "",
        author: content.author || "",
        tags: content.tags.join(", "),
        metaTitle: content.metaTitle || "",
        metaDescription: content.metaDescription || "",
        featuredImage: content.featuredImage,
        videoFile: content.videoFile,
        additionalImages: content.images
      }

      setContents([contentItem])
    } catch (error) {
      setAlert({ type: "error", message: "Neizdevās ielādēt saturu" })
    }
  }

  const updateContent = <K extends keyof ContentItem>(i: number, field: K, value: ContentItem[K]) => {
    const copy = [...contents]
    copy[i] = { ...copy[i], [field]: value }
    setContents(copy)
  }

  const startEdit = (index: number) => {
    setEditingIndex(index)
    setIsCreating(false)
    // Reset file states
    setNewFeaturedImage(null)
    setNewVideoFile(null)
    setNewAdditionalImages([])
    setFeaturedImagePreview(null)
    setAdditionalImagePreviews([])
    setImagesToDelete([])
  }

  const cancelEdit = (contentIndex: number) => {
    setEditingIndex(null)
    // Reset file states
    setNewFeaturedImage(null)
    setNewVideoFile(null)
    setNewAdditionalImages([])
    setFeaturedImagePreview(null)
    setAdditionalImagePreviews([])
    setImagesToDelete([])
  }

  const handleFeaturedImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setNewFeaturedImage(file)
      const previewUrl = URL.createObjectURL(file)
      setFeaturedImagePreview(previewUrl)
    }
  }

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setNewVideoFile(file)
    }
  }

  const handleAdditionalImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length + newAdditionalImages.length > 10) {
      setAlert({ type: "error", message: "Maksimums 10 papildu attēli" })
      return
  }
    
    setNewAdditionalImages(prev => [...prev, ...files])
    const newPreviews = files.map(file => URL.createObjectURL(file))
    setAdditionalImagePreviews(prev => [...prev, ...newPreviews])
  }

  const removeCurrentFeaturedImage = () => {
    if (editingIndex !== null && typeof contents[editingIndex].featuredImage === "string") {
      setImagesToDelete(prev => [...prev, contents[editingIndex].featuredImage as string])
      updateContent(editingIndex, "featuredImage", null)
    }
  }

  const removeNewAdditionalImage = (index: number) => {
    setNewAdditionalImages(prev => prev.filter((_, i) => i !== index))
    setAdditionalImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const removeCurrentVideoFile = () => {
    if (editingIndex !== null && typeof contents[editingIndex].videoFile === "string") {
      setImagesToDelete(prev => [...prev, contents[editingIndex].videoFile as string])
      updateContent(editingIndex, "videoFile", null)
    }
  }

  const insertText = (before: string, after: string = "") => {
    const textarea = contentRef.current
    if (!textarea || editingIndex === null) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = contents[editingIndex].content.substring(start, end)
    const newText = 
      contents[editingIndex].content.substring(0, start) + 
      before + selectedText + after + 
      contents[editingIndex].content.substring(end)
    
    updateContent(editingIndex, "content", newText)
    
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

  const handleSave = async (contentIndex: number) => {
    setAlert(null)
    setSaving(true)
    const content = contents[contentIndex]

    if (!content.title.trim()) {
      setAlert({ type: "error", message: "Nosaukums ir obligāts" })
      setSaving(false)
      return
    }

    try {
      const formData = new FormData()
      
      formData.append("id", contentId)
      
      formData.append("title", content.title)
      formData.append("excerpt", content.excerpt)
      formData.append("content", content.content)
      formData.append("type", content.type)
      formData.append("published", String(content.published))
      formData.append("videoUrl", content.videoUrl)
      formData.append("author", content.author)
      formData.append("tags", content.tags)
      formData.append("metaTitle", content.metaTitle)
      formData.append("metaDescription", content.metaDescription)

      formData.append("existingFeaturedImage", typeof content.featuredImage === "string" ? content.featuredImage : "")
      formData.append("existingVideoFile", typeof content.videoFile === "string" ? content.videoFile : "")
      formData.append("existingAdditionalImages", JSON.stringify(Array.isArray(content.additionalImages) && typeof content.additionalImages[0] === "string" ? content.additionalImages : []))

      formData.append("imagesToDelete", JSON.stringify(imagesToDelete))

      if (newFeaturedImage) {
        formData.append("featuredImage", newFeaturedImage)
      }

      if (newVideoFile) {
        formData.append("videoFile", newVideoFile)
      }

      newAdditionalImages.forEach((image, index) => {
        formData.append(`additionalImage${index}`, image)
      })

      const res = await fetch(`/api/content/${contentId}`, {
        method: "PUT",
        body: formData
      })

      if (res.ok) {
        setAlert({ type: "success", message: "Saturs atjaunināts veiksmīgi!" })
        setEditingIndex(null)
        setTimeout(() => {
          router.push("/admin/content")
        }, 1500)
      } else {
        const responseData = await res.json()
        setAlert({ type: "error", message: responseData.error || "Kļūda atjauninot saturu" })
      }
    } catch (error) {
      console.error("Submit error:", error)
      setAlert({ type: "error", message: "Kļūda atjauninot saturu" })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-10">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link href="/admin/content">
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <h2 className="text-2xl font-bold">Rediģēt saturu</h2>
        </div>
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
                  Saturs
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tips
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Darbības
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {contents.map((content, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {typeof content.featuredImage === "string" && content.featuredImage && (
                        <img
                          src={content.featuredImage}
                          alt={content.title}
                          className="w-16 h-16 object-cover rounded-lg mr-4"
                        />
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {content.title || "Bez nosaukuma"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {content.excerpt ? `${content.excerpt.substring(0, 100)}...` : "Nav apraksta"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {content.type === "EDUCATIONAL" ? "Izglītojošais" : "Ciemati"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      content.published 
                        ? "bg-green-100 text-green-800" 
                        : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {content.published ? "Publicēts" : "Melnraksts"}
                    </span>
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
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editingIndex !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">
                  Rediģēt saturu
                </h3>
                <Button variant="ghost" onClick={() => cancelEdit(editingIndex)}>
                  ✕
                </Button>
              </div>

              <div className="space-y-6">

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Pamata informācija</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label>Nosaukums *</Label>
                      <Input
                        value={contents[editingIndex].title}
                        onChange={(e) => updateContent(editingIndex, "title", e.target.value)}
                        placeholder="Ieraksta nosaukums"
                        required
                      />
                    </div>

                    <div>
                      <Label>Tips *</Label>
                      <select
                        value={contents[editingIndex].type}
                        onChange={(e) => updateContent(editingIndex, "type", e.target.value as "EDUCATIONAL" | "VILLAGES")}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="EDUCATIONAL">Izglītojošais saturs</option>
                        <option value="VILLAGES">Ciemati</option>
                      </select>
                    </div>

                    <div>
                      <Label>Autors</Label>
                      <Input
                        value={contents[editingIndex].author}
                        onChange={(e) => updateContent(editingIndex, "author", e.target.value)}
                        placeholder="Autora vārds"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label>Īss apraksts *</Label>
                      <Textarea
                        value={contents[editingIndex].excerpt}
                        onChange={(e) => updateContent(editingIndex, "excerpt", e.target.value)}
                        placeholder="Īss apraksts, kas parādīsies sarakstā..."
                        rows={3}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label>Tagi</Label>
                      <Input
                        value={contents[editingIndex].tags}
                        onChange={(e) => updateContent(editingIndex, "tags", e.target.value)}
                        placeholder="tags, atdalīti, ar, komatu"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Galvenais saturs</h4>
                  
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
                    value={contents[editingIndex].content}
                    onChange={(e) => updateContent(editingIndex, "content", e.target.value)}
                    placeholder="Ieraksta saturs... Vari izmantot HTML tagus vai Markdown."
                    rows={15}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Atbalsta HTML un Markdown formatējumu. Izmanto toolbar pogas ātrai formatēšanai.
                  </p>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Mediji</h4>

                  {typeof contents[editingIndex].featuredImage === "string" && contents[editingIndex].featuredImage && (
                    <div className="mb-4">
                      <Label>Pašreizējais galvenais attēls</Label>
                      <div className="mt-2 flex items-center space-x-4">
                        <img
                          src={contents[editingIndex].featuredImage as string}
                          alt="Galvenais attēls"
                          className="w-32 h-32 object-cover rounded-lg border"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={removeCurrentFeaturedImage}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Noņemt
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="mb-6">
                    <Label>Mainīt galveno attēlu</Label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFeaturedImageChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {featuredImagePreview && (
                      <img
                        src={featuredImagePreview}
                        alt="Jauns galvenais attēls"
                        className="w-32 h-32 object-cover rounded-lg border mt-2"
                      />
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>YouTube video URL</Label>
                      <Input
                        type="url"
                        value={contents[editingIndex].videoUrl}
                        onChange={(e) => updateContent(editingIndex, "videoUrl", e.target.value)}
                        placeholder="https://www.youtube.com/embed/..."
                      />
                    </div>
                    <div>
                      <Label>Video fails</Label>
                      {typeof contents[editingIndex].videoFile === "string" && contents[editingIndex].videoFile && (
                        <div className="mb-2 flex items-center space-x-2">
                          <span className="text-sm text-gray-600">Pašreizējais: {(contents[editingIndex].videoFile as string).split('/').pop()}</span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={removeCurrentVideoFile}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="video/*"
                        onChange={handleVideoFileChange}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>


                      <div>
                        <Label>Papildu attēli</Label>
                        
                        {/* Esošie papildu attēli */}
                        {Array.isArray(contents[editingIndex].additionalImages) && 
                        typeof contents[editingIndex].additionalImages[0] === "string" &&
                        (contents[editingIndex].additionalImages as string[]).length > 0 && (
                          <div className="mb-4">
                            <h5 className="text-sm font-medium text-gray-700 mb-2">Pašreizējie papildu attēli:</h5>
                            <div className="grid grid-cols-4 gap-3">
                              {(contents[editingIndex].additionalImages as string[]).map((imageUrl, index) => (
                                <div key={index} className="relative">
                                  <img
                                    src={imageUrl}
                                    alt={`Papildu attēls ${index + 1}`}
                                    className="w-20 h-20 object-cover rounded-lg border"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      // Pievienot dzēšanas funkciju
                                      setImagesToDelete(prev => [...prev, imageUrl])
                                      const currentImages = contents[editingIndex].additionalImages as string[]
                                      const updatedImages = currentImages.filter((_, i) => i !== index)
                                      updateContent(editingIndex, "additionalImages", updatedImages)
                                    }}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs hover:bg-red-600 flex items-center justify-center"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Pievienot jaunus attēlus */}
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleAdditionalImagesChange}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">SEO</h4>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label>Meta nosaukums</Label>
                      <Input
                        value={contents[editingIndex].metaTitle}
                        onChange={(e) => updateContent(editingIndex, "metaTitle", e.target.value)}
                        placeholder="SEO nosaukums (ja tukšs, izmanto galveno nosaukumu)"
                      />
                    </div>
                    <div>
                      <Label>Meta apraksts</Label>
                      <Textarea
                        value={contents[editingIndex].metaDescription}
                        onChange={(e) => updateContent(editingIndex, "metaDescription", e.target.value)}
                        placeholder="SEO apraksts meklētājprogrammām"
                        rows={3}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Publikācija</h4>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={contents[editingIndex].published}
                      onChange={(e) => updateContent(editingIndex, "published", e.target.checked)}
                      id="published"
                    />
                    <Label htmlFor="published">Publicēts</Label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button variant="outline" onClick={() => cancelEdit(editingIndex)}>
                  Atcelt
                </Button>
                <Button onClick={() => handleSave(editingIndex)} disabled={saving}>
                  {saving ? "Saglabā..." : "Saglabāt"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}