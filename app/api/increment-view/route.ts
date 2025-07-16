import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const { propertyId } = await req.json()

  if (!propertyId) {
    return NextResponse.json({ success: false, error: 'Missing propertyId' }, { status: 400 })
  }

  const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0] || req.headers.get('x-real-ip') || 'unknown'
  const userAgent = req.headers.get('user-agent') || null

  try {
    await prisma.propertyView.upsert({
      where: {
        unique_property_view: { propertyId, ipAddress },
      },
      update: {},
      create: {
        propertyId,
        ipAddress,
        userAgent,
      },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Error tracking view:', err)
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
  }
}