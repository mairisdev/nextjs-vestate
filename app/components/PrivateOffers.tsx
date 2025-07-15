// app/components/PrivateOffers.tsx
"use client"

import { useState, useEffect } from "react"

type Listing = {
  title: string
  price: string
  description: string
  size: string
  extra: string
  image: string
}

export default function PrivateOffers() {
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [enteredCode, setEnteredCode] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [showFormSuccess, setShowFormSuccess] = useState(false)
  const [showCodeSuccess, setShowCodeSuccess] = useState(false)
  const [showCodeInput, setShowCodeInput] = useState(false)
  const [listings, setListings] = useState<Listing[]>([])
  const [accessChecked, setAccessChecked] = useState(false)
  const [timeLeft, setTimeLeft] = useState("")
  const [expiry, setExpiry] = useState<number | null>(null)

  // Load saved email from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("private_access_email")
    if (stored) {
      setEmail(stored)
    } else {
      setAccessChecked(true)
    }
  }, [])

  useEffect(() => {
    const stored = localStorage.getItem("private_access_email")
    if (!stored) {
      setAccessChecked(true)
      return
    }

    setEmail(stored)

    const checkAccess = async () => {
      try {
        const res = await fetch(`/api/private-listings?email=${encodeURIComponent(stored)}`)
        if (res.ok) {
          const data = await res.json()
          
          // Drošas pārbaudes listings masīvam
          if (data.listings && Array.isArray(data.listings)) {
            setListings(data.listings)
          } else {
            console.warn("Invalid listings data received:", data)
            setListings([])
          }

          if (data.validUntil) {
            const expiryMs = new Date(data.validUntil).getTime()
            setExpiry(expiryMs)
          }
        } else {
          // Ja piekļuve nav derīga, notīrām
          setListings([])
          localStorage.removeItem("private_access_email")
        }
      } catch (err) {
        console.error("Access check error:", err)
        setListings([])
      } finally {
        setAccessChecked(true)
      }
    }

    checkAccess()
  }, [])

  const updateTimer = (expiry: number) => {
    const now = Date.now()
    const remaining = expiry - now
    if (remaining <= 0) {
      setTimeLeft("")
      return
    }
    const hours = Math.floor(remaining / (1000 * 60 * 60))
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))
    setTimeLeft(`${hours}h ${minutes}min`)
  }

  useEffect(() => {
    if (!expiry) return
    updateTimer(expiry)
    const interval = setInterval(() => updateTimer(expiry), 60 * 1000)
    return () => clearInterval(interval)
  }, [expiry])

  const submitAccessRequest = async () => {
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    const isPhoneValid = /^\+?\d{8,15}$/.test(phone)
    if (!isEmailValid || !isPhoneValid) {
      alert("Lūdzu ievadiet derīgu e-pastu un tālruņa numuru!")
      return
    }

    const res = await fetch("/api/access-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, phone }),
    })

    if (res.ok) {
      setShowForm(false)
      setShowFormSuccess(true)
      setShowCodeInput(true)
      setTimeout(() => setShowFormSuccess(false), 6000)
    } else {
      alert("Kļūda pieprasot piekļuvi.")
    }
  }

  const verifyCode = async () => {
    const res = await fetch("/api/verify-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code: enteredCode }),
    })

    if (res.ok) {
      const data = await res.json()
      setExpiry(data.valid_for ?? null)
      setShowCodeInput(false)
      setShowCodeSuccess(true)
      localStorage.setItem("private_access_email", email)
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } else {
      alert("Nepareizs kods!")
    }
  }

  // Drošas pārbaudes, lai pārliecinātos, ka listings ir masīvs
  const safeListings = Array.isArray(listings) ? listings : []

  return (
    <section className="py-20 px-4 md:px-12 bg-[#F3F4F6]">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-[#00332D] mb-4">
          Nepubliskie īpāšumu piedāvājumi – tikai pie mums!
        </h2>

        {timeLeft && (
          <p className="badge text-sm text-gray-600 mt-4">
            Piekļuve beigsies pēc: <strong>{timeLeft}</strong>
          </p>
        )}

        {showFormSuccess && (
          <div className="bg-green-100 text-green-800 px-6 py-4 rounded-md mb-6 mt-6">
            Paldies! Piekļuves pieprasījums saņemts. Lūdzu pārbaudi e-pastu.
          </div>
        )}

        {showCodeSuccess && (
          <div className="bg-green-100 text-green-800 px-6 py-4 rounded-md mb-6 mt-6">
            E-pasts apstiprināts! Pārlādējam lapu...
          </div>
        )}

        {/* Code Input Form */}
        {showCodeInput && (
          <div className="bg-white p-6 rounded-lg shadow-lg mb-6 max-w-md mx-auto">
            <h3 className="text-lg font-semibold mb-4">Ievadiet piekļuves kodu</h3>
            <input
              type="text"
              placeholder="6 ciparu kods"
              value={enteredCode}
              onChange={(e) => setEnteredCode(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-4 py-2 mb-4 text-center text-xl tracking-wider"
              maxLength={6}
            />
            <button
              onClick={verifyCode}
              className="w-full bg-[#00332D] text-white py-2 px-4 rounded-md hover:bg-[#004d42] transition-colors"
            >
              Apstiprināt
            </button>
          </div>
        )}

        {/* Access Request Form */}
        {showForm && (
          <div className="bg-white p-6 rounded-lg shadow-lg mb-6 max-w-md mx-auto">
            <h3 className="text-lg font-semibold mb-4">Pieprasīt piekļuvi</h3>
            <input
              type="email"
              placeholder="E-pasta adrese"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-4 py-2 mb-4"
            />
            <input
              type="tel"
              placeholder="Tālruņa numurs"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-4 py-2 mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={submitAccessRequest}
                className="flex-1 bg-[#00332D] text-white py-2 px-4 rounded-md hover:bg-[#004d42] transition-colors"
              >
                Pieprasīt
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
              >
                Atcelt
              </button>
            </div>
          </div>
        )}

        {/* Ja nav piekļuves, rādām pogu */}
        {accessChecked && safeListings.length === 0 && !showForm && !showCodeInput && (
          <div className="bg-white p-8 rounded-lg shadow-lg mb-6">
            <p className="text-gray-600 mb-6">
              Mums ir ekskluzīvi īpašumu piedāvājumi, kas nav publiski pieejami. 
              Lai tos apskatītu, lūdzu pieprasiet piekļuvi.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-[#00332D] text-white py-3 px-6 rounded-md hover:bg-[#004d42] transition-colors font-semibold"
            >
              Pieprasīt piekļuvi privātajiem sludinājumiem
            </button>
          </div>
        )}

        {/* Rādām sludinājumus, ja ir piekļuve */}
        {accessChecked && safeListings.length > 0 && (
          <div className="grid md:grid-cols-2 gap-6 mt-8">
            {safeListings.map((listing, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden">
                {listing.image && (
                  <img
                    src={listing.image}
                    alt={listing.title || "Privāts piedāvājums"}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      // Fallback ja attēls neielādējas
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                    }}
                  />
                )}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-[#00332D] mb-2">
                    {listing.title || "Privāts piedāvājums"}
                  </h3>
                  <p className="text-2xl font-bold text-[#77dDB4] mb-2">
                    {listing.price || "Cena pēc pieprasījuma"}
                  </p>
                  <p className="text-gray-600 mb-4">
                    {listing.description || "Detalizēta informācija pēc pieprasījuma"}
                  </p>
                  <div className="flex justify-between text-sm text-gray-500">
                    {listing.size && <span>Platība: {listing.size}</span>}
                    {listing.extra && <span>{listing.extra}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}