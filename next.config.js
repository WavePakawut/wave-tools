/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  output:'export',
  reactStrictMode: true,
  assetPrefix: isProd ? '/wave-tools' : '',
};

module.exports = nextConfig;
