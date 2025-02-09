/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true, // Disable default image optimization
  },
  assetPrefix: isProd ? '/connections-game/' : '',
  basePath: isProd ? '/connections-game' : '',
  output: 'export'
};

export default nextConfig;
