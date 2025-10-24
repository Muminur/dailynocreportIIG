/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['graph.microsoft.com'],
  },
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    GRAPH_API_ENDPOINT: process.env.GRAPH_API_ENDPOINT || 'https://graph.microsoft.com/v1.0',
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;

