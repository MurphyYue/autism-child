import { MetadataRoute } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://autism-child.vercel.app'

// Routes to include in sitemap
const routes = ['', '/profiles', '/scenarios', '/chat', '/scenarios/chat']

export default function sitemap(): MetadataRoute.Sitemap {
  const sitemap: MetadataRoute.Sitemap = []

  for (const route of routes) {
    // English version (/en prefix)
    sitemap.push({
      url: `${SITE_URL}/en${route}`,
      lastModified: new Date(),
      changeFrequency: route === '' ? ('weekly' as const) : ('monthly' as const),
      priority: route === '' ? 1 : 0.7,
      alternates: {
        languages: {
          en: `${SITE_URL}/en${route}`,
          zh: `${SITE_URL}${route}`,
        },
      },
    })

    // Chinese version (default, no prefix)
    sitemap.push({
      url: `${SITE_URL}${route}`,
      lastModified: new Date(),
      changeFrequency: route === '' ? ('weekly' as const) : ('monthly' as const),
      priority: route === '' ? 1 : 0.7,
      alternates: {
        languages: {
          en: `${SITE_URL}/en${route}`,
          zh: `${SITE_URL}${route}`,
        },
      },
    })
  }

  return sitemap
}
