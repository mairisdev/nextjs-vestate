import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { isFeatured } = await req.json()
        
    const property = await prisma.property.update({
      where: { id },
      data: { isFeatured }
    })

    return NextResponse.json(property)
  } catch (error) {
    return NextResponse.json({ error: "Kļūda mainot izceltā statusu" }, { status: 500 })
  }
}
