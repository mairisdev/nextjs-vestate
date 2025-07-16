import { prisma } from '@/lib/prisma'
import { getSafeTranslations } from "@/lib/safeTranslations";
import AgentsSectionClient from "../AgentsSection";

export default async function AgentsSectionServer() {
  const agentsRaw = await prisma.agent.findMany({
  include: {
    reviews: true,
  },
  orderBy: {
    createdAt: "asc",
  },
})
  
  // Drošie tulkojumi
  const { safe } = await getSafeTranslations("AgentsSection");
  
  // Sakārtojam tulkojumus ar pareizajiem tipiem
  const translations = {
    reviewsButton: safe("reviewsButton", "Skatīt atsauksmes"),
    noReviewsText: safe("noReviewsText", "Nav atsauksmju"),
    imageClickHint: safe("imageClickHint", "Klikšķiniet, lai redzētu atsauksmes"),
    agentImageAlt: safe("agentImageAlt", "Aģenta foto")
  };
  
  const localizedAgents = agentsRaw.map((agent, index) => {
    return {
      ...agent,
      name: safe(`agentName${index + 1}`, agent.name || `Aģents ${index + 1}`),
      title: safe(`agentTitle${index + 1}`, agent.title || "Nekustamo īpašumu aģents"),
    };
  });

  return <AgentsSectionClient agents={localizedAgents} translations={translations} />;
}