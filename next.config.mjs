// import webpack from 'webpack';

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {},
  images: {
    remotePatterns: [],
  },
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "node:crypto": "crypto",
      "node:http": "http",
      "node:https": "https",
    };
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: false,
        http: false,
        https: false,
      };
    }
    return config;
  },
};

export default nextConfig;