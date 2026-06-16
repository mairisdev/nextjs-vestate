import {NextConfig} from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

// S3 publiskā hostname (no S3_PUBLIC_URL vai no bucket+region)
const s3Host = process.env.S3_PUBLIC_URL
  ? new URL(process.env.S3_PUBLIC_URL).hostname
  : process.env.S3_BUCKET_NAME && process.env.S3_REGION
    ? `${process.env.S3_BUCKET_NAME}.s3.${process.env.S3_REGION}.amazonaws.com`
    : undefined;

const nextConfig: NextConfig = {
  serverExternalPackages: ['sharp'],
  compiler: {
    // Production būvē noņem visus console.* izsaukumus (saglabā error/warn)
    removeConsole: process.env.NODE_ENV === 'production'
      ? { exclude: ['error', 'warn'] }
      : false,
  },
  images: {
    remotePatterns: [
      ...(s3Host
        ? [{ protocol: 'https' as const, hostname: s3Host, port: '', pathname: '/**' }]
        : []),
      // Vispārīgs S3 fallback (ja hostname nav zināms build laikā)
      { protocol: 'https' as const, hostname: '*.s3.amazonaws.com', port: '', pathname: '/**' },
      { protocol: 'https' as const, hostname: 's3.amazonaws.com', port: '', pathname: '/**' },
    ],
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
