/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  publicRuntimeConfig: {
    appName: 'OpenaiproxyWebsite'
  }, eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
