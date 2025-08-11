"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Textarea } from "../../../components/ui/textarea"
import { ArrowLeft, X, Edit, Trash, Plus } from "lucide-react"
import Link from "next/link"
import AlertMessage from "../../../components/ui/alert-message"

type ContentItem = {
  id?: string
  title: string
  excerpt: string
  content: string
  type: "EDUCATIONAL" | "VILLAGES" | "BLOG"
  published: boolean
  videoUrl: string
  author: string
  tags: string
  metaTitle: string
  metaDescription: string
  featuredImage: File | null
  videoFile: File | null
  additionalImages: File[]
}

export default function CreateContent() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const contentRef = useRef<HTMLTextAreaElement>(null)

  const [contents, setContents] = useState<ContentItem[]>([])

  // File preview states
  const [featuredImagePreviews, setFeaturedImagePreviews] = useState<(string | null)[]>([])
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState<string[][]>([])

  const updateContent = <K extends keyof ContentItem>(i: number, field: K, value: ContentItem[K]) => {
    const copy = [...contents]
    copy[i] = { ...copy[i], [field]: value }
    setContents(copy)
  }

  const addContent = () => {
    const newContent: ContentItem = {
      title: "",
      excerpt: "",
      content: "",
      type: "BLOG",
      published: false,
      videoUrl: "",
      author: "",
      tags: "",
      metaTitle: "",
      metaDescription: "",
      featuredImage: null,
      videoFile: null,
      additionalImages: []
    }
    
    setContents([...contents, newContent])
    setFeaturedImagePreviews([...featuredImagePreviews, null])
    setAdditionalImagePreviews([...additionalImagePreviews, []])
    setIsCreating(true)
    setEditingIndex(contents.length)
  }

  const removeContent = (i: number) => {
    if (!confirm("Vai tiešām dzēst šo saturu?")) return
    
    setContents(contents.filter((_, idx) => idx !== i))
    setFeaturedImagePreviews(featuredImagePreviews.filter((_, idx) => idx !== i))
    setAdditionalImagePreviews(additionalImagePreviews.filter((_, idx) => idx !== i))
    setEditingIndex(null)
  }

  const cancelEdit = (contentIndex: number) => {
    if (isCreating) {
      // Remove the content being created
      setContents(contents.filter((_, idx) => idx !== contentIndex))
      setFeaturedImagePreviews(featuredImagePreviews.filter((_, idx) => idx !== contentIndex))
      setAdditionalImagePreviews(additionalImagePreviews.filter((_, idx) => idx !== contentIndex))
      setIsCreating(false)
    }
    setEditingIndex(null)
  }

  const startEdit = (index: number) => {
    setEditingIndex(index)
    setIsCreating(false)
  }

  // Funkcija file size formatēšanai
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleFeaturedImageChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validē izmēru pirms upload (3MB)
      if (file.size > 5 * 1024 * 1024) {
        setAlert({ type: "error", message: `Galvenais attēls pārāk liels (${formatFileSize(file.size)}). Maksimums 5MB.` })
        e.target.value = '' // Clear input
        return
      }
      
      // Validē faila tipu
      if (!file.type.startsWith('image/')) {
        setAlert({ type: "error", message: "Lūdzu, izvēlieties attēla failu" })
        e.target.value = ''
        return
      }
      
      updateContent(index, "featuredImage", file)
      const previewUrl = URL.createObjectURL(file)
      const newPreviews = [...featuredImagePreviews]
      newPreviews[index] = previewUrl
      setFeaturedImagePreviews(newPreviews)
      
      // Clear any previous errors
      setAlert(null)
    }
  }

