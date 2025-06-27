import { NextResponse } from "next/server"
import { randomInt } from "crypto"
import { sendAccessRequestEmail } from "@/lib/sendAccessRequest"

export async function POST(req: Request) {
  const { email, phone } = await req.json()

  if (!email || !phone) {
    return NextResponse.json({ error: "Nepieciešams e-pasts un tālrunis!" }, { status: 400 })
  }

  const code = randomInt(100000, 999999).toString()

  try {
    await sendAccessRequestEmail(email, phone, code)

    // Notificē lietotāju
    await fetch("/api/send-access-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, phone, code }),
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Kļūda saglabājot/verificējot pieprasījumu:", error)
    return NextResponse.json({ error: "Kļūda apstrādājot pieprasījumu" }, { status: 500 })
  }
}
