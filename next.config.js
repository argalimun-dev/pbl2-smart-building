/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'picsum.photos', // untuk gambar contoh dari Picsum
      'gbflgmylrpjqmpszlvut.supabase.co', // domain Supabase kamu
    ],
  },
};

module.exports = nextConfig;
