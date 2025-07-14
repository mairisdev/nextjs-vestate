import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { syncFooterSectionTranslations } from "@/lib/translationSync"

export async function GET() {
  try {
    const settings = await prisma.footerSettings.findFirst()
    return NextResponse.json({
      id: settings?.id,
      companyName: settings?.companyName,
      companyDesc: settings?.description,
      phone: settings?.phone,
      email: settings?.email,
      address: settings?.address,
      facebookUrl: settings?.facebookUrl,
      instagramUrl: settings?.instagramUrl,
      linkedinUrl: settings?.linkedinUrl,
      developerName: settings?.developerName,
      developerUrl: settings?.developerUrl,
      copyrightText: settings?.copyrightText,
    })
  } catch (error) {
    console.error("[FOOTER_SETTINGS_GET]", error)
    return new NextResponse("Server error", { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json()

    const existing = await prisma.footerSettings.findFirst()

    let result

    if (existing) {
      result = await prisma.footerSettings.update({
        where: { id: existing.id },
        data: {
          companyName: data.companyName,
          description: data.companyDesc,
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
    } else {
      result = await prisma.footerSettings.create({
        data: {
          companyName: data.companyName,
          description: data.companyDesc,
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
    }

    // Automātiska tulkojumu sinhronizācija
    await syncFooterSectionTranslations({
      companyName: result.companyName,
      description: result.description,
      copyrightText: result.copyrightText,
      developerName: result.developerName,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("[FOOTER_SETTINGS_POST]", error)
    return new NextResponse("Server error", { status: 500 })
  }
}
