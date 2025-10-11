import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/user/settings'],
      },
    ],
    sitemap: 'https://animesenpai.app/sitemap.xml',
  }
}

