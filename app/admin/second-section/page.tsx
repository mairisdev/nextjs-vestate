"use client"

import { useEffect, useState } from "react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import { Plus, Trash, Info } from "lucide-react"
import AlertMessage from "../../components/ui/alert-message"

export default function SecondSectionSettings() {
  const [image, setImage] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState<string>("")
  const [heading, setHeading] = useState("")
  const [reasons, setReasons] = useState<string[]>([])
  const [showSuccess, setShowSuccess] = useState(false)
  const [showError, setShowError] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/second-section")
      if (!res.ok) return

      const data = await res.json()
      if (data) {
        setHeading(data.heading || "")
        setImageUrl(data.imageUrl || "")
        setReasons(Array.isArray(data.reasons) ? data.reasons : [])
      }
    }

    fetchData()
  }, [])

  const handleReasonChange = (index: number, value: string) => {
    const updated = [...reasons]
    updated[index] = value
    setReasons(updated)
  }

  const addReason = () => setReasons([...reasons, ""])
  const removeReason = (index: number) => setReasons(reasons.filter((_, i) => i !== index))

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validēt faila tipu
      if (!file.type.startsWith('image/')) {
        setShowError(true)
        return
      }
      
      // Validēt faila izmēru (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setShowError(true)
        return
      }
      
      setImage(file)
      setShowError(false)
    }
  }

  const handleSave = async () => {
    setIsUploading(true)
    setShowError(false)
    setShowSuccess(false)

    let finalImageUrl = imageUrl

    if (image) {
      try {
        const form = new FormData()
        form.append("image", image)
        form.append("title", heading)
        form.append("type", "second-section")

        const res = await fetch("/api/upload-image", {
          method: "POST",
          body: form,
        })

        const data = await res.json()
        
        if (res.ok) {
          finalImageUrl = data.imageUrl
          setImageUrl(finalImageUrl)
          setImage(null) // Clear selected file after successful upload
        } else {
          throw new Error(data.error || 'Upload failed')
        }
      } catch (error) {
        console.error('Image upload error:', error)
        setShowError(true)
        setIsUploading(false)
        return
      }
    }

    try {
      const saveRes = await fetch("/api/second-section", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          heading,
          imageUrl: finalImageUrl,
          reasons,
        }),
      })

      if (saveRes.ok) {
        setShowSuccess(true)
      } else {
        setShowError(true)
      }
    } catch (error) {
      setShowError(true)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-10">
      <h2 className="text-2xl font-bold text-[#00332D]">Otrās sadaļas iestatījumi</h2>

      {showSuccess && (
        <AlertMessage 
          type="success" 
          message="Saglabāts veiksmīgi!" 
          onClose={() => setShowSuccess(false)} 
        />
      )}
      {showError && (
        <AlertMessage 
          type="error" 
          message="Saglabāšanas kļūda! Pārbaudiet, vai attēls ir pareizā formātā un mazāks par 10MB." 
          onClose={() => setShowError(false)} 
        />
      )}

      {/* Virsraksts */}
      <div className="space-y-2">
        <Label>Sadaļas virsraksts</Label>
        <Textarea
          rows={2}
          value={heading}
          onChange={(e) => setHeading(e.target.value)}
          placeholder="Piemēram: Galvenie iemesli kāpēc cilvēki izvēlas uzticēt īpašuma pārdošanu speciālistam"
        />
      </div>

      {/* Attēla augšupielāde ar uzlabotu informāciju */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Label>Sadaļas attēls</Label>
          <div className="group relative">
            <Info className="w-4 h-4 text-gray-400 cursor-help" />
            <div className="absolute left-0 top-6 w-80 p-3 bg-gray-900 text-white text-xs rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
              <strong>Attēla optimizācija:</strong><br/>
              • Izmērs: līdz 800x600px<br/>
              • Crop: 'limit' (saglabā proporcijas)<br/>
              • Kvalitāte: automātiska optimizācija<br/>
              • Formāts: automātiska konvertēšana<br/>
              <em>Attēls netiks apgriezts, tikai samazināts, ja nepieciešams</em>
            </div>
          </div>
        </div>

        {/* Pašreizējais attēls */}
        {imageUrl && (
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Pašreizējais attēls:</p>
            <img
              src={imageUrl}
              alt="Sadaļas attēls"
              className="w-full max-w-md rounded-lg border border-gray-200"
            />
          </div>
        )}

        {/* Jauna attēla izvēle */}
        <div className="space-y-2">
          <label
            htmlFor="image-upload"
            className="block w-full max-w-md px-4 py-6 text-center text-sm font-medium text-[#00332D] bg-white border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-[#77D4B4] transition-colors"
          >
            <div className="space-y-2">
              <div className="text-lg">📸</div>
              <div>
                {image ? (
                  <span className="text-green-600 font-medium">
                    Izvēlēts: {image.name}
                  </span>
                ) : (
                  <span>Noklikšķiniet, lai izvēlētos jaunu attēlu</span>
                )}
              </div>
              <div className="text-xs text-gray-500">
                PNG, JPG, WEBP (maks. 10MB)
              </div>
            </div>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="sr-only"
            />
          </label>
        </div>

        {/* Attēla informācija */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <h4 className="font-medium text-blue-900 mb-1">Attēla optimizācijas iestatījumi</h4>
              <ul className="text-blue-800 space-y-1">
                <li>• <strong>Maksimālais izmērs:</strong> 800x600 pikseļi</li>
                <li>• <strong>Apgriešana:</strong> Nav (saglabā oriģinālās proporcijas)</li>
                <li>• <strong>Kvalitāte:</strong> Automātiska optimizācija</li>
                <li>• <strong>Formāts:</strong> Automātiska konvertēšana (WebP, AVIF)</li>
              </ul>
              <p className="text-blue-700 mt-2 font-medium">
                ✅ Jūsu attēls netiks apgriezts, tikai optimizēts ātrākai ielādei!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Iemesli */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Iemesli (numurēts saraksts)</Label>
          <Button
            type="button"
            onClick={addReason}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Pievienot iemeslu
          </Button>
        </div>

        {reasons.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-gray-500 mb-4">Nav pievienotu iemeslu</p>
            <Button
              type="button"
              onClick={addReason}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Pievienot pirmo iemeslu
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {reasons.map((reason, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-8 h-8 flex items-center justify-center bg-[#77D4B4] text-white rounded-full text-sm font-bold mt-1">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <Textarea
                    value={reason}
                    onChange={(e) => handleReasonChange(index, e.target.value)}
                    placeholder={`${index + 1}. iemesls...`}
                    rows={2}
                    className="resize-none"
                  />
                </div>
                <Button
                  type="button"
                  onClick={() => removeReason(index)}
                  variant="ghost"
                  size="icon"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 mt-1"
                >
                  <Trash className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Saglabāt poga */}
      <div className="flex justify-end pt-6">
        <Button 
          onClick={handleSave} 
          disabled={isUploading}
          className="min-w-[120px]"
        >
          {isUploading ? "Saglabā..." : "Saglabāt izmaiņas"}
        </Button>
      </div>
    </div>
  )
}