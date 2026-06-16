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
    sectionBadge: safe("sectionBadge", "Pieredzes un profesionalitātes apvienojums"),
    sectionHeading: safe("sectionHeading", "MŪSU LABĀKIE SPECIĀLISTI"),
    reviewsButton: safe("reviewsButton", "Skatīt atsauksmes"),
    noReviewsText: safe("noReviewsText", "Nav atsauksmju"),
    imageClickHint: safe("imageClickHint", "Klikšķiniet, lai redzētu atsauksmes"),
    agentImageAlt: safe("agentImageAlt", "Aģenta foto")
  };

  // Vārdu un amatu ņemam tieši no aģenta DB ieraksta, lai vārds, amats, foto un
  // tālrunis vienmēr nāk no viena un tā paša ieraksta (citādi tulkojumu atslēgas
  // sajaucās ar foto). Amatu var pārtulkot ar agentTitleN atslēgu, ja tā aizpildīta.
  const localizedAgents = agentsRaw.map((agent, index) => {
    const titleKey = `agentTitle${index + 1}`;
    const tTitle = safe(titleKey, "");
    const title = tTitle && tTitle !== titleKey ? tTitle : (agent.title || "Nekustamo īpašumu speciālists");
    return {
      ...agent,
      name: agent.name || `Aģents ${index + 1}`,
      title,
    };
  });

  return <AgentsSectionClient agents={localizedAgents} translations={translations} />;
}