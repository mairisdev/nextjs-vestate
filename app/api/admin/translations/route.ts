import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

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
        key_locale: { key, locale }
      },
      update: { value, category },
      create: { key, locale, value, category }
    });

    return NextResponse.json(translation);
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
