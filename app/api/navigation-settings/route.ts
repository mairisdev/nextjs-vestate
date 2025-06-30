import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const settings = await prisma.navigationSettings.findFirst()
  return NextResponse.json(settings)
}

export async function POST(req: Request) {
  const data = await req.json()

  const updated = await prisma.navigationSettings.upsert({
    where: { id: data.id || "navigation-single-record" }, // fallback uz konkrētu id
    update: {
      logoAlt: data.logoAlt,
      menuItems: data.menuItems,
      securityText: data.securityText,
      phone: data.phone,
    },
    create: {
      id: data.id || "navigation-single-record",
      logoAlt: data.logoAlt,
      menuItems: data.menuItems,
      securityText: data.securityText,
      phone: data.phone,
    },
  })

  return NextResponse.json(updated)
}
