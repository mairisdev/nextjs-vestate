import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import nodemailer from "nodemailer"
import { syncContactSectionTranslations } from "@/lib/translationSync"

export async function GET() {
  try {
    const data = await prisma.contactSettings.findFirst()
    return NextResponse.json(data || {})
  } catch (error) {
    console.error("[CONTACT_GET]", error)
    return new NextResponse("Server error", { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    // Ja ir "contact settings" saglabāšana
    if (body.heading || body.address) {
      const { heading, subtext, address, phone, email, hours } = body

      const existing = await prisma.contactSettings.findFirst()

      let result

      if (existing) {
        result = await prisma.contactSettings.update({
          where: { id: existing.id },
          data: { heading, subtext, address, phone, email, hours },
        })
      } else {
        result = await prisma.contactSettings.create({
          data: { heading, subtext, address, phone, email, hours },
        })
      }

      // Automātiska tulkojumu sinhronizācija
      await syncContactSectionTranslations(result)

      return NextResponse.json(result)
    }

    // Ja ir kontaktformas ziņa
    const { name, email, message } = body

    if (!name || !email || !message) {
      return new NextResponse("Nepilnīgi dati", { status: 400 })
    }

    const transporter = nodemailer.createTransport({
      host: "mail.vestate.lv",
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER!,
        pass: process.env.SMTP_PASS!,
      },
    })

    await transporter.sendMail({
      from: `"Vestate.lv" <${process.env.SMTP_FROM}>`,
      to: "info@vestate.lv",
      subject: `Jauna ziņa no ${name}`,
      html: `
        <p><strong>Vārds:</strong> ${name}</p>
        <p><strong>E-pasts:</strong> ${email}</p>
        <p><strong>Ziņojums:</strong></p>
        <p>${message.replace(/\n/g, "<br>")}</p>
      `,
    })

    return new NextResponse("Ziņa veiksmīgi nosūtīta!")
  } catch (error) {
    console.error("[CONTACT_POST_SEND]", error)
    return new NextResponse("Server error", { status: 500 })
  }
}
