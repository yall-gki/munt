/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    REDIS_URL: process.env.REDIS_URL,
    REDIS_SECRET: process.env.REDIS_SECRET,
  },
  images: {
    domains: ["uploadthing.com", "lh3.googleusercontent.com" ,"ethereum.org"],
  },
  experimental: {
    appDir: true,
  },
  swcMinify: true,
};

module.exports = nextConfig;
