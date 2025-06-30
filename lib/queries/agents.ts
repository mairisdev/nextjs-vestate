import { prisma } from "@/lib/prisma"

export async function getAgents() {
  try {
    const agents = await prisma.agent.findMany({
      orderBy: { name: "asc" },
    })

    return agents
  } catch (error) {
    console.error("Kļūda iegūstot aģentus:", error)
    return []
  }
}
