import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const data = await req.json()
    
    const category = await prisma.propertyCategory.update({
      where: { id: params.id },
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

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    // Pārbaudi vai kategorijai ir īpašumi
    const propertyCount = await prisma.property.count({
      where: { categoryId: params.id }
    })
    
    if (propertyCount > 0) {
      return NextResponse.json({ 
        error: "Nevar dzēst kategoriju, jo tai ir piesaistīti īpašumi" 
      }, { status: 400 })
    }
    
    await prisma.propertyCategory.delete({
      where: { id: params.id }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Kļūda dzēšot kategoriju" }, { status: 500 })
  }
}
