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
      // Update existing slide
      slide = await prisma.slide.update({
        where: { id: data.id },
        data: {
          title: data.title,
          subtitle: data.subtitle,
          description: data.description,
          buttonText: data.buttonText,
          buttonLink: data.buttonLink,
          imageUrl: data.imageUrl,
          order: data.order ?? 0, // Pārbaudām vai ir order, ja nav - 0
        },
      })
    } else {
      // Create new slide
      // Automātiski iestatām order kā nākamo lielāko numuru
      const maxOrder = await prisma.slide.findFirst({
        orderBy: { order: 'desc' },
        select: { order: true }
      })
      
      const nextOrder = (maxOrder?.order ?? 0) + 1

      slide = await prisma.slide.create({
        data: {
          title: data.title || "Jauns slaids",
          subtitle: data.subtitle || "Apakšvirsraksts",
          description: data.description || "Apraksts",
          buttonText: data.buttonText || "Pogas teksts",
          buttonLink: data.buttonLink || "",
          imageUrl: data.imageUrl || "/placeholder.jpg",
          order: data.order ?? nextOrder, // Izmantojam nākamo secību
        },
      })
    }

    // Sync translations if function exists
    if (typeof syncSlideTranslations === 'function') {
      await syncSlideTranslations(slide)
    }

    return new Response(JSON.stringify(slide), { status: 200 })
  } catch (error) {
    console.error("Error saving slide", error)
    return new Response(`Error saving slide: ${error}`, { status: 500 })
  }
}