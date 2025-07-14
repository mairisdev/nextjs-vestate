"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import AlertMessage from "./ui/alert-message"

interface Quiz {
  question: string
  answer: string
}

interface ContactData {
  id: string
  heading: string
  subtext: string
  address: string
  phone: string
  email: string
  hours: string
}

interface ContactSectionProps {
  data: ContactData | null
  translations: {
    defaultHeading: string
    defaultSubtext: string
    formNamePlaceholder: string
    formEmailPlaceholder: string
    formMessagePlaceholder: string
    securityQuestion: string
    securityQuestionDesc: string
    submitButton: string
    successMessage: string
    errorMessage: string
    emailError: string
    securityError: string
    sendMessageTitle: string
    sendMessageDesc: string
    [key: string]: string
  }
}

export default function ContactSection({ data, translations }: ContactSectionProps) {
  const [form, setForm] = useState({ name: "", email: "", message: "", answer: "" })
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null)

  const quizOptions: Quiz[] = [
    { question: translations.quiz1 || "Cik ir 2 + 3?", answer: "5" },
    { question: translations.quiz2 || "Cik ir 4 - 1?", answer: "3" },
    { question: translations.quiz3 || "Cik ir 10 / 2?", answer: "5" },
    { question: translations.quiz4 || "Cik ir 3 + 4?", answer: "7" },
    { question: translations.quiz5 || "Cik ir 6 - 2?", answer: "4" },
  ]

  useEffect(() => {
    const random = quizOptions[Math.floor(Math.random() * quizOptions.length)]
    setQuiz(random)
  }, [translations])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAlert(null)

    if (!quiz || form.answer.trim() !== quiz.answer) {
      setAlert({ type: "error", message: translations.securityError })
      return
    }

    if (!form.email.includes("@")) {
      setAlert({ type: "error", message: translations.emailError })
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
        setAlert({ type: "success", message: translations.successMessage })
        setForm({ name: "", email: "", message: "", answer: "" })
        setQuiz(quizOptions[Math.floor(Math.random() * quizOptions.length)])
      } else {
        throw new Error()
      }
    } catch (err) {
      setAlert({ type: "error", message: translations.errorMessage })
    }
  }

  if (!data && !translations.defaultHeading) return null

  const heading = translations.defaultHeading || data?.heading || ""
  const subtext = translations.defaultSubtext || data?.subtext || ""

  return (
    <section id="kontakti" className="bg-[#F9FAFB] py-16 sm:py-20 px-6 sm:px-12">
      <div className="max-w-7xl mx-auto grid gap-12 sm:grid-cols-1 md:grid-cols-2 items-start">

        <div>
          {heading.includes('28446677') || /\d{8}/.test(heading) ? (
            <Link href={`tel:${data?.phone || '28446677'}`}>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#00332D] mb-4 whitespace-pre-line hover:text-[#77D4B4] transition-colors cursor-pointer">
                {heading}
              </h2>
            </Link>
          ) : (
            <h2 className="text-3xl sm:text-4xl font-bold text-[#00332D] mb-4 whitespace-pre-line">
              {heading}
            </h2>
          )}
          <p className="text-gray-600 mb-8 text-lg leading-relaxed">
            {subtext}
          </p>

          <div className="space-y-6">
            {data?.address && (
              <div className="flex items-start gap-4 group">
                <div className="bg-[#77dDB4] p-3 rounded-xl group-hover:bg-[#00332D] transition-colors duration-300">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-[#00332D] mb-1">{translations.addressLabel || "Adrese"}</h3>
                  <p className="text-gray-600">{data.address}</p>
                </div>
              </div>
            )}

            {data?.phone && (
              <div className="flex items-start gap-4 group">
                <div className="bg-[#77dDB4] p-3 rounded-xl group-hover:bg-[#00332D] transition-colors duration-300">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-[#00332D] mb-1">{translations.phoneLabel || "Telefons"}</h3>
                  <p className="text-gray-600">{data.phone}</p>
                </div>
              </div>
            )}

            {data?.email && (
              <div className="flex items-start gap-4 group">
                <div className="bg-[#77dDB4] p-3 rounded-xl group-hover:bg-[#00332D] transition-colors duration-300">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-[#00332D] mb-1">{translations.emailLabel || "E-pasts"}</h3>
                  <p className="text-gray-600">{data.email}</p>
                </div>
              </div>
            )}

            {data?.hours && (
              <div className="flex items-start gap-4 group">
                <div className="bg-[#77dDB4] p-3 rounded-xl group-hover:bg-[#00332D] transition-colors duration-300">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-[#00332D] mb-1">{translations.hoursLabel || "Darba laiks"}</h3>
                  <p className="text-gray-600">{data.hours}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-2xl p-8 hover:shadow-3xl transition-shadow duration-300 border border-gray-100">
          {alert && (
            <div className="mb-6">
              <AlertMessage type={alert.type} message={alert.message} />
            </div>
          )}

          <div className="text-center mb-8">
            <div className="bg-gradient-to-br from-[#77dDB4] to-[#00332D] w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-[#00332D] mb-2">{translations.sendMessageTitle}</h3>
            <p className="text-gray-600">{translations.sendMessageDesc}</p>
          </div>

          <div className="space-y-5">
            <div className="relative group">
              <input
                type="text"
                placeholder={translations.formNamePlaceholder}
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
                placeholder={translations.formEmailPlaceholder}
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
                placeholder={translations.formMessagePlaceholder}
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
                  <span className="text-[#00332D] font-semibold">{translations.securityQuestion}</span>
                </div>
                <p className="text-gray-600 text-sm">{translations.securityQuestionDesc}</p>
              </div>

              {quiz && (
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
              )}
            </div>
          </div>

          <button
            type="submit"
            className="group relative w-full bg-gradient-to-r from-[#00332D] to-[#00443B] text-white py-4 rounded-xl font-semibold text-lg shadow-lg shadow-[#00332D]/30 hover:shadow-xl hover:shadow-[#00332D]/40 transform hover:scale-105 transition-all duration-300 border-2 border-transparent hover:border-[#77dDB4] overflow-hidden mt-8"
          >
            <span className="relative z-10 flex items-center justify-center">
              {translations.submitButton}
              <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-[#77dDB4]/20 to-[#77dDB4]/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
          </button>
        </form>
      </div>
    </section>
  )
}