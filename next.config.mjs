/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'elodie.techniques-graphiques.be',
        port: '',
        pathname: '/ok-chef-wp/wp-content/uploads/**',
      },
    ],
  },
};

export default nextConfig;
