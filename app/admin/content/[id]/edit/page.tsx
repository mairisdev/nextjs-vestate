"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "../../../../components/ui/button"
import { Input } from "../../../../components/ui/input"
import { Label } from "../../../../components/ui/label"
import { Textarea } from "../../../../components/ui/textarea"
import { ArrowLeft, X } from "lucide-react"
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

export default function EditContent({ params }: EditContentProps) {
  const router = useRouter()
  const [contentId, setContentId] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const contentRef = useRef<HTMLTextAreaElement>(null)

  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    type: "EDUCATIONAL",
    published: false,
    videoUrl: "",
    author: "",
    tags: "",
    metaTitle: "",
    metaDescription: "",
  })

  // File states
  const [currentFeaturedImage, setCurrentFeaturedImage] = useState<string | null>(null)
  const [currentVideoFile, setCurrentVideoFile] = useState<string | null>(null)
  const [currentAdditionalImages, setCurrentAdditionalImages] = useState<string[]>([])
  
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
        setErrorMessage("Saturs nav atrasts")
        return
      }
      
      const content: Content = await res.json()
      
      setFormData({
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
      })

      setCurrentFeaturedImage(content.featuredImage)
      setCurrentVideoFile(content.videoFile)
      setCurrentAdditionalImages(content.images)
    } catch (error) {
      setErrorMessage("Neizdevās ielādēt saturu")
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
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
    if (files.length + newAdditionalImages.length + currentAdditionalImages.length > 10) {
      setErrorMessage("Maksimums 10 papildu attēli")
      return
    }
    
    setNewAdditionalImages(prev => [...prev, ...files])
    
    const newPreviews = files.map(file => URL.createObjectURL(file))
    setAdditionalImagePreviews(prev => [...prev, ...newPreviews])
  }

  const removeCurrentFeaturedImage = () => {
    if (currentFeaturedImage) {
      setImagesToDelete(prev => [...prev, currentFeaturedImage])
    }
    setCurrentFeaturedImage(null)
  }

  const removeCurrentAdditionalImage = (imagePath: string) => {
    setImagesToDelete(prev => [...prev, imagePath])
    setCurrentAdditionalImages(prev => prev.filter(img => img !== imagePath))
  }

  const removeNewAdditionalImage = (index: number) => {
    setNewAdditionalImages(prev => prev.filter((_, i) => i !== index))
    setAdditionalImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const removeCurrentVideoFile = () => {
    if (currentVideoFile) {
      setImagesToDelete(prev => [...prev, currentVideoFile])
    }
    setCurrentVideoFile(null)
  }

  // Rich text helpers (same as create form)
  const insertText = (before: string, after: string = "") => {
    const textarea = contentRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = formData.content.substring(start, end)
    const newText = 
      formData.content.substring(0, start) + 
      before + selectedText + after + 
      formData.content.substring(end)
    
    setFormData(prev => ({ ...prev, content: newText }))
    
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setErrorMessage(null)

    if (!formData.title.trim()) {
      setErrorMessage("Nosaukums ir obligāts")
      setSaving(false)
      return
    }

    try {
      const formDataToSend = new FormData()
      
      // Add ID for update
      formDataToSend.append("id", contentId)
      
      // Text fields
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, String(value))
      })

      // Current media that should remain
      formDataToSend.append("existingFeaturedImage", currentFeaturedImage || "")
      formDataToSend.append("existingVideoFile", currentVideoFile || "")
      formDataToSend.append("existingAdditionalImages", JSON.stringify(currentAdditionalImages))

      // Files to delete
      formDataToSend.append("imagesToDelete", JSON.stringify(imagesToDelete))

      // New files
      if (newFeaturedImage) {
        formDataToSend.append("featuredImage", newFeaturedImage)
      }

      if (newVideoFile) {
        formDataToSend.append("videoFile", newVideoFile)
      }

      newAdditionalImages.forEach((image, index) => {
        formDataToSend.append(`additionalImage${index}`, image)
      })

      const res = await fetch("/api/content", {
        method: "POST",
        body: formDataToSend
      })

      const responseData = await res.json()

      if (res.ok) {
        setSuccessMessage("Saturs atjaunināts veiksmīgi!")
        setTimeout(() => {
          router.push("/admin/content")
        }, 1500)
      } else {
        setErrorMessage(responseData.error || "Kļūda atjauninot saturu")
      }
    } catch (error) {
      console.error("Submit error:", error)
      setErrorMessage("Kļūda atjauninot saturu")
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
    <div className="space-y-6 max-w-4xl mx-auto py-10">
      <div className="flex items-center space-x-4">
        <Link href="/admin/content">
          <Button variant="outline" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <h2 className="text-2xl font-bold">Rediģēt saturu</h2>
      </div>

      {successMessage && <AlertMessage type="success" message={successMessage} />}
      {errorMessage && <AlertMessage type="error" message={errorMessage} />}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Pamata informācija */}
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Pamata informācija</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label>Nosaukums *</Label>
              <Input
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Ieraksta nosaukums"
                required
              />
            </div>

            <div>
              <Label>Tips *</Label>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="EDUCATIONAL">Izglītojošais saturs</option>
                <option value="VILLAGES">Ciemati</option>
              </select>
            </div>

            <div>
              <Label>Autors</Label>
              <Input
                value={formData.author}
                onChange={(e) => handleInputChange('author', e.target.value)}
                placeholder="Autora vārds"
              />
            </div>

            <div className="md:col-span-2">
              <Label>Īss apraksts *</Label>
              <Textarea
                value={formData.excerpt}
                onChange={(e) => handleInputChange('excerpt', e.target.value)}
                placeholder="Īss apraksts, kas parādīsies sarakstā..."
                rows={3}
                required
              />
            </div>

            <div className="md:col-span-2">
              <Label>Tagi</Label>
              <Input
                value={formData.tags}
                onChange={(e) => handleInputChange('tags', e.target.value)}
                placeholder="tags, atdalīti, ar, komatu"
              />
            </div>
          </div>
        </div>

        {/* Galvenais saturs */}
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Galvenais saturs</h3>
          
          {/* Formatting toolbar */}
          <div className="flex flex-wrap gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
            <Button type="button" size="sm" variant="outline" onClick={() => insertText("**", "**")}>B</Button>
            <Button type="button" size="sm" variant="outline" onClick={() => insertText("*", "*")}>I</Button>
            <Button type="button" size="sm" variant="outline" onClick={() => insertText("# ")}>H1</Button>
            <Button type="button" size="sm" variant="outline" onClick={() => insertText("## ")}>H2</Button>
            <Button type="button" size="sm" variant="outline" onClick={insertLink}>Link</Button>
            <Button type="button" size="sm" variant="outline" onClick={insertImage}>Img</Button>
            <Button type="button" size="sm" variant="outline" onClick={() => insertText("- ")}>List</Button>
          </div>

          <Textarea
            ref={contentRef}
            value={formData.content}
            onChange={(e) => handleInputChange('content', e.target.value)}
            placeholder="Ieraksta saturs... Vari izmantot HTML tagus vai Markdown."
            rows={20}
            className="font-mono text-sm"
          />
        </div>

        {/* Media */}
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Mediji</h3>
          
          {/* Current Featured Image */}
          {currentFeaturedImage && (
            <div className="mb-4">
              <Label>Pašreizējais galvenais attēls</Label>
              <div className="mt-2 flex items-center space-x-4">
                <img
                  src={currentFeaturedImage}
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

          {/* New Featured Image */}
          <div className="mb-6">
            <Label>Mainīt galveno attēlu</Label>
            <div className="mt-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleFeaturedImageChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {featuredImagePreview && (
                <div className="mt-3">
                  <img
                    src={featuredImagePreview}
                    alt="Jauns galvenais attēls"
                    className="w-32 h-32 object-cover rounded-lg border"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Video */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>YouTube video URL</Label>
              <Input
                type="url"
                value={formData.videoUrl}
                onChange={(e) => handleInputChange('videoUrl', e.target.value)}
                placeholder="https://www.youtube.com/embed/..."
              />
            </div>
            <div>
              <Label>Video fails</Label>
              {currentVideoFile && (
                <div className="mb-2 flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Pašreizējais: {currentVideoFile.split('/').pop()}</span>
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
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
          </div>

          {/* Current Additional Images */}
          {currentAdditionalImages.length > 0 && (
            <div className="mb-4">
              <Label>Pašreizējie papildu attēli</Label>
              <div className="mt-2 grid grid-cols-4 gap-3">
                {currentAdditionalImages.map((imagePath, index) => (
                  <div key={index} className="relative">
                    <img
                      src={imagePath}
                      alt={`Papildu attēls ${index + 1}`}
                      className="w-20 h-20 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => removeCurrentAdditionalImage(imagePath)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs hover:bg-red-600"
                    >
                      <X className="w-3 h-3 mx-auto" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Additional Images */}
          <div>
            <Label>Pievienot papildu attēlus</Label>
            <div className="mt-2">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleAdditionalImagesChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {additionalImagePreviews.length > 0 && (
                <div className="mt-3 grid grid-cols-4 gap-3">
                  {additionalImagePreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt={`Jauns papildu attēls ${index + 1}`}
                        className="w-20 h-20 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => removeNewAdditionalImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs hover:bg-red-600"
                      >
                        <X className="w-3 h-3 mx-auto" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SEO */}
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">SEO</h3>
          
          <div className="space-y-4">
            <div>
              <Label>Meta nosaukums</Label>
              <Input
                value={formData.metaTitle}
                onChange={(e) => handleInputChange('metaTitle', e.target.value)}
                placeholder="SEO nosaukums (ja tukšs, izmanto galveno nosaukumu)"
              />
            </div>
            <div>
              <Label>Meta apraksts</Label>
              <Textarea
                value={formData.metaDescription}
                onChange={(e) => handleInputChange('metaDescription', e.target.value)}
                placeholder="SEO apraksts meklētājprogrammām"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Publikācijas opcijas */}
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Publikācija</h3>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.published}
              onChange={(e) => handleInputChange('published', e.target.checked)}
              id="published"
            />
            <Label htmlFor="published">Publicēts</Label>
          </div>
        </div>

        {/* Submit buttons */}
        <div className="flex space-x-4">
          <Button type="submit" disabled={saving}>
            {saving ? "Saglabā..." : "Atjaunināt saturu"}
          </Button>
          <Link href="/admin/content">
            <Button type="button" variant="outline">
              Atcelt
            </Button>
          </Link>
        </div>
      </form>
    </div>
  )
}