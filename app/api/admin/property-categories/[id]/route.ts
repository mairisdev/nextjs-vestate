import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const data = await req.json()
        
    const category = await prisma.propertyCategory.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description || "",
        isVisible: data.isVisible ?? true,
        order: data.order || 0
      }
    })
        
    return NextResponse.json(category)
  } catch (error) {
    return NextResponse.json({ error: "Kļūda atjauninot kategoriju" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    
    // Pārbaudi vai kategorijai ir īpašumi
    const propertyCount = await prisma.property.count({
      where: { categoryId: id }
    })
        
    if (propertyCount > 0) {
      return NextResponse.json({ 
        error: "Nevar dzēst kategoriju, jo tai ir piesaistīti īpašumi" 
      }, { status: 400 })
    }
        
    await prisma.propertyCategory.delete({
      where: { id }
    })
        
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Kļūda dzēšot kategoriju" }, { status: 500 })
  }
}
