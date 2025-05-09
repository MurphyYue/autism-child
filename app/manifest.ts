import type { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'StarCat',
    short_name: 'StarCat',
    description: 'communicate with your simulated star cat',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    // theme_color: '#000000',
    icons: [
      {
        src: '/images/logo-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: '/images/logo-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable'
      },
    ],
  }
}