import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const listings = [
  {
    title: "3 istabu dzīvoklis Jūrmalā",
    price: "Pēc vienošanās",
    description: "2 stāvu dzīvoklis",
    size: "98m2",
    extra: "Info2",
    image: "/private-offers/Jurmala1.webp",
  },
  // Ja nepieciešams, vari pievienot vairāk piedāvājumu šeit
]

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const email = searchParams.get("email")

  if (!email) {
    return NextResponse.json({ error: "Nav norādīts e-pasts" }, { status: 400 })
  }

  const access = await prisma.accessRequest.findFirst({
    where: {
      email,
      verified: true,
      validUntil: {
        gt: new Date(),
      },
    },
  })

  if (!access) {
    return NextResponse.json({ error: "Unauthorized or expired" }, { status: 401 })
  }

  return NextResponse.json({
    listings,
    validUntil: access.validUntil?.toISOString() ?? null,
  })
}
