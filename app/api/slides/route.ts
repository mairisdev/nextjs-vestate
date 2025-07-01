import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

// GET endpoint to fetch all slides
export async function GET() {
  try {
    const slides = await prisma.slide.findMany({
      orderBy: { order: "asc" }, // Atgriež slaidus pēc secības
    })
    return new Response(JSON.stringify(slides), { status: 200 })
  } catch (error) {
    console.error("Error fetching slides", error)
    return new Response("Error fetching slides", { status: 500 })
  }
}

// POST endpoint to create or update a slide
export async function POST(req: Request) {
  try {
    const data = await req.json()
    
    // Atjaunojam esošo slaidu vai pievienojam jaunu
    if (data.id) {
      const updatedSlide = await prisma.slide.update({
        where: { id: data.id },
        data: {
          title: data.title,
          subtitle: data.subtitle,
          description: data.description,
          buttonText: data.buttonText,
          buttonLink: data.buttonLink,
          imageUrl: data.imageUrl || '',
          order: data.order || 0, // Saglabājam secību
        },
      })
      return new Response(JSON.stringify(updatedSlide), { status: 200 })
    } else {
      const newSlide = await prisma.slide.create({
        data: {
          title: data.title,
          subtitle: data.subtitle,
          description: data.description,
          buttonText: data.buttonText,
          buttonLink: data.buttonLink,
          imageUrl: data.imageUrl || '',
          order: data.order || 0, // Saglabājam secību
        },
      })
      return new Response(JSON.stringify(newSlide), { status: 201 })
    }
  } catch (error) {
    console.error("Error creating or updating slide", error)
    return new Response("Server error", { status: 500 })
  }
}
