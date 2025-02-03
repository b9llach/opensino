/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'mediumrare.imgix.net',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig; 