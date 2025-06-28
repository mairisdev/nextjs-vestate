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
        setListings(data.listings)

        if (data.validUntil) {
          const expiryMs = new Date(data.validUntil).getTime()
          setExpiry(expiryMs)
        }
      }
    } catch (err) {
      console.error("Access check error:", err)
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
            Apstiprināts! Lapa tiks pārlādēta...
          </div>
        )}

        {accessChecked && listings.length === 0 && !showCodeInput && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-[#00332D] text-white mt-6 px-6 py-3 rounded-md hover:bg-[#00443B] transition"
          >
            Aplūkot sludinājumus
          </button>
        )}

        {listings.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
            {listings.map((item, idx) => (
              <div key={idx} className="bg-white rounded-2xl shadow-lg p-6">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-48 object-cover rounded-md mb-4"
                />
                <h3 className="text-lg font-semibold text-[#00332D] mb-2">
                  {item.title}
                </h3>
                <p className="text-[#00332D] font-bold text-xl mb-1">{item.price}</p>
                <p className="text-sm text-gray-700">{item.description}</p>
                <p className="text-sm text-gray-700">{item.size}</p>
                <p className="text-sm text-gray-700 mb-4">{item.extra}</p>
                <button className="bg-[#00332D] text-white px-4 py-2 rounded-md hover:bg-[#00443B]">
                  Apskatīt vairāk
                </button>
              </div>
            ))}
          </div>
        )}

        {showCodeInput && (
          <div className="max-w-md mx-auto mt-12 bg-white rounded-xl p-6 shadow">
            <h3 className="text-xl font-bold text-[#00332D] mb-3">Apstiprini piekļuvi</h3>
            <p className="text-sm text-gray-600 mb-4">
              Mēs nosūtījām 6 ciparu kodu uz <strong>{email}</strong>. Ievadi to zemāk:
            </p>
            <input
              type="text"
              placeholder="123456"
              maxLength={6}
              value={enteredCode}
              onChange={(e) => setEnteredCode(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-[#00443B]"
            />
            <div className="flex justify-end gap-3">
              <button
                className="text-sm text-gray-500 hover:underline"
                onClick={() => setShowCodeInput(false)}
              >
                Atcelt
              </button>
              <button
                onClick={verifyCode}
                className="bg-[#00332D] text-white px-5 py-2 rounded-lg hover:bg-[#00443B] text-sm"
              >
                Apstiprināt
              </button>
            </div>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-xl space-y-6">
            <div className="text-left">
              <h3 className="text-2xl font-bold text-[#00332D] mb-4">
                Piekļuves pieprasījums
              </h3>
              <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                Lai piekļūtu <strong>nepubliskajiem sludinājumiem</strong>, ievadi savu e-pastu un tālruni.
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#00332D] mb-1">E-pasts</label>
                <input
                  type="email"
                  placeholder="piemērs@epasts.lv"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00443B]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#00332D] mb-1">Tālrunis</label>
                <input
                  type="tel"
                  placeholder="+37112345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00443B]"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button
                className="text-sm text-gray-500 hover:underline"
                onClick={() => setShowForm(false)}
              >
                Atcelt
              </button>
              <button
                onClick={submitAccessRequest}
                className="bg-[#00332D] text-white px-5 py-2 rounded-lg hover:bg-[#00443B] text-sm"
              >
                Pieprasīt piekļuvi
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
