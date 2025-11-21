import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuration pour le développement local
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  
  // Transpiler les packages nécessaires
  transpilePackages: ['@heroicons/react'],
  
  // Configuration des images pour localhost
  images: {
    domains: ['localhost', '127.0.0.1'],
    unoptimized: true,
  },
  
  // Configuration du serveur de développement
  devIndicators: {
    buildActivity: false,
  },
  
  // Configuration des en-têtes pour le développement
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
