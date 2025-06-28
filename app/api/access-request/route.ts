import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import nodemailer from "nodemailer"

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

async function sendVerificationEmail(to: string, code: string) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: "Apstiprini piekļuvi – Nepubliskie sludinājumi",
    html: `
      <p>Sveiki!</p>
      <p>Jūs pieprasījāt piekļuvi nepuliskajiem īpašumu sludinājumiem. Lūdzu, ievadiet šo kodu, lai apstiprinātu piekļuvi:</p>
      <h2>${code}</h2>
      <p>Kods būs derīgs 24 stundas.</p>
      <p>Ar cieņu,<br />Vestate komanda</p>
    `,
  })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { email, phone } = body

  if (!email || !phone) {
    return NextResponse.json({ error: "Trūkst dati" }, { status: 400 })
  }

  const code = generateCode()
  const now = new Date()
  const validUntil = new Date(now.getTime() + 24 * 60 * 60 * 1000)

  await prisma.accessRequest.create({
    data: {
      email,
      phone,
      code,
      validUntil,
      verified: false,
    },
  })

  try {
    await sendVerificationEmail(email, code)
  } catch (err) {
    console.error("Neizdevās nosūtīt e-pastu:", err)
    return NextResponse.json({ error: "Kļūda sūtot e-pastu" }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
