import {NextConfig} from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  experimental: {
    // Kritiski Vercel deployment
    dynamicIO: false,
    reactCompiler: false,
    // Izslēgt serverComponentsExternalPackages kas rada problēmas
    serverComponentsExternalPackages: [],
  },
  // Vercel-specific konfigurācija
  outputFileTracing: true,
  images: {
    domains: ['res.cloudinary.com', 'images.unsplash.com'],
    unoptimized: false,
  },
  // Eksplicitā konfigurācija React 19 un Next.js 15
  reactStrictMode: true,
  swcMinify: true,
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);