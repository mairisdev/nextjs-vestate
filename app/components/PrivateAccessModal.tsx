"use client"

import { useState } from "react"
import { X, Mail, Phone, Key, Lock, CheckCircle } from "lucide-react"

interface PrivateAccessModalProps {
  onClose: () => void
  propertyId: string
}

export default function PrivateAccessModal({ onClose, propertyId }: PrivateAccessModalProps) {
  const [step, setStep] = useState<'request' | 'verify' | 'success'>('request')
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Validācija
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    const isPhoneValid = /^\+?\d{8,15}$/.test(phone)
    
    if (!isEmailValid || !isPhoneValid) {
      setError("Lūdzu ievadiet derīgu e-pastu un tālruņa numuru!")
      setLoading(false)
      return
    }

    try {
      const response = await fetch("/api/access-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email, 
          phone,
          propertyId // Pievienojam īpašuma ID
        }),
      })

      if (response.ok) {
        setStep('verify')
      } else {
        const data = await response.json()
        setError(data.error || "Kļūda pieprasot piekļuvi")
      }
    } catch (err) {
      setError("Kļūda pieprasot piekļuvi")
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (code.length !== 6) {
      setError("Lūdzu ievadiet 6 ciparu kodu!")
      setLoading(false)
      return
    }

    try {
      const response = await fetch("/api/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      })

      if (response.ok) {
        const data = await response.json()
        setStep('success')
        
        // Saglabājam piekļuvi localStorage
        localStorage.setItem("private_access_email", email)
        localStorage.setItem("private_access_valid_until", data.valid_for?.toString() || "")
        
        // Pēc 2 sekundēm aizveram modāli un pārlādējam lapu
        setTimeout(() => {
          onClose()
          window.location.reload()
        }, 2000)
      } else {
        const data = await response.json()
        setError(data.error || "Nepareizs kods!")
      }
    } catch (err) {
      setError("Kļūda verificējot kodu")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl relative">
        {/* Aizvērt poga */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Request step */}
        {step === 'request' && (
          <div>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-[#00332D] mb-2">
                Privāts sludinājums
              </h2>
              <p className="text-gray-600">
                Lai skatītu šo sludinājumu, lūdzu ievadiet savu kontaktinformāciju. 
                Mēs nosūtīsim jums piekļuves kodu uz e-pastu.
              </p>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmitRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  E-pasta adrese *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00332D]"
                    placeholder="juris@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tālruņa numurs *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00332D]"
                    placeholder="+371 20123456"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Atcelt
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 px-4 bg-[#00332D] text-white rounded-lg hover:bg-[#004d42] transition-colors disabled:opacity-50"
                >
                  {loading ? "Nosūta..." : "Saņemt piekļuvi"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Verify step */}
        {step === 'verify' && (
          <div>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Key className="w-8 h-8 text-blue-500" />
              </div>
              <h2 className="text-2xl font-bold text-[#00332D] mb-2">
                Ievadiet kodu
              </h2>
              <p className="text-gray-600">
                Nosūtījām 6 ciparu kodu uz <strong>{email}</strong>. 
                Lūdzu ievadiet to zemāk.
              </p>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verifikācijas kods
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full text-center text-2xl font-mono py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00332D] tracking-widest"
                  placeholder="123456"
                  maxLength={6}
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setStep('request')}
                  className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Atpakaļ
                </button>
                <button
                  type="submit"
                  disabled={loading || code.length !== 6}
                  className="flex-1 py-3 px-4 bg-[#00332D] text-white rounded-lg hover:bg-[#004d42] transition-colors disabled:opacity-50"
                >
                  {loading ? "Verificē..." : "Apstiprināt"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Success step */}
        {step === 'success' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-[#00332D] mb-2">
              Piekļuve apstiprināta!
            </h2>
            <p className="text-gray-600 mb-4">
              Tagad jūs varat skatīt privātos sludinājumus. Lapa tiks pārlādēta.
            </p>
            <div className="animate-spin w-6 h-6 border-2 border-[#00332D] border-t-transparent rounded-full mx-auto"></div>
          </div>
        )}
      </div>
    </div>
  )
}