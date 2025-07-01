"use client"

import { useEffect, useState } from "react"

interface Quiz {
  question: string
  answer: string
}

const quizOptions: Quiz[] = [
  { question: "Cik ir 2 + 3?", answer: "5" },
  { question: "Cik ir 4 - 1?", answer: "3" },
  { question: "Cik ir 10 dalīts ar 2?", answer: "5" },
  { question: "Cik ir 3 + 4?", answer: "7" },
  { question: "Cik ir 6 - 2?", answer: "4" },
]

export default function ContactSection() {
  const [data, setData] = useState<any>(null)
  const [form, setForm] = useState({ name: "", email: "", message: "", answer: "" })
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [status, setStatus] = useState("")

  useEffect(() => {
    fetch("/api/contact")
      .then((res) => res.json())
      .then(setData)

    const random = quizOptions[Math.floor(Math.random() * quizOptions.length)]
    setQuiz(random)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!quiz || form.answer.trim() !== quiz.answer) {
      setStatus("Nepareiza atbilde uz jautājumu")
      return
    }

    if (!form.email.includes("@")) {
      setStatus("Lūdzu, ievadiet derīgu e-pastu.")
      return
    }

    setStatus("Sūtam ziņu...")

    setTimeout(() => {
      setStatus("Ziņa nosūtīta! ✅ (demo režīms)")
      setForm({ name: "", email: "", message: "", answer: "" })
      const newQuiz = quizOptions[Math.floor(Math.random() * quizOptions.length)]
      setQuiz(newQuiz)
    }, 1000)
  }

  if (!data || !quiz) return null

  return (
    <section className="bg-[#F9FAFB] py-20 px-4 md:px-8">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-start">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-[#00332D] mb-4 whitespace-pre-line">
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

        <form
          className="bg-white rounded-2xl shadow-lg p-6 md:p-8 space-y-4"
          onSubmit={handleSubmit}
        >
          <h3 className="text-2xl font-bold text-[#00332D] mb-2">Nosūtīt ziņu</h3>
          <input
            type="text"
            placeholder="Vārds un uzvārds"
            className="w-full p-3 border border-gray-300 rounded-lg"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            type="email"
            placeholder="E-pasts"
            className="w-full p-3 border border-gray-300 rounded-lg"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <textarea
            placeholder="Jūsu ziņojums"
            rows={4}
            className="w-full p-3 border border-gray-300 rounded-lg"
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder={quiz.question}
            className="w-full p-3 border border-gray-300 rounded-lg"
            value={form.answer}
            onChange={(e) => setForm({ ...form, answer: e.target.value })}
            required
          />
          <button
            type="submit"
            className="w-full bg-[#00332D] text-white py-3 rounded-lg hover:bg-[#00443B] transition"
          >
            Nosūtīt
          </button>
          {status && <p className="text-sm mt-2">{status}</p>}
        </form>
      </div>
    </section>
  )
}
