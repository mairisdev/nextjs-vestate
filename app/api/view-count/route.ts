import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const propertyId = req.nextUrl.searchParams.get('propertyId')

  if (!propertyId) {
    return NextResponse.json({ success: false, error: 'Missing propertyId' }, { status: 400 })
  }

  try {
    const count = await prisma.propertyView.count({
      where: { propertyId },
    })

    return NextResponse.json({ success: true, count })
  } catch (err) {
    console.error('Failed to fetch view count:', err)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}