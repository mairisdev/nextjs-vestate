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
  const [codeSent, setCodeSent] = useState(false)
  const [enteredCode, setEnteredCode] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [listings, setListings] = useState<Listing[]>([])
  const [accessChecked, setAccessChecked] = useState(false)

useEffect(() => {
  const checkAccess = async () => {
    const res = await fetch("/api/private-listings")
    if (res.ok) {
      const data = await res.json()
      setListings(data.listings)

      if (data.validUntil) {
        const expiryMs = new Date(data.validUntil).getTime()
        setExpiry(expiryMs)
      }
      

      const cookieStr = document.cookie
      const match = cookieStr.match(/vestate_access_expiry=([^;]+)/)
      if (match) {
        const expiryVal = Number(match[1])
        if (!isNaN(expiryVal)) {
          setExpiry(expiryVal)
        }
      }
    }
    setAccessChecked(true)
  }

  checkAccess()
  }, [])

  const [timeLeft, setTimeLeft] = useState("")
  const [expiry, setExpiry] = useState<number | null>(null)

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

  const sendVerification = async () => {
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    const isPhoneValid = /^\+?\d{8,15}$/.test(phone)
    if (!isEmailValid || !isPhoneValid) {
      alert("Lūdzu ievadiet derīgu e-pastu un tālruņa numuru!")
      return
    }

    const res = await fetch("/api/send-access-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, phone }),
    })

    if (res.ok) {
      setCodeSent(true)
    } else {
      alert("Kļūda nosūtot e-pastu.")
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
      setExpiry(data.valid_for)

      const listingsRes = await fetch("/api/private-listings")
      if (listingsRes.ok) {
        const data = await listingsRes.json()
        setListings(data.listings)
      }

      setShowSuccess(true)
      setShowForm(false)
      setTimeout(() => setShowSuccess(false), 6000)
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
        <br />
        {showSuccess && (
          <div className="bg-green-100 text-green-800 px-6 py-4 rounded-md mb-6">
            ✅ Paldies, e-pasts apstiprināts! Sludinājumi būs pieejami 24h.
          </div>
        )}

        {accessChecked && listings.length === 0 && (
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
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-xl space-y-6">
            {!codeSent ? (
              <>
                <div className="text-left">
                  <h3 className="text-2xl font-bold text-[#00332D] mb-4">
                    E-pasta apstiprināšana
                  </h3>
                  <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                    Lai piekļūtu <strong>nepubliskajiem sludinājumiem</strong>, lūdzu, apstiprini savu e-pasta adresi.
                    <br />Pēc apstiprināšanas sludinājumi būs pieejami <strong>24 stundas</strong>.
                    <br />Garantējam, ka e-pastā <strong>NETIKS</strong> sūtītas spama vēstules.
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
                    onClick={sendVerification}
                    className="bg-[#00332D] text-white px-5 py-2 rounded-lg hover:bg-[#00443B] text-sm"
                  >
                    Nosūtīt kodu
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="text-left">
                  <h3 className="text-2xl font-bold text-[#00332D] mb-4">
                    Apstiprini savu piekļuvi
                  </h3>
                  <p className="text-sm text-gray-700 mb-3">
                    E-pastā tika nosūtīts 6 ciparu apstiprinājuma kods. Ievadi to zemāk, lai iegūtu piekļuvi.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#00332D] mb-1">Apstiprinājuma kods</label>
                  <input
                    type="text"
                    placeholder="XXXXXX"
                    value={enteredCode}
                    onChange={(e) => setEnteredCode(e.target.value)}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00443B]"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    className="text-sm text-gray-500 hover:underline"
                    onClick={() => setShowForm(false)}
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
              </>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