const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
  const file = e.target.files?.[0]
  if (file) {
    // Validē izmēru pirms upload (20MB)
    if (file.size > 20 * 1024 * 1024) {
      setAlert({ type: "error", message: `Video fails pārāk liels (${formatFileSize(file.size)}). Maksimums 20MB.` })
      e.target.value = ''
      return
    }
    
    // Validē faila tipu
    if (!file.type.startsWith('video/')) {
      setAlert({ type: "error", message: "Lūdzu, izvēlieties video failu" })
      e.target.value = ''
      return
    }
    
    updateContent(index, "videoFile", file)
    setAlert(null)
  }
}

  const handleAdditionalImagesChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const files = Array.from(e.target.files || [])
    const currentAdditionalImages = contents[index].additionalImages
    
    // Validē file count
    if (files.length + currentAdditionalImages.length > 8) {
      setAlert({ type: "error", message: "Maksimums 8 papildu attēli" })
      e.target.value = ''
      return
    }
    
    // Validē katru failu
    const validFiles: File[] = []
    let totalSize = 0
    
    for (const file of files) {
      // Validē faila tipu
      if (!file.type.startsWith('image/')) {
        setAlert({ type: "error", message: `Fails "${file.name}" nav attēls` })
        e.target.value = ''
        return
      }
      
      // Validē individuālo izmēru (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setAlert({ type: "error", message: `Attēls "${file.name}" pārāk liels (${formatFileSize(file.size)}). Maksimums 5MB katram.` })
        e.target.value = ''
        return
      }
      
      validFiles.push(file)
      totalSize += file.size
    }
    
    // Aprēķinām kopējo izmēru ar esošajiem failiem
    const existingSize = currentAdditionalImages.reduce((acc, file) => acc + file.size, 0)
    if (totalSize + existingSize > 40 * 1024 * 1024) {
      setAlert({ type: "error", message: `Papildu attēli kopā pārāk lieli (${formatFileSize(totalSize + existingSize)}). Maksimums 40MB kopā.` })
      e.target.value = ''
      return
    }
    
    updateContent(index, "additionalImages", [...currentAdditionalImages, ...validFiles])
    
    const newPreviews = validFiles.map(file => URL.createObjectURL(file))
    const currentPreviews = additionalImagePreviews[index] || []
    const updatedPreviews = [...additionalImagePreviews]
    updatedPreviews[index] = [...currentPreviews, ...newPreviews]
    setAdditionalImagePreviews(updatedPreviews)
    
    setAlert(null)
  }

  const removeAdditionalImage = (contentIndex: number, imageIndex: number) => {
    const content = contents[contentIndex]
    const newImages = content.additionalImages.filter((_, i) => i !== imageIndex)
    updateContent(contentIndex, "additionalImages", newImages)
    
    const newPreviews = [...additionalImagePreviews]
    newPreviews[contentIndex] = newPreviews[contentIndex].filter((_, i) => i !== imageIndex)
    setAdditionalImagePreviews(newPreviews)
  }

  // Rich text helpers
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

