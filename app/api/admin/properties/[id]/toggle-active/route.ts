import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const { isActive } = await req.json()
    
    const property = await prisma.property.update({
      where: { id: params.id },
      data: { isActive }
    })

    return NextResponse.json(property)
  } catch (error) {
    return NextResponse.json({ error: "Kļūda mainot statusu" }, { status: 500 })
  }
}
