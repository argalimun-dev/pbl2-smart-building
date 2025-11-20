/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "gbflgmylrpjqmpszlvut.supabase.co",
      },
    ],
  },
};

module.exports = nextConfig;
