import AgentsSectionClient from "../AgentsSection"
import { getAgents } from "@/lib/queries/agents"
import { getTranslations } from 'next-intl/server';

export default async function AgentsSectionServer() {
  const agents = await getAgents()
  const t = await getTranslations('AgentsSection');
  
  const translations = {
    sectionTitle: t('sectionTitle'),
    reviewsButton: t('reviewsButton'), 
    noReviewsText: t('noReviewsText'),
    imageClickHint: t('imageClickHint'),
    agentImageAlt: t('agentImageAlt'),
    Amats1: t('Amats1'),
    Amats2: t('Amats2'),
    Amats3: t('Amats3'),
  };

  return <AgentsSectionClient agents={agents} translations={translations} />
}
