import { PrismaClient } from "@prisma/client"
import { syncSlideTranslations } from "@/lib/translationSync"

const prisma = new PrismaClient()

// GET endpoint to fetch all slides
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

export async function POST(req: Request) {
  try {
    const data = await req.json()

    let slide

    if (data.id) {
      slide = await prisma.slide.update({
        where: { id: data.id },
        data: {
          title: data.title,
          subtitle: data.subtitle,
          description: data.description,
          buttonText: data.buttonText,
          buttonLink: data.buttonLink,
          imageUrl: data.imageUrl,
          order: data.order,
        },
      })
    } else {
      slide = await prisma.slide.create({
        data: {
          title: data.title,
          subtitle: data.subtitle,
          description: data.description,
          buttonText: data.buttonText,
          buttonLink: data.buttonLink,
          imageUrl: data.imageUrl,
          order: data.order,
        },
      })
    }

    await syncSlideTranslations(slide)

    return new Response(JSON.stringify(slide), { status: 200 })
  } catch (error) {
    console.error("Error saving slide", error)
    return new Response("Error saving slide", { status: 500 })
  }
}
