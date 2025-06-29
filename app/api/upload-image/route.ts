import fs from 'fs'
import path from 'path'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('image') as File
    const title = formData.get('title') as string
    const type = formData.get('type') as string // Pieprasām veidu: "slider" vai "first-section"

    if (!file) {
      return NextResponse.json({ error: 'Image is required' }, { status: 400 })
    }

    // Sanitizējam virsrakstu, lai pārliecinātos, ka tas ir derīgs faila nosaukums
    const sanitizedTitle = title?.replace(/\s+/g, '-').toLowerCase() || 'default-title'
    const imageName = `${sanitizedTitle}.webp`

    // Pārliecināmies, ka attēls tiek saglabāts pareizajā mapē
    const folderPath = type === 'first-section' ? 'first-section' : 'slider'
    const dirPath = path.join(process.cwd(), 'public', folderPath)

    // Pārbaudām, vai mape pastāv, ja ne, tad izveidojam to
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true })
    }

    const imagePath = path.join(dirPath, imageName)

    const buffer = Buffer.from(await file.arrayBuffer())
    fs.writeFileSync(imagePath, buffer)

    // Atgriežam attēla ceļu
    const imageUrl = `/${folderPath}/${imageName}`  // Pilns ceļš

    // Ievietojam šo ceļu arī datubāzē
    await saveImageUrlToDatabase(imageUrl, sanitizedTitle)

    return NextResponse.json({ imageUrl }, { status: 200 })
  } catch (error) {
    console.error('Error uploading image:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

async function saveImageUrlToDatabase(imageUrl: string, sanitizedTitle: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/first-section`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ backgroundImage: imageUrl, title: sanitizedTitle })
    })

    const responseText = await response.text() // Izmantojam `text()` metodi, lai iegūtu neparasto atbildi
    try {
      return JSON.parse(responseText) // Ja tas ir derīgs JSON, mēģināsim parsēt
    } catch (error) {
      console.error("Error parsing JSON:", error)
      return responseText
    }
  } catch (error) {
    console.error('Error saving to database', error)
  }
}

