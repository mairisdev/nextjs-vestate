import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { randomInt } from "crypto"
import nodemailer from "nodemailer"

const prisma = new PrismaClient()

export async function POST(req: Request) {
  const { email, phone } = await req.json()

  if (!email || !phone) {
    return NextResponse.json({ error: "Nepieciešams e-pasts un tālrunis!" }, { status: 400 })
  }

  const code = randomInt(100000, 999999).toString()
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000)

  try {
    await prisma.accessRequest.create({
      data: {
        email,
        phone,
        code,
        expiresAt,
      },
    })

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "465"),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    await transporter.sendMail({
      from: `"Vestate.lv" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Verifikācijas kods - Privātie sludinājumi",
      html: `<p>Labdien!</p>
             <p>Jūsu verifikācijas kods ir:</p>
             <h2>${code}</h2>
             <p>Kods derīgs 15 minūtes.</p>`
    })

    await transporter.sendMail({
      from: `"Vestate.lv" <${process.env.SMTP_USER}>`,
      to: "mairisdigital@icloud.com",
      subject: "Jauns pieprasījums privātajiem sludinājumiem",
      html: `<p><strong>Klienta e-pasts:</strong> ${email}</p>
             <p><strong>Tālrunis:</strong> ${phone}</p>`
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Neizdevās nosūtīt pieprasījumu:", error)
    return NextResponse.json({ error: "Servera kļūda" }, { status: 500 })
  }
}
