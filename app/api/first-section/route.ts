import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const section = await prisma.firstSection.findFirst()
    return new Response(JSON.stringify(section), { status: 200 })
  } catch (error) {
    console.error("Error fetching first section:", error)
    return new Response("Error fetching first section", { status: 500 })
  }
}

export async function POST(req: Request) {
  const data = await req.json()
  let { headline, buttonText, buttonLink, backgroundImage } = data

  // Pārbaudām, vai dati ir pieejami un aizstāj ar tukšām vērtībām, ja nepieciešams
  headline = headline || ""
  buttonText = buttonText || ""
  buttonLink = buttonLink || ""

  try {
    const updatedSection = await prisma.firstSection.upsert({
      where: { id: 'cmchdj0eg0001mc2cmvk7g7mc' },  // Unique ID for the first section
      update: {
        headline,
        buttonText,
        buttonLink,
        backgroundImage,
      },
      create: {
        id: 'cmchdj0eg0001mc2cmvk7g7mc',
        headline,
        buttonText,
        buttonLink,
        backgroundImage,
      },
    })
    return new Response(JSON.stringify(updatedSection), { status: 200 })
  } catch (error) {
    console.error("Error updating first section:", error)
    return new Response("Server error", { status: 500 })
  }
}
