import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const settings = await prisma.footerSettings.findFirst()
    if (!settings) {
      return new NextResponse("Footer settings not found", { status: 404 })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error("[FOOTER_SETTINGS_GET]", error)
    return new NextResponse("Server error", { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json()

    const updated = await prisma.footerSettings.update({
      where: { id: data.id },
      data: {
        companyName: data.companyName,
        description: data.description,
        phone: data.phone,
        email: data.email,
        address: data.address,
        facebookUrl: data.facebookUrl,
        instagramUrl: data.instagramUrl,
        linkedinUrl: data.linkedinUrl,
        copyrightText: data.copyrightText,
        developerName: data.developerName,
        developerUrl: data.developerUrl,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("[FOOTER_SETTINGS_POST]", error)
    return new NextResponse("Server error", { status: 500 })
  }
}
