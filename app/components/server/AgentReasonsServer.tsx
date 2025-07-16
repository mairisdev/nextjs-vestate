import { prisma } from '@/lib/prisma'
import { getSafeTranslations } from '@/lib/safeTranslations';
import AgentReasonsClient from '../AgentReasons';

async function getAgentReasonsData() {
  try {
    const data = await prisma.secondSection.findFirst()
    return data
  } catch (error) {
    console.error('Error fetching agent reasons data:', error)
    return null
  }
}

export default async function AgentReasonsServer() {
  const data = await getAgentReasonsData();
  const { safe } = await getSafeTranslations('AgentReasons');
  
  // Sakārtojam tulkojumus ar pareizajiem tipiem
  const translations = {
    defaultHeading: safe('defaultHeading', 'Kāpēc izvēlēties mūsu mākleri?'),
    defaultImageAlt: safe('defaultImageAlt', 'Mākleris pie darba'),
    reason1: safe('reason1', 'Profesionāla pieredze'),
    reason2: safe('reason2', 'Individuāla pieeja'),
    reason3: safe('reason3', 'Tirgus analīze'),
    reason4: safe('reason4', 'Juridiskā palīdzība'),
    reason5: safe('reason5', 'Komunikācija un atbalsts'),
    reason6: safe('reason6', 'Mārketinga stratēģijas'),
    reason7: safe('reason7', 'Sarunu vadīšana'),
    reason8: safe('reason8', 'Dokumentu kārtošana'),
    reason9: safe('reason9', 'Finansiāla konsultēšana'),
    reason10: safe('reason10', 'Pēcpārdošanas atbalsts'),
    reason11: safe('reason11', 'Ilgtermiņa sadarbība')
  };

  return (
    <AgentReasonsClient 
      data={data}
      translations={translations} 
    />
  );
}