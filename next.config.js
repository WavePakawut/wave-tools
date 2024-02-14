/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';
const nextConfig = {
  /* config options here */
  output:'export',
  reactStrictMode: true,
  assetPrefix: isProd ? '/wave-tools' : '',
};

module.exports = nextConfig;
