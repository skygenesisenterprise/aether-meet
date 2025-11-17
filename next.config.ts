import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuration pour un développement avec URL personnalisée
  async rewrites() {
    return [
      // Rediriger localhost:3000 vers aether-meet.local:3000
      {
        source: '/:path*',
        destination: 'http://meet.local:3000/:path*',
      },
    ];
  },
  
  // Configuration pour le déploiement
  assetPrefix: process.env.NODE_ENV === 'production' ? undefined : '',
  
  // Optimisation des images et assets
  images: {
    domains: ['localhost'],
  },
  
  // Configuration des en-têtes pour la sécurité
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
