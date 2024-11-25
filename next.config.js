/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // This will ignore the warnings about missing vendor chunks
    config.infrastructureLogging = {
      level: 'error',
    }
    config.module.rules.push({
      test: /\.css$/,
      use: [
        'style-loader',
        'css-loader',
        'postcss-loader',
      ],
    })
    return config
  },
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
  images: {
    domains: ['utfs.io'],
  },
};

module.exports = nextConfig
