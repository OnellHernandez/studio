import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Added for Firebase Studio development environment
  experimental: {
    allowedDevOrigins: [
      'https://*-idx-studio-*.cluster-pgviq6mvsncnqxx6kr7pbz65v6.cloudworkstations.dev',
 'https://3010-idx-studio-1745978399410.cluster-pgviq6mvsncnqxx6kr7pbz65v6.cloudworkstations.dev'
    ],
  },
};

export default nextConfig;
