import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// GET pieprasījums - iegūst visus slaidus
export async function GET() {
  try {
    const slides = await prisma.slide.findMany({
      orderBy: { order: "asc" },
    })
    return new Response(JSON.stringify(slides), { status: 200 })
  } catch (error) {
    console.error("Error fetching slides", error)
    return new Response("Error fetching slides", { status: 500 })
  }
}

// POST pieprasījums - pievienot vai atjaunot slaidu
export async function POST(req: Request) {
  try {
    const data = await req.json()

    if (data.id) {
      // Ja ID ir, tad veicam atjaunināšanu (update)
      const updatedSlide = await prisma.slide.update({
        where: { id: data.id },
        data: {
          title: data.title,
          subtitle: data.subtitle,
          description: data.description,
          buttonText: data.buttonText,
          buttonLink: data.buttonLink,
          imageUrl: data.imageUrl || '', // Ja nav attēla URL, mēs atstājām to tukšu
          order: data.order || 0,
        },
      })
      return new Response(JSON.stringify(updatedSlide), { status: 200 })
    } else {
      // Ja nav ID, tad pievienojam jaunu slaidu (create)
      const newSlide = await prisma.slide.create({
        data: {
          title: data.title,
          subtitle: data.subtitle,
          description: data.description,
          buttonText: data.buttonText,
          buttonLink: data.buttonLink,
          imageUrl: data.imageUrl || '', // Ja nav attēla URL, mēs atstājām to tukšu
          order: data.order || 0,
        },
      })
      return new Response(JSON.stringify(newSlide), { status: 201 })
    }
  } catch (error) {
    console.error("Error creating or updating slide", error)
    return new Response("Server error", { status: 500 })
  }
}
