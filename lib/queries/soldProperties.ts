import { prisma } from "@/lib/prisma" // Izmantojam vienotu prisma importu

export async function getSoldProperties() {
  try {
    const properties = await prisma.soldProperty.findMany({
      orderBy: { createdAt: "desc" },
    })
    
    console.log('📊 getSoldProperties: Found', properties.length, 'properties');
    
    // Debug info
    properties.forEach((p, index) => {
      console.log(`   ${index + 1}. "${p.title}" - ${p.price} - Status: ${p.status}`);
    });
    
    return properties;
  } catch (error) {
    console.error('❌ Error fetching sold properties:', error);
    return [];
  }
}