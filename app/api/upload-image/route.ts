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

  const safeTitle = title
    ?.normalize("NFD") // sadala diakritiskās zīmes (č -> c + ̌)
    .replace(/[\u0300-\u036f]/g, "") // izmet diakritikas
    .replace(/[^a-zA-Z0-9-_]/g, '-') // aizvieto visu citu ar -
    .replace(/-+/g, '-') // vairāki - pēc kārtas = viens -
    .toLowerCase() || 'default-title'

  const imageName = `${safeTitle}.webp`

    // Pārliecināmies, ka attēls tiek saglabāts pareizajā mapē
    const folderPath =
      type === 'first-section'
        ? 'first-section'
        : type === 'second-section'
        ? 'second-section'
        : 'slider'

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
    //await saveImageUrlToDatabase(imageUrl, sanitizedTitle, type)

    return NextResponse.json({ imageUrl }, { status: 200 })
  } catch (error) {
    console.error('Error uploading image:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

async function saveImageUrlToDatabase(imageUrl: string, sanitizedTitle: string, type: string) {
  try {
    const endpoint =
      type === 'second-section'
        ? `${process.env.NEXT_PUBLIC_SITE_URL}/api/second-section`
        : `${process.env.NEXT_PUBLIC_SITE_URL}/api/first-section`

    const body =
      type === 'second-section'
        ? { imageUrl, title: sanitizedTitle }
        : { backgroundImage: imageUrl, title: sanitizedTitle }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const responseText = await response.text()
    try {
      return JSON.parse(responseText)
    } catch (error) {
      console.error("Error parsing JSON:", error)
      return responseText
    }
  } catch (error) {
    console.error('Error saving to database', error)
  }
}
