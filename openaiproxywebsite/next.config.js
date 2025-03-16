/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  publicRuntimeConfig: {
    appName: 'OpenaiproxyWebsite'
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  transpilePackages: ['@udecode/plate-math', 'katex'],
  webpack: (config, { dev, isServer }) => {
    // Remove the custom webpack rule for katex.min.css that we added earlier
    config.module.rules = config.module.rules.filter(rule => 
      !(rule.test && rule.test.toString().includes('katex.min.css'))
    );
    
    return config;
  },
}

module.exports = nextConfig
