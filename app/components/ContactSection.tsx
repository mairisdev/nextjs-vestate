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

    <div>
      <h2 className="text-3xl sm:text-4xl font-bold text-[#00332D] mb-4 whitespace-pre-line">
        {data.heading?.includes('28446677') ? (
          <>
            Sadarbībai vai bezmaksas konsultācijai - zvaniet{' '}
            <a 
              href="tel:28446677" 
              className="hover:text-[#77dDB4] transition-colors underline cursor-pointer"
            >
              28446677
            </a>
          </>
        ) : (
          data.heading
        )}
      </h2>
      <p className="text-gray-600 mb-8">{data.subtext}</p>

      <div className="space-y-4 text-[#00332D]">
        <div>
          <h4 className="font-semibold mb-1">Kā ar mums sazināties?</h4>
          <p className="whitespace-pre-line">{data.address}</p>
          <p>Tālrunis: <a href={`tel:${data.phone}`} className="text-[#00332D] font-semibold hover:text-[#77dDB4] transition-colors underline">{data.phone}</a></p>
          <p>
            E-pasts:{" "}
            <a href={`mailto:${data.email}`} className="text-[#00332D] font-semibold hover:text-[#77dDB4] transition-colors underline">
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
      className="relative bg-white rounded-2xl shadow-2xl shadow-[#77dDB4]/10 p-8 space-y-6 border border-[#77dDB4]/20 overflow-hidden"
      onSubmit={handleSubmit}
    >
      {/* Dekoratīvs gradients fons */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-[#77dDB4]/20 to-[#00332D]/10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-tr from-[#77dDB4]/15 to-transparent rounded-full blur-2xl"></div>
      
      <div className="relative z-10">
        {alert && <AlertMessage type={alert.type} message={alert.message} />}

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#77dDB4] to-[#00332D] rounded-full mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-[#00332D] mb-2">Nosūtīt ziņu</h3>
          <p className="text-gray-600">Mēs atbildēsim 24 stundu laikā</p>
        </div>

        <div className="space-y-5">
          <div className="relative group">
            <input
              type="text"
              placeholder="Vārds un uzvārds"
              className="w-full p-4 pl-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#77dDB4] focus:ring-4 focus:ring-[#77dDB4]/20 transition-all duration-300 bg-gray-50/50 hover:bg-white group-hover:border-[#77dDB4]/50"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-[#77dDB4] transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>

          <div className="relative group">
            <input
              type="email"
              placeholder="E-pasts"
              className="w-full p-4 pl-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#77dDB4] focus:ring-4 focus:ring-[#77dDB4]/20 transition-all duration-300 bg-gray-50/50 hover:bg-white group-hover:border-[#77dDB4]/50"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-[#77dDB4] transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>

          <div className="relative group">
            <textarea
              placeholder="Jūsu ziņojums"
              rows={4}
              className="w-full p-4 pl-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#77dDB4] focus:ring-4 focus:ring-[#77dDB4]/20 transition-all duration-300 bg-gray-50/50 hover:bg-white group-hover:border-[#77dDB4]/50 resize-none"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              required
            />
            <div className="absolute left-4 top-6 text-gray-400 group-focus-within:text-[#77dDB4] transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-[#77dDB4]/10 border-2 border-[#77dDB4]/30 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-6 h-6 bg-[#77dDB4] rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">?</span>
                </div>
                <span className="text-[#00332D] font-semibold">Drošības jautājums</span>
              </div>
              <p className="text-gray-600 text-sm">Atbildiet uz šo vienkāršo jautājumu, lai pierādītu, ka neesat robots.</p>
            </div>
            <div className="relative group">
              <input
                type="text"
                placeholder={quiz.question}
                className="w-full p-4 pl-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#77dDB4] focus:ring-4 focus:ring-[#77dDB4]/20 transition-all duration-300 bg-gray-50/50 hover:bg-white group-hover:border-[#77dDB4]/50"
                value={form.answer}
                onChange={(e) => setForm({ ...form, answer: e.target.value })}
                required
              />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-[#77dDB4] transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="group relative w-full bg-gradient-to-r from-[#00332D] to-[#00443B] text-white py-4 rounded-xl font-semibold text-lg shadow-lg shadow-[#00332D]/30 hover:shadow-xl hover:shadow-[#00332D]/40 transform hover:scale-105 transition-all duration-300 border-2 border-transparent hover:border-[#77dDB4] overflow-hidden mt-8"
        >
          <span className="relative z-10 flex items-center justify-center">
            Nosūtīt ziņu
            <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-[#77dDB4]/20 to-[#77dDB4]/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
        </button>
      </div>
    </form>
  </div>
</section>
  )
}