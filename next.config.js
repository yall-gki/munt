/** @type {import('next').NextConfig} */
const nextConfig = { 
  env: {
    REDIS_URL: process.env.REDIS_URL,
    REDIS_SECRET: process.env.REDIS_SECRET,CRON_SECRET : "s3cr3tXyz!@#"
  },
  images: {
    domains: [
      "uploadthing.com",
      "lh3.googleusercontent.com",
      "ethereum.org",
      "images.unsplash.com",
      "coin-images.coingecko.com",
    ],
  },
  experimental: {}, // Can be removed if empty
  compiler: {
    removeConsole: process.env.NODE_ENV === "production", // Optional
  },
  // turbo: false, // <-- Uncomment to temporarily use Webpack if Turbopack causes issues
};

module.exports = nextConfig;
