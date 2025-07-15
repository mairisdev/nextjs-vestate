// app/api/access-request/route.ts - atjauninām, lai saglabātu propertyId

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
    subject: "Apstiprini piekļuvi – Privātie sludinājumi",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #00332D; text-align: center;">Vestate - Privāto sludinājumu piekļuve</h2>
        <p>Sveiki!</p>
        <p>Jūs pieprasījāt piekļuvi privātajiem īpašumu sludinājumiem. Lūdzu, ievadiet šo kodu, lai apstiprinātu piekļuvi:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="background: #00332D; color: white; padding: 15px 30px; font-size: 24px; font-weight: bold; border-radius: 8px; letter-spacing: 5px;">${code}</span>
        </div>
        <p><strong>Kods būs derīgs 24 stundas.</strong></p>
        <p>Ja jūs nepieprasījāt šo piekļuvi, lūdzu ignorējiet šo e-pastu.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">
          Ar cieņu,<br />
          <strong>Vestate komanda</strong><br />
          <a href="mailto:info@vestate.lv">info@vestate.lv</a>
        </p>
      </div>
    `,
  })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { email, phone, propertyId } = body

  if (!email || !phone) {
    return NextResponse.json({ error: "Trūkst obligāti dati" }, { status: 400 })
  }

  // Validējam e-pastu un tālruni
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const phoneRegex = /^\+?\d{8,15}$/
  
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: "Nepareizs e-pasta formāts" }, { status: 400 })
  }
  
  if (!phoneRegex.test(phone)) {
    return NextResponse.json({ error: "Nepareizs tālruņa numura formāts" }, { status: 400 })
  }

  const code = generateCode()
  const now = new Date()
  const validUntil = new Date(now.getTime() + 24 * 60 * 60 * 1000) // 24 stundas

  try {
    // Pārbaudam vai jau eksistē neapstiprinājums pieprasījums
    const existingRequest = await prisma.accessRequest.findFirst({
      where: {
        email,
        verified: false,
        createdAt: {
          gte: new Date(now.getTime() - 5 * 60 * 1000) // Pēdējās 5 minūtes
        }
      }
    })

    if (existingRequest) {
      return NextResponse.json({ 
        error: "Lūdzu uzgaidiet pirms atkārtota pieprasījuma nosūtīšanas" 
      }, { status: 429 })
    }

    // Izveidojam jaunu piekļuves pieprasījumu
    await prisma.accessRequest.create({
      data: {
        email,
        phone,
        code,
        validUntil,
        verified: false,
        propertyId: propertyId || null, // Saglabājam īpašuma ID ja norādīts
      },
    })

    // Nosūtām e-pastu
    await sendVerificationEmail(email, code)

    return NextResponse.json({ 
      success: true,
      message: "Verifikācijas kods nosūtīts uz jūsu e-pastu"
    })
  } catch (err) {
    console.error("Access request error:", err)
    return NextResponse.json({ 
      error: "Kļūda apstrādājot pieprasījumu" 
    }, { status: 500 })
  }
}