import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { email, code } = body

  if (!email || !code) {
    return NextResponse.json({ error: "Nepilnīgi dati" }, { status: 400 })
  }

  const access = await prisma.accessRequest.findFirst({
    where: {
      email,
      code,
      verified: false,
    },
  })

  if (!access) {
    return NextResponse.json({ error: "Nepareizs kods vai jau izmantots" }, { status: 401 })
  }

  await prisma.accessRequest.update({
    where: {
      id: access.id,
    },
    data: {
      verified: true,
    },
  })

  return NextResponse.json({
    success: true,
    valid_for: access.validUntil?.getTime() ?? null,
  })
}
