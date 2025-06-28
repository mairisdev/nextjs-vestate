"use client"

import { useState } from "react"

export default function ContactSection() {
  const [form, setForm] = useState({ name: "", email: "", message: "" })

  return (
    <section className="bg-[#F9FAFB] py-20 px-4 md:px-8">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-start">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-[#00332D] mb-4">
            Sadarbībai vai bezmaksas konsultācijai – zvaniet <br />
            <span className="text-4xl">28446677</span>
          </h2>
          <p className="text-gray-600 mb-8">
            vai aizpildiet formu, lai nosūtītu mums ziņu.
          </p>

          <div className="space-y-4 text-[#00332D]">
            <div>
              <h4 className="font-semibold mb-1">Kā ar mums sazināties?</h4>
              <p>Dominas biroji, Ieriķu iela 3,</p>
              <p>Rīga, LV-1084</p>
              <p>Tālrunis: +371 28 44 66 77</p>
              <p>E-pasts: <a href="mailto:info@vestate.lv" className="text-[#00332D] font-semibold">info@vestate.lv</a></p>
            </div>

            <div>
              <h4 className="font-semibold mb-1">Darba laiks</h4>
              <p>Nenormēts: 24/7</p>
            </div>
          </div>
        </div>

        <form
          className="bg-white rounded-2xl shadow-lg p-6 md:p-8 space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            alert("Ziņojums nosūtīts! (reāli: jānosūta uz backend/email service)")
          }}
        >
          <h3 className="text-2xl font-bold text-[#00332D] mb-2">Nosūtīt ziņu</h3>
          <input
            type="text"
            placeholder="Vārds un uzvārds"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:border-[#00332D]"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            type="email"
            placeholder="E-pasts"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:border-[#00332D]"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <textarea
            placeholder="Jūsu ziņojums"
            rows={4}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:border-[#00332D]"
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            required
          />
          <button
            type="submit"
            className="w-full bg-[#00332D] text-white py-3 rounded-lg hover:bg-[#00443B] transition"
          >
            Nosūtīt
          </button>
        </form>
      </div>
    </section>
  )
}
