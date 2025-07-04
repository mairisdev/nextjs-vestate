"use client"

import { useEffect, useState } from "react"
import AlertMessage from "./ui/alert-message"

interface Quiz {
  question: string
  answer: string
}

const quizOptions: Quiz[] = [
  { question: "Cik ir 2 + 3?", answer: "5" },
  { question: "Cik ir 4 - 1?", answer: "3" },
  { question: "Cik ir 10 / 2?", answer: "5" },
  { question: "Cik ir 3 + 4?", answer: "7" },
  { question: "Cik ir 6 - 2?", answer: "4" },
]

export default function ContactSection() {
  const [data, setData] = useState<any>(null)
  const [form, setForm] = useState({ name: "", email: "", message: "", answer: "" })
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null)

  useEffect(() => {
    fetch("/api/contact").then((res) => res.json()).then(setData)
    const random = quizOptions[Math.floor(Math.random() * quizOptions.length)]
    setQuiz(random)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAlert(null)

    if (!quiz || form.answer.trim() !== quiz.answer) {
      setAlert({ type: "error", message: "Nepareiza atbilde uz jautājumu." })
      return
    }

    if (!form.email.includes("@")) {
      setAlert({ type: "error", message: "Lūdzu, ievadiet derīgu e-pastu." })
      return
    }

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          message: form.message,
        }),
      })

      if (res.ok) {
        setAlert({ type: "success", message: "Paldies, ziņa nosūtīta veiksmīgi!" })
        setForm({ name: "", email: "", message: "", answer: "" })
        setQuiz(quizOptions[Math.floor(Math.random() * quizOptions.length)])
      } else {
        throw new Error()
      }
    } catch (err) {
      setAlert({ type: "error", message: "Neizdevās nosūtīt ziņu. Mēģiniet vēlreiz." })
    }
  }

  if (!data || !quiz) return null

  return (
<section id="kontakti" className="bg-[#F9FAFB] py-16 sm:py-20 px-6 sm:px-12">
  <div className="max-w-7xl mx-auto grid gap-12 sm:grid-cols-1 md:grid-cols-2 items-start">
    {/* Teksta bloks */}
    <div>
      <h2 className="text-3xl sm:text-4xl font-bold text-[#00332D] mb-4 whitespace-pre-line">
        {data.heading}
      </h2>
      <p className="text-gray-600 mb-8">{data.subtext}</p>

      <div className="space-y-4 text-[#00332D]">
        <div>
          <h4 className="font-semibold mb-1">Kā ar mums sazināties?</h4>
          <p className="whitespace-pre-line">{data.address}</p>
          <p>Tālrunis: {data.phone}</p>
          <p>
            E-pasts:{" "}
            <a href={`mailto:${data.email}`} className="text-[#00332D] font-semibold">
              {data.email}
            </a>
          </p>
        </div>

        <div>
          <h4 className="font-semibold mb-1">Darba laiks</h4>
          <p>{data.hours}</p>
        </div>
      </div>
    </div>

    {/* Formas bloks */}
    <form
      className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 space-y-6"
      onSubmit={handleSubmit}
    >
      {alert && <AlertMessage type={alert.type} message={alert.message} />}

      <h3 className="text-2xl font-semibold text-[#00332D] mb-4">Nosūtīt ziņu</h3>

      <input
        type="text"
        placeholder="Vārds un uzvārds"
        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#77D4B4] transition"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        required
      />

      <input
        type="email"
        placeholder="E-pasts"
        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#77D4B4] transition"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        required
      />

      <textarea
        placeholder="Jūsu ziņojums"
        rows={4}
        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#77D4B4] transition"
        value={form.message}
        onChange={(e) => setForm({ ...form, message: e.target.value })}
        required
      />

      <input
        type="text"
        placeholder={quiz.question}
        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#77D4B4] transition"
        value={form.answer}
        onChange={(e) => setForm({ ...form, answer: e.target.value })}
        required
      />

      <button
        type="submit"
        className="w-full bg-[#00332D] text-white py-3 rounded-lg hover:bg-[#00443B] transition duration-300"
      >
        Nosūtīt
      </button>
    </form>
  </div>
</section>
  )
}