// Nomainīt handleSave funkciju:
const handleSave = async (contentIndex: number) => {
  setAlert(null)
  setLoading(true)
  const content = contents[contentIndex]

   const totalFiles = [
    content.featuredImage,
    content.videoFile,
    ...content.additionalImages
  ].filter(Boolean).length

  if (totalFiles > 0) {
    setAlert({ 
      type: "success", 
      message: `Augšupielādē ${totalFiles} ${totalFiles === 1 ? 'failu' : 'failus'}...` 
    })
  }

  if (!content.title.trim()) {
    setAlert({ type: "error", message: "Nosaukums ir obligāts" })
    setLoading(false)
    return
  }

  if (!content.excerpt.trim()) {
    setAlert({ type: "error", message: "Apraksts ir obligāts" })
    setLoading(false)
    return
  }

  // Aprēķini kopējo failu izmēru
  let totalSize = 0
  if (content.featuredImage) totalSize += content.featuredImage.size
  if (content.videoFile) totalSize += content.videoFile.size
  content.additionalImages.forEach(img => totalSize += img.size)
  
  console.log(`📊 Total upload size: ${formatFileSize(totalSize)}`)

  try {
    const formData = new FormData()
    
    // Text fields
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

    // Featured image
    if (content.featuredImage) {
      formData.append("featuredImage", content.featuredImage)
    }

    // Video file
    if (content.videoFile) {
      formData.append("videoFile", content.videoFile)
    }

    // Additional images
    content.additionalImages.forEach((image, index) => {
      formData.append(`additionalImage${index}`, image)
    })

    console.log('📤 Uploading content...')
    setAlert({ type: "success", message: "Augšupielādē saturu..." }) // Progress message

    const res = await fetch("/api/content", {
      method: "POST",
      body: formData
    })

    if (res.ok) {
      const savedContent = await res.json()
      setAlert({ type: "success", message: "Saturs izveidots veiksmīgi!" })
      const copy = [...contents]
      copy[contentIndex] = { ...copy[contentIndex], id: savedContent.id }
      setContents(copy)
      
      setTimeout(() => {
        setEditingIndex(null)
        setIsCreating(false)
        router.push("/admin/content")
      }, 1500)
    } else {
      const responseData = await res.json()
      console.error('API Error Response:', responseData)
      
      // Show specific error message from API
      const errorMessage = responseData.error || 
        (res.status === 413 ? "Faili pārāk lieli - samaziniet attēlu izmērus" : "Kļūda izveidojot saturu")
      
      setAlert({ type: "error", message: errorMessage })
    }
    } catch (error) {
      console.error("Upload error:", error)
      setAlert({ type: "error", message: "Kļūda augšupielādējot saturu" })
    } finally {
      setLoading(false)
    }
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
          <h2 className="text-2xl font-bold">Pievienot jaunu saturu</h2>
        </div>
        <Button onClick={addContent} disabled={editingIndex !== null}>
          <Plus className="w-4 h-4 mr-2" />
          Pievienot saturu
        </Button>
      </div>

      {alert && (
        <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
      )}

      {/* Content table */}
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
                      {featuredImagePreviews[i] && (
                        <img
                          src={featuredImagePreviews[i]!}
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
                    {content.type === "EDUCATIONAL" ? "Izglītojošais" : content.type === "VILLAGES" ? "Ciemati" : "Blog"}
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
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => removeContent(i)}
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

      {contents.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Nav pievienots saturs.</p>
          <p className="text-gray-400 text-sm mt-2">Pievienojiet jaunu saturu, lai sāktu.</p>
        </div>
      )}

      {/* Editing modal */}
      {editingIndex !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">
                  {isCreating ? "Jauns saturs" : "Rediģēt saturu"}
                </h3>
                <Button variant="ghost" onClick={() => cancelEdit(editingIndex)}>
                  ✕
                </Button>
              </div>

              {/* Alert inside modal */}
              {alert && (
                <AlertMessage 
                  type={alert.type} 
                  message={alert.message} 
                  onClose={() => setAlert(null)} 
                />
              )}

              <div className="space-y-6">
                {/* Pamata informācija */}
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
                      <Label htmlFor="type">Satura tips</Label>
                      <select
                       id="type"
                       value={contents[editingIndex]?.type || "EDUCATIONAL"}
                       onChange={(e) => updateContent(editingIndex!, "type", e.target.value as "EDUCATIONAL" | "VILLAGES" | "BLOG")}
                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                     >
                       <option value="EDUCATIONAL">Izglītojošais saturs</option>
                       <option value="VILLAGES">Ciemati</option>
                       <option value="BLOG">Blog ieraksts</option>
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
                       required
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

               {/* Galvenais saturs */}
               <div className="space-y-4">
                 <h4 className="font-medium text-gray-900">Galvenais saturs</h4>
                 
                 {/* Formatting toolbar */}
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

               {/* Media section ar uzlabotām validācijām */}
               <div className="space-y-4">
                 <h4 className="font-medium text-gray-900">Mediji</h4>
                 
                 {/* Featured Image */}
                 <div className="mb-6">
                   <Label>Galvenais attēls (max 5MB)</Label>
                   <input
                     type="file"
                     accept="image/*"
                     onChange={(e) => handleFeaturedImageChange(e, editingIndex)}
                     className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                   />
                   {contents[editingIndex].featuredImage && (
                     <div className="mt-2 text-sm text-gray-600">
                       📁 {contents[editingIndex].featuredImage!.name} ({formatFileSize(contents[editingIndex].featuredImage!.size)})
                     </div>
                   )}
                   {featuredImagePreviews[editingIndex] && (
                     <img
                       src={featuredImagePreviews[editingIndex]!}
                       alt="Galvenais attēls"
                       className="w-32 h-32 object-cover rounded-lg border mt-2"
                     />
                   )}
                 </div>

                 {/* Video */}
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
                     <Label>Video fails (max 30MB)</Label>
                     <input
                       type="file"
                       accept="video/*"
                       onChange={(e) => handleVideoFileChange(e, editingIndex)}
                       className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                     />
                     {contents[editingIndex].videoFile && (
                       <div className="mt-2 text-sm text-gray-600">
                         🎥 {contents[editingIndex].videoFile!.name} ({formatFileSize(contents[editingIndex].videoFile!.size)})
                       </div>
                     )}
                   </div>
                 </div>

                 {/* Additional Images */}
                 <div>
                   <Label>Papildu attēli (max 8 faili, 5MB katrs, 40MB kopā)</Label>
                   <input
                     type="file"
                     accept="image/*"
                     multiple
                     onChange={(e) => handleAdditionalImagesChange(e, editingIndex)}
                     className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                   />
                   
                   {/* File size summary */}
                   {contents[editingIndex].additionalImages.length > 0 && (
                     <div className="mt-2 text-sm text-gray-600">
                       📊 {contents[editingIndex].additionalImages.length} faili, kopā: {formatFileSize(
                         contents[editingIndex].additionalImages.reduce((acc, file) => acc + file.size, 0)
                       )}
                     </div>
                   )}
                   
                   {additionalImagePreviews[editingIndex] && additionalImagePreviews[editingIndex].length > 0 && (
                     <div className="mt-3 grid grid-cols-4 gap-3">
                       {additionalImagePreviews[editingIndex].map((preview, imageIndex) => (
                         <div key={imageIndex} className="relative">
                           <img
                             src={preview}
                             alt={`Papildu attēls ${imageIndex + 1}`}
                             className="w-20 h-20 object-cover rounded-lg border"
                           />
                           <button
                             type="button"
                             onClick={() => removeAdditionalImage(editingIndex, imageIndex)}
                             className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs hover:bg-red-600 flex items-center justify-center"
                           >
                             <X className="w-3 h-3" />
                           </button>
                           <div className="absolute bottom-0 left-0 right-0 bg-black/75 text-white text-xs p-1 rounded-b-lg">
                             {formatFileSize(contents[editingIndex].additionalImages[imageIndex]?.size || 0)}
                           </div>
                         </div>
                       ))}
                     </div>
                   )}
                 </div>
               </div>

               {/* SEO */}
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

               {/* Publikācijas opcijas */}
               <div className="space-y-4">
                 <h4 className="font-medium text-gray-900">Publikācija</h4>
                 <div className="flex items-center space-x-2">
                   <input
                     type="checkbox"
                     checked={contents[editingIndex].published}
                     onChange={(e) => updateContent(editingIndex, "published", e.target.checked)}
                     id="published"
                   />
                   <Label htmlFor="published">Publicēt uzreiz</Label>
                 </div>
               </div>
             </div>

             <div className="flex justify-end space-x-3 pt-4 border-t">
               <Button variant="outline" onClick={() => cancelEdit(editingIndex)}>
                 Atcelt
               </Button>
               <Button onClick={() => handleSave(editingIndex)} disabled={loading}>
                 {loading ? "Saglabā..." : "Saglabāt"}
               </Button>
             </div>
           </div>
         </div>
       </div>
     )}
   </div>
 )
}