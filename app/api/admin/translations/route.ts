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
  
  if (key.startsWith('Testimonials.')) {
    // Ja mēs atjauninām statiskās atslēgas 
    if (locale === "lv") {
      if (key === "Testimonials.defaultHeading" || key === "Testimonials.defaultSubheading") {
        // Šīs ir statiskās atslēgas, tās nerada izmaiņas datu bāzē
        // Bet mēs varam pievienot loģiku, ja nepieciešams
      }
      
      // Ja atjauninām konkrētās atsauksmes
      if (key.includes('testimonial') && (key.includes('Name') || key.includes('Message'))) {
        // Izvēlamies testimonials no datu bāzes
        const testimonials = await prisma.testimonial.findMany({
          orderBy: { createdAt: "desc" }
        })
        
        // Atrodam, kuru atsauksmi mēs rediģējam
        const match = key.match(/testimonial(\d+)(Name|Message)/)
        if (match) {
          const index = parseInt(match[1], 10) - 1
          const field = match[2].toLowerCase() // 'name' vai 'message'
          
          if (index >= 0 && index < testimonials.length) {
            await prisma.testimonial.update({
              where: { id: testimonials[index].id },
              data: { [field]: value }
            })
          }
        }
      }
    }
  }

  if (key.startsWith('RecentSales.')) {
    // Ja mēs atjauninām statiskās atslēgas 
    if (locale === "lv") {
      if (key === "RecentSales.defaultHeading" || 
          key === "RecentSales.defaultSubheading" ||
          key === "RecentSales.statusSold" ||
          key === "RecentSales.statusActive" ||
          key === "RecentSales.viewMoreButton" ||
          key === "RecentSales.modalCloseButton" ||
          key === "RecentSales.noPropertiesText") {
        // Šīs ir statiskās atslēgas, tās nerada izmaiņas datu bāzē
        // Bet mēs varam pievienot loģiku, ja nepieciešams
      }
      
      // Ja atjauninām konkrētus īpašumus
      if (key.includes('property') && (
          key.includes('Title') || 
          key.includes('Price') || 
          key.includes('Size') || 
          key.includes('Type') || 
          key.includes('Floor') || 
          key.includes('Description')
        )) {
        // Izvēlamies soldProperties no datu bāzes
        const properties = await prisma.soldProperty.findMany({
          orderBy: { createdAt: "desc" }
        })
        
        // Atrodam, kuru īpašumu mēs rediģējam
        const match = key.match(/property(\d+)(Title|Price|Size|Type|Floor|Description)/)
        if (match) {
          const index = parseInt(match[1], 10) - 1
          const field = match[2].toLowerCase()
          
          // Mapping uz datu bāzes laukiem
          const fieldMap: Record<string, string> = {
            'title': 'title',
            'price': 'price', 
            'size': 'size',
            'type': 'series',
            'floor': 'floor',
            'description': 'description'
          }
          
          const dbField = fieldMap[field]
          
          if (index >= 0 && index < properties.length && dbField) {
            await prisma.soldProperty.update({
              where: { id: properties[index].id },
              data: { [dbField]: value }
            })
          }
        }
      }
    }
  }

  if (key.startsWith('StatsSection.')) {
    // Ja mēs atjauninām statiskās atslēgas 
    if (locale === "lv") {
      if (key === "StatsSection.defaultSubheading" || 
          key === "StatsSection.defaultHeading" ||
          key === "StatsSection.noStatsText") {
        // Šīs ir statiskās atslēgas, tās nerada izmaiņas datu bāzē
        // Bet mēs varam pievienot loģiku, ja nepieciešams
      }
      
      // Ja atjauninām konkrētās statistikas
      if (key.includes('stat') && (
          key.includes('Value') || 
          key.includes('Description') || 
          key.includes('Icon')
        )) {
        // Izvēlamies statistics no datu bāzes
        const statistics = await prisma.statistic.findMany({
          orderBy: { order: "asc" }
        })
        
        // Atrodam, kuru statistiku mēs rediģējam
        const match = key.match(/stat(\d+)(Value|Description|Icon)/)
        if (match) {
          const index = parseInt(match[1], 10) - 1
          const field = match[2].toLowerCase()
          
          // Mapping uz datu bāzes laukiem
          const fieldMap: Record<string, string> = {
            'value': 'value',
            'description': 'description', 
            'icon': 'icon'
          }
          
          const dbField = fieldMap[field]
          
          if (index >= 0 && index < statistics.length && dbField) {
            await prisma.statistic.update({
              where: { id: statistics[index].id },
              data: { [dbField]: value }
            })
          }
        }
      }
    }
  }

  if (key.startsWith('WhyChooseUs.')) {
    // Ja mēs atjauninām statiskās atslēgas vai punktus
    if (locale === "lv") {
      const whyChooseUsData = await prisma.whyChooseUs.findFirst()
      
      if (!whyChooseUsData) return NextResponse.json({ error: 'WhyChooseUs data not found' }, { status: 404 })
      
      if (key === "WhyChooseUs.defaultTitle") {
        await prisma.whyChooseUs.update({
          where: { id: whyChooseUsData.id },
          data: { title: value }
        })
      } else if (key === "WhyChooseUs.defaultButtonText") {
        await prisma.whyChooseUs.update({
          where: { id: whyChooseUsData.id },
          data: { buttonText: value }
        })
      } else if (key.startsWith("WhyChooseUs.point")) {
        // Atjaunojam konkrētu punktu
        const match = key.match(/point(\d+)/)
        if (match) {
          const index = parseInt(match[1], 10) - 1
          const points = Array.isArray(whyChooseUsData.points) ? [...whyChooseUsData.points] : []
          
          // Paplašinām masīvu, ja nepieciešams
          while (points.length <= index) {
            points.push("")
          }
          
          points[index] = value
          
          await prisma.whyChooseUs.update({
            where: { id: whyChooseUsData.id },
            data: { points }
          })
        }
      }
    }
  }

  if (key.startsWith('PartnersSection.')) {
    if (locale === "lv") {
      const partnersData = await prisma.partnersSection.findUnique({
        where: { id: "partners-section" }
      })
      
      if (!partnersData) return NextResponse.json({ error: 'PartnersSection data not found' }, { status: 404 })
      
      if (key === "PartnersSection.defaultTitle") {
        await prisma.partnersSection.update({
          where: { id: "partners-section" },
          data: { title: value }
        })
      } else if (key === "PartnersSection.defaultSubtitle") {
        await prisma.partnersSection.update({
          where: { id: "partners-section" },
          data: { subtitle: value }
        })
      }
    }
  }

  if (key.startsWith('ContactSection.')) {
    if (locale === "lv") {
      const contactData = await prisma.contactSettings.findFirst()
      
      if (!contactData) return NextResponse.json({ error: 'ContactSettings data not found' }, { status: 404 })
      
      if (key === "ContactSection.defaultHeading") {
        await prisma.contactSettings.update({
          where: { id: contactData.id },
          data: { heading: value }
        })
      } else if (key === "ContactSection.defaultSubtext") {
        await prisma.contactSettings.update({
          where: { id: contactData.id },
          data: { subtext: value }
        })
      }
      // Citas atslēgas (formNamePlaceholder, quiz1, utt.) ir tikai tulkojumi,
      // tās nerada izmaiņas datu bāzē
    }
  }
  
  // ========== FooterSection tulkojumi ==========
  if (key.startsWith('FooterSection.')) {
    if (locale === "lv") {
      const footerData = await prisma.footerSettings.findFirst()
      
      if (!footerData) return NextResponse.json({ error: 'FooterSettings data not found' }, { status: 404 })
      
      if (key === "FooterSection.defaultCompanyName") {
        await prisma.footerSettings.update({
          where: { id: footerData.id },
          data: { companyName: value }
        })
      } else if (key === "FooterSection.defaultDescription") {
        await prisma.footerSettings.update({
          where: { id: footerData.id },
          data: { description: value }
        })
      } else if (key === "FooterSection.copyrightText") {
        await prisma.footerSettings.update({
          where: { id: footerData.id },
          data: { copyrightText: value }
        })
      } else if (key === "FooterSection.defaultDeveloperName") {
        await prisma.footerSettings.update({
          where: { id: footerData.id },
          data: { developerName: value }
        })
      }

    }
  }

  if (key.startsWith('PropertyCategories.')) {
  if (locale === "lv") {
    // Ja atjauninām konkrēto kategoriju
    if (key.includes('category') && (key.includes('Name') || key.includes('Description'))) {
      // Izvēlamies kategorijas no datu bāzes
      const categories = await prisma.propertyCategory.findMany({
        orderBy: { order: 'asc' }
      })
      
      // Atrodam, kuru kategoriju mēs rediģējam
      const match = key.match(/category(\d+)(Name|Description)/)
      if (match) {
        const index = parseInt(match[1], 10) - 1
        const field = match[2].toLowerCase() // 'name' vai 'description'
        
        if (index >= 0 && index < categories.length) {
          await prisma.propertyCategory.update({
            where: { id: categories[index].id },
            data: { [field]: value }
          })
        }
      }
    }
  }
}
    
    return NextResponse.json(translation);
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
