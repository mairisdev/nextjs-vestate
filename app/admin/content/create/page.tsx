"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Textarea } from "../../../components/ui/textarea"
import { ArrowLeft, X } from "lucide-react"
import Link from "next/link"
import AlertMessage from "../../../components/ui/alert-message"

export default function CreateContent() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
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
  const [featuredImage, setFeaturedImage] = useState<File | null>(null)
  const [featuredImagePreview, setFeaturedImagePreview] = useState<string | null>(null)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [additionalImages, setAdditionalImages] = useState<File[]>([])
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState<string[]>([])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFeaturedImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFeaturedImage(file)
      const previewUrl = URL.createObjectURL(file)
      setFeaturedImagePreview(previewUrl)
    }
  }

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setVideoFile(file)
    }
  }

  const handleAdditionalImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length + additionalImages.length > 10) {
      setErrorMessage("Maksimums 10 papildu attēli")
      return
    }
    
    setAdditionalImages(prev => [...prev, ...files])
    
    const newPreviews = files.map(file => URL.createObjectURL(file))
    setAdditionalImagePreviews(prev => [...prev, ...newPreviews])
  }

  const removeAdditionalImage = (index: number) => {
    setAdditionalImages(prev => prev.filter((_, i) => i !== index))
    setAdditionalImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  // Rich text helpers
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
    
    // Restore cursor position
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
    setLoading(true)
    setErrorMessage(null)

    if (!formData.title.trim()) {
      setErrorMessage("Nosaukums ir obligāts")
      setLoading(false)
      return
    }

    if (!formData.excerpt.trim()) {
      setErrorMessage("Apraksts ir obligāts")
      setLoading(false)
      return
    }

    try {
      const formDataToSend = new FormData()
      
      // Text fields
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, String(value))
      })

      // Featured image
      if (featuredImage) {
        formDataToSend.append("featuredImage", featuredImage)
      }

      // Video file
      if (videoFile) {
        formDataToSend.append("videoFile", videoFile)
      }

      // Additional images
      additionalImages.forEach((image, index) => {
        formDataToSend.append(`additionalImage${index}`, image)
      })

      const res = await fetch("/api/content", {
        method: "POST",
        body: formDataToSend
      })

      const responseData = await res.json()

      if (res.ok) {
        setSuccessMessage("Saturs izveidots veiksmīgi!")
        setTimeout(() => {
          router.push("/admin/content")
        }, 1500)
      } else {
        setErrorMessage(responseData.error || "Kļūda izveidojot saturu")
      }
    } catch (error) {
      console.error("Submit error:", error)
      setErrorMessage("Kļūda izveidojot saturu")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-10">
      <div className="flex items-center space-x-4">
        <Link href="/admin/content">
          <Button variant="outline" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <h2 className="text-2xl font-bold">Pievienot jaunu saturu</h2>
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
            <Button type="button" size="sm" variant="outline" onClick={() => insertText("**", "**")}>
              B
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => insertText("*", "*")}>
              I
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => insertText("# ")}>
              H1
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => insertText("## ")}>
              H2
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={insertLink}>
              Link
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={insertImage}>
              Img
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => insertText("- ")}>
              List
            </Button>
          </div>

          <Textarea
            ref={contentRef}
            value={formData.content}
            onChange={(e) => handleInputChange('content', e.target.value)}
            placeholder="Ieraksta saturs... Vari izmantot HTML tagus vai Markdown."
            rows={20}
            className="font-mono text-sm"
          />
          
          <p className="text-sm text-gray-500 mt-2">
            Atbalsta HTML un Markdown formatējumu. Izmanto toolbar pogas ātrai formatēšanai.
          </p>
        </div>

        {/* Media */}
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Mediji</h3>
          
          {/* Featured Image */}
          <div className="mb-6">
            <Label>Galvenais attēls</Label>
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
                    alt="Galvenais attēls"
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
              <Label>Vai augšupielādēt video failu</Label>
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
          </div>

          {/* Additional Images */}
          <div>
            <Label>Papildu attēli (max 10)</Label>
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
                        alt={`Papildu attēls ${index + 1}`}
                        className="w-20 h-20 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => removeAdditionalImage(index)}
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
            <Label htmlFor="published">Publicēt uzreiz</Label>
          </div>
        </div>

        {/* Submit buttons */}
        <div className="flex space-x-4">
          <Button type="submit" disabled={loading}>
            {loading ? "Saglabā..." : "Izveidot saturu"}
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