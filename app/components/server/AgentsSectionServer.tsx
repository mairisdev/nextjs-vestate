import { getAgents } from "@/lib/queries/agents";
import { getTranslations } from "next-intl/server";
import AgentsSectionClient from "../AgentsSection";

export default async function AgentsSectionServer() {
  const agentsRaw = await getAgents();
  const t = await getTranslations("AgentsSection");

  const translations = {
    reviewsButton: t("reviewsButton"),
    noReviewsText: t("noReviewsText"),
    imageClickHint: t("imageClickHint"),
    agentImageAlt: t("agentImageAlt"),
  };

  const localizedAgents = agentsRaw.map((agent, index) => {
    const fallback = (key: string, defaultValue: string) => {
      try {
        return t(key);
      } catch {
        return defaultValue;
      }
    };

    return {
      ...agent,
      name: fallback(`agentName${index + 1}`, agent.name || ""),
      title: fallback(`agentTitle${index + 1}`, agent.title || ""),
    };
  });

  return <AgentsSectionClient agents={localizedAgents} translations={translations} />;
}
