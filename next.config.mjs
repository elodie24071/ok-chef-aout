/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '', // <-- Mets le port utilisé par ton MAMP (ex: 8888), ou enlève cette ligne si pas de port
        pathname: '/ok-chef-wp/wp-content/uploads/**',
      },
    ],
  },
};

export default nextConfig;
