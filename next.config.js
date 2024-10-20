/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NODE_ENV === 'production'
          ? 'https://tcard-vercel.onrender.com/:path*'
          : 'http://localhost:5000/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
