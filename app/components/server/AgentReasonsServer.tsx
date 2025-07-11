import { getTranslations } from 'next-intl/server';
import AgentReasonsClient from '../AgentReasons';

async function getAgentReasonsData() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/second-section`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch agent reasons data');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching agent reasons data:', error);
    return null;
  }
}

export default async function AgentReasonsServer() {
  const data = await getAgentReasonsData();
  const t = await getTranslations('AgentReasons');
  
  // Sagatavo tulkojumus
  const translations = {
    defaultHeading: t('defaultHeading'),
    defaultImageAlt: t('defaultImageAlt'),
    // Iespējami reasons tulkojumi (ja vēlaties tos arī tulkot)
    reason1: t('reason1'),
    reason2: t('reason2'),
    reason3: t('reason3'),
    reason4: t('reason4'),
    reason5: t('reason5'),
    reason6: t('reason6'),
    reason7: t('reason7'),
    reason8: t('reason8'),
    reason9: t('reason9'),
    reason10: t('reason10'),
    reason11: t('reason11'),
  };

  return (
    <AgentReasonsClient 
      data={data}
      translations={translations} 
    />
  );
}