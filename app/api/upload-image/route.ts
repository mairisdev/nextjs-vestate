import fs from 'fs'
import path from 'path'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    // Iegūt formData no pieprasījuma
    const formData = await req.formData()
    const file = formData.get('image') as File
    const title = formData.get('title') as string

    // Pārbaudīt, vai ir attēls
    if (!file) {
      return NextResponse.json({ error: 'Image is required' }, { status: 400 })
    }

    // Sanitizēt virsrakstu un veidot faila nosaukumu
    const sanitizedTitle = title?.replace(/\s+/g, '-').toLowerCase() || 'default-title'  // Izmantojam noklusējuma nosaukumu
    const imageName = `${sanitizedTitle}.webp`

    // Saglabāt attēlu
    const imagePath = path.join(process.cwd(), 'public', 'slider', imageName)

    const buffer = Buffer.from(await file.arrayBuffer())
    fs.writeFileSync(imagePath, buffer)

    // Atgriezt attēla URL
    const imageUrl = `/slider/${imageName}`
    return NextResponse.json({ imageUrl }, { status: 200 })
  } catch (error) {
    console.error('Error uploading image:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
