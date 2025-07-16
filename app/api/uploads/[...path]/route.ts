import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: filePath } = await params
    
    // Rekonstruē faila ceļu
    const fullPath = path.join(process.cwd(), 'uploads', ...filePath)
    console.log('📁 Serving file:', fullPath)
    
    // Lasa failu
    const fileBuffer = await readFile(fullPath)
    
    // Nosaka content type pēc faila paplašinājuma
    const ext = path.extname(fullPath).toLowerCase()
    let contentType = 'application/octet-stream'
    
    switch (ext) {
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg'
        break
      case '.png':
        contentType = 'image/png'
        break
      case '.gif':
        contentType = 'image/gif'
        break
      case '.webp':
        contentType = 'image/webp'
        break
      case '.svg':
        contentType = 'image/svg+xml'
        break
    }
    
    // Atgriež failu ar pareizo content type
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
    
  } catch (error) {
    console.error('❌ Error serving file:', error)
    return new NextResponse('File not found', { status: 404 })
  }
}