import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { Slide, FirstSection, SevenSection } from "@prisma/client"

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const locale = searchParams.get('locale');

    const where: any = {};
    if (category) where.category = category;
    if (locale) where.locale = locale;

    const translations = await prisma.translation.findMany({
      where,
      orderBy: { key: 'asc' }
    });

    return NextResponse.json(translations);
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { key, locale, value, category } = await request.json();

    const translation = await prisma.translation.upsert({
      where: {
        unique_translation: { key, locale }
      },
      update: { value, category },
      create: { key, locale, value, category }
    });
    
    if (key.startsWith('HeroSlider.default')) {
      const parts = key.split('.');
      const field = parts[1];
    
      const fieldMap: Record<string, keyof Slide> = {
        defaultTitle: 'title',
        defaultSubtitle: 'subtitle',
        defaultDescription: 'description',
        defaultButtonText: 'buttonText'
      };
    
      const slide = await prisma.slide.findFirst(); // pieņemam vienu slaidu
    
      if (slide && fieldMap[field]) {
        await prisma.slide.update({
          where: { id: slide.id },
          data: {
            [fieldMap[field]]: value  // ⚠️ pārraksta tikai LV versiju
          }
        });
      }
    }

    if (key.startsWith('FirstSection.default')) {
      const parts = key.split('.');
      const field = parts[1];
    
      const fieldMap: Record<string, keyof FirstSection> = {
        defaultHeadline: 'headline',
        defaultButtonText: 'buttonText',
        defaultButtonLink: 'buttonLink'
      };
    
      const section = await prisma.firstSection.findFirst();
    
      if (section && fieldMap[field]) {
        await prisma.firstSection.update({
          where: { id: section.id },
          data: {
            [fieldMap[field]]: value
          }
        });
      }
    }

    if (key.startsWith('AgentReasons.reason') || key.startsWith('AgentReasons.defaultHeading')) {
      const section = await prisma.secondSection.findFirst();
      if (!section) return NextResponse.json({ error: 'Section not found' }, { status: 404 });
    
      // Nodrošinām, ka reasons ir masīvs
      const reasons = Array.isArray(section.reasons) ? [...section.reasons] : [];
    
      if (locale === "lv") {
        if (key === "AgentReasons.defaultHeading") {
          await prisma.secondSection.update({
            where: { id: section.id },
            data: { heading: value }
          });
        } else if (key.startsWith("AgentReasons.reason")) {
          const match = key.match(/reason(\d+)/);
          const index = match ? parseInt(match[1], 10) - 1 : -1;
    
          if (index >= 0) {
            // Paplašinām, ja nepieciešams
            while (reasons.length <= index) {
              reasons.push("");
            }
            reasons[index] = value;
    
            await prisma.secondSection.update({
              where: { id: section.id },
              data: { reasons }
            });
          }
        }
      }
    }
    
    if (key.startsWith('LegalConsultSection2.default')) {
      const parts = key.split('.');
      const field = parts[1];
    
      const fieldMap: Record<string, keyof SevenSection> = {
        defaultTitle: 'title',
        defaultButtonText: 'buttonText',
      };
    
      const section = await prisma.sevenSection.findFirst();
      if (section && fieldMap[field]) {
        await prisma.sevenSection.update({
          where: { id: section.id },
          data: {
            [fieldMap[field]]: value,
          },
        });
      }
    }

  if (key.startsWith('ServicesSection.')) {
    const section = await prisma.thirdSection.findUnique({
      where: { id: "third-section" },
    })
    if (!section) return NextResponse.json({ error: 'Section not found' }, { status: 404 })

    const updatedSection = { ...section }

    if (locale === "lv") {
      if (key === "ServicesSection.defaultHeading") {
        updatedSection.heading = value
      } else if (key === "ServicesSection.defaultSubheading") {
        updatedSection.subheading = value
      } else if (key.startsWith("ServicesSection.service")) {
        const match = key.match(/service(\d+)/)
        const index = match ? parseInt(match[1], 10) - 1 : -1

        if (index >= 0) {
          const updatedServices = Array.isArray(section.services)
            ? [...section.services]
            : []

          while (updatedServices.length <= index) {
            updatedServices.push("")
          }

          updatedServices[index] = value
          updatedSection.services = updatedServices
        }
      }

      await prisma.thirdSection.update({
        where: { id: section.id },
        data: updatedSection,
      })
    }
  }

  if (key.startsWith("Navbar.Navlink")) {
    const match = key.match(/Navlink(\d+)/)
    const index = match ? parseInt(match[1], 10) - 1 : -1
  
    const settings = await prisma.navigationSettings.findFirst()
    if (!settings || index < 0) return NextResponse.json({ error: "Invalid index" }, { status: 400 })

    if (locale === "lv") {
      const menuItems = Array.isArray(settings.menuItems) ? settings.menuItems : [];
      const updatedMenu = [...menuItems];

      while (updatedMenu.length <= index) {
        updatedMenu.push({ label: "", link: "", isHighlighted: false, isVisible: true });
      }

      if (
        typeof updatedMenu[index] === "object" &&
        updatedMenu[index] !== null &&
        "label" in updatedMenu[index]
      ) {
        (updatedMenu[index] as { label: string }).label = value;
      } else {
        updatedMenu[index] = { label: value, link: "", isHighlighted: false, isVisible: true };
      }

      await prisma.navigationSettings.update({
        where: { id: settings.id },
        data: { menuItems: updatedMenu },
      })
    }
  }
  
  if (key.startsWith("AgentsSection.agentName") || key.startsWith("AgentsSection.agentTitle")) {
    const match = key.match(/agent(Name|Title)(\\d+)/)
    const field = match?.[1] === "Name" ? "name" : "title"
    const index = match ? parseInt(match[2], 10) - 1 : -1
  
    if (locale === "lv" && index >= 0) {
      const agents = await prisma.agent.findMany({ orderBy: { createdAt: "asc" } })
      if (index < agents.length) {
        const agent = agents[index]
        await prisma.agent.update({
          where: { id: agent.id },
          data: { [field]: value }
        })
      }
    }
  }  
    
    return NextResponse.json(translation);
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
