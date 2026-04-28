import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'OMA Digital',
    short_name: 'OMA Digital',
    description:
      "OMA Digital, agence spécialisée en création de sites web, applications mobiles et automatisation IA au Sénégal.",
    start_url: '/fr',
    display: 'standalone',
    background_color: '#0a0a12',
    theme_color: '#0a0a12',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  };
}
