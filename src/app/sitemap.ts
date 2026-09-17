import { MetadataRoute } from 'next';
import { blogPosts } from '@/lib/blog-data';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://www.playpredictwin.com';
  const now = new Date();

  const coreRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/fixtures`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/results`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${base}/leaderboard`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${base}/prizes`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/supporter-league`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/leagues`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/faq`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/recommended-sites`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${base}/partners`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${base}/media-pack`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${base}/vip-league`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
  ];

  const blogRoutes: MetadataRoute.Sitemap = blogPosts.map(post => ({
    url: `${base}/blog/${post.slug}`,
    lastModified: new Date(post.dateIso),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...coreRoutes, ...blogRoutes];
}